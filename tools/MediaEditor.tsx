
import React, { useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Spinner } from '../components/Spinner';
import { FileUploader } from '../components/FileUploader';
import { fileToBase64 } from '../utils/fileUtils';

interface ImageData {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

export const MediaEditor = () => {
  const [prompt, setPrompt] = useState('');
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (file: File) => {
    try {
      const base64 = await fileToBase64(file);
      const previewUrl = URL.createObjectURL(file);
      setOriginalImage({ base64, mimeType: file.type, previewUrl });
      setEditedImage(null); // Clear previous edit on new image upload
    } catch (e: any) {
      setError(`Error processing file: ${e.message}`);
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim() || !originalImage) {
      setError('Please upload an image and enter an edit prompt.');
      return;
    }
    setLoading(true);
    setError('');
    setEditedImage(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const imagePart = {
        inlineData: {
          data: originalImage.base64,
          mimeType: originalImage.mimeType,
        },
      };
      const textPart = { text: prompt };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });
      
      // FIX: Loop through parts to find image data, as per guidelines.
      let imageFound = false;
      if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            setEditedImage(`data:${part.inlineData.mimeType};base64,${base64ImageBytes}`);
            imageFound = true;
            break; 
          }
        }
      }
      
      if (!imageFound) {
        throw new Error("No image was generated. The model may not have been able to fulfill the request.");
      }

    } catch (e: any) {
      setError(`An error occurred: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Media Editor</h1>
        <p className="text-gray-400">Modify images with simple text commands.</p>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-6">
        <div className="grid md:grid-cols-2 gap-6 items-center">
            <FileUploader onFileSelect={handleFileSelect} accept="image/*" label="Upload Original Image" />
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">Edit Instruction</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Add a retro filter, or remove the person in the background"
                className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-28 resize-none"
                disabled={loading}
              />
            </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !originalImage || !prompt}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {loading ? <Spinner size="sm" /> : 'Apply Edit'}
        </button>
      </div>
       {error && <p className="mt-4 text-red-400 text-center">{error}</p>}

      <div className="mt-8 grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-center">Original</h2>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 aspect-square flex items-center justify-center">
            {originalImage ? (
              <img src={originalImage.previewUrl} alt="Original" className="max-w-full max-h-full rounded-md" />
            ) : (
              <p className="text-gray-500">Upload an image to start</p>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4 text-center">Edited</h2>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 aspect-square flex items-center justify-center">
            {loading ? (
              <Spinner size="lg" />
            ) : editedImage ? (
              <img src={editedImage} alt="Edited" className="max-w-full max-h-full rounded-md" />
            ) : (
              <p className="text-gray-500">Your edited image will appear here</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};