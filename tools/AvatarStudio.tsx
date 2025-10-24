// @google/genai Coding Guidelines:
// This file implements the Avatar Studio feature, which uses the Gemini Live API for real-time voice conversations.
// It handles microphone input, audio playback, and live transcription according to the API guidelines.

import React, { useState, useRef, useEffect, useCallback } from 'react';
// FIX: Removed non-existent 'LiveSession' type from import.
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Spinner } from '../components/Spinner';
import { UserHexagonIcon, MicIcon, MicOffIcon } from '../components/Icons';
import { decode, encode, decodeAudioData } from '../utils/audioUtils';

// A simple pulsating circle to represent the avatar 'speaking'
const SpeakingIndicator = ({ isSpeaking }: { isSpeaking: boolean }) => (
    <div className={`relative w-48 h-48 bg-gray-700 rounded-full flex items-center justify-center transition-all duration-300 ${isSpeaking ? 'scale-105' : ''}`}>
        <div className={`absolute inset-0 bg-blue-500 rounded-full transition-opacity duration-300 ${isSpeaking ? 'animate-pulse opacity-50' : 'opacity-0'}`}></div>
        <UserHexagonIcon className="w-24 h-24 text-gray-400 z-10" />
    </div>
);

export const AvatarStudio: React.FC = () => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [error, setError] = useState('');
    const [transcription, setTranscription] = useState<{ user: string, model: string }[]>([]);
    
    // FIX: Changed type from 'LiveSession' to 'any' as 'LiveSession' is not an exported member.
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef(0);
    const streamRef = useRef<MediaStream | null>(null);

    const stopPlayback = () => {
        audioSourcesRef.current.forEach(source => {
            try {
                source.stop();
            } catch (e) {
                console.warn("Audio source already stopped:", e);
            }
        });
        audioSourcesRef.current.clear();
        nextStartTimeRef.current = 0;
        setIsSpeaking(false);
    };

    const processAudio = useCallback(async (base64Audio: string) => {
        if (!outputAudioContextRef.current) return;
        setIsSpeaking(true);
        const ctx = outputAudioContextRef.current;
        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
        
        try {
            const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            
            source.onended = () => {
                audioSourcesRef.current.delete(source);
                if (audioSourcesRef.current.size === 0) {
                    setIsSpeaking(false);
                }
            };

            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            audioSourcesRef.current.add(source);
        } catch (e: any) {
            setError(`Error decoding audio: ${e.message}`);
            setIsSpeaking(false);
        }
    }, []);

    const startConversation = async () => {
        if (isRecording) return;
        setIsConnecting(true);
        setError('');
        setTranscription([]);

        if (!outputAudioContextRef.current) {
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setIsConnecting(false);
                        setIsRecording(true);
                        
                        inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
                        mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(stream);
                        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(f => f * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            
                            if (sessionPromiseRef.current) {
                                sessionPromiseRef.current.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            }
                        };
                        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent) {
                            if (message.serverContent.inputTranscription) {
                                const text = message.serverContent.inputTranscription.text;
                                setTranscription(prev => {
                                    const newHistory = [...prev];
                                    if (newHistory.length === 0 || newHistory[newHistory.length - 1].model !== '') {
                                        newHistory.push({ user: text, model: '' });
                                    } else {
                                        newHistory[newHistory.length - 1].user += text;
                                    }
                                    return newHistory;
                                });
                            }
                             if (message.serverContent.outputTranscription) {
                                const text = message.serverContent.outputTranscription.text;
                                setTranscription(prev => {
                                    const newHistory = [...prev];
                                    if (newHistory.length > 0) {
                                       newHistory[newHistory.length - 1].model += text;
                                    } else {
                                       newHistory.push({ user: '', model: text });
                                    }
                                    return newHistory;
                                });
                            }
                             if (message.serverContent.interrupted) {
                                stopPlayback();
                            }
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            await processAudio(base64Audio);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        setError(`Session error: ${e.message}`);
                        stopConversation();
                    },
                    onclose: () => {
                        stopConversation();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: 'You are Nolo, a friendly and enthusiastic AI persona. Keep your responses conversational and relatively brief.',
                },
            });
            await sessionPromiseRef.current;

        } catch (e: any) {
            setError(`Failed to start session: ${e.message}`);
            setIsConnecting(false);
        }
    };

    const stopConversation = useCallback(() => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close()).catch(console.error);
            sessionPromiseRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }

        stopPlayback();
        setIsRecording(false);
        setIsConnecting(false);
    }, []);

    useEffect(() => {
        return () => {
            stopConversation();
        };
    }, [stopConversation]);

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto items-center">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Avatar Studio</h1>
                <p className="text-gray-400">Have a real-time conversation with your AI persona.</p>
            </div>
            <SpeakingIndicator isSpeaking={isSpeaking} />
            <div className="my-8">
                <button
                    onClick={isRecording ? stopConversation : startConversation}
                    disabled={isConnecting}
                    className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 disabled:bg-gray-500 transition-colors flex items-center gap-3 text-lg"
                >
                    {isConnecting ? <Spinner size="sm" /> : isRecording ? <MicOffIcon /> : <MicIcon />}
                    {isConnecting ? 'Connecting...' : isRecording ? 'Stop Conversation' : 'Start Conversation'}
                </button>
            </div>
            
            <div className="w-full flex-grow bg-gray-800 rounded-lg border border-gray-700 p-4 overflow-y-auto">
                <h3 className="font-bold mb-2">Live Transcription</h3>
                {error && <p className="text-red-400">{error}</p>}
                {transcription.length === 0 && !isRecording && !isConnecting && <p className="text-gray-500">Click "Start Conversation" to begin.</p>}
                <div className="space-y-2 text-sm">
                    {transcription.map((turn, index) => (
                        <div key={index}>
                            <p><strong className="text-blue-400">You:</strong> {turn.user}</p>
                            <p><strong className="text-green-400">Nolo:</strong> {turn.model}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
