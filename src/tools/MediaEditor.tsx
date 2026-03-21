
import React, { useState } from 'react';
import Spinner from '../components/Spinner';
import { FileUploader } from '../components/FileUploader';
import { fileToBase64 } from '../utils/fileUtils';
import { VideoEditIcon } from '../components/Icons';
import { editImage } from '../services/geminiService';

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
      const data = await editImage(prompt, originalImage);
      setEditedImage(data);
    } catch (e: any) {
      setError(`An error occurred: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="text-center mb-8">
        <div className="inline-block bg-[hsl(var(--card))] p-3 rounded-full mb-2 text-[hsl(var(--primary))] border border-[hsl(var(--border))]"><VideoEditIcon /></div>
        <h1 className="text-3xl font-bold">Media Editor</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Modify images with simple text commands.</p>
      </div>

      <div className="bg-[hsl(var(--card))] p-6 rounded-[var(--radius)] border border-[hsl(var(--border))] space-y-6">
        <div className="grid md:grid-cols-2 gap-6 items-center">
            <FileUploader onFileSelect={handleFileSelect} accept="image/*" label="Upload Original Image" />
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-[hsl(var(--card-foreground))]">Edit Instruction</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Add a retro filter, or remove the person in the background"
                className="mt-1 block w-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] sm:text-sm h-28 resize-none"
                disabled={loading}
              />
            </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !originalImage || !prompt}
          className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {loading ? <Spinner size="sm" /> : 'Apply Edit'}
        </button>
      </div>
       {error && <p className="mt-4 text-red-400 text-center">{error}</p>}

      <div className="mt-8 grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-center">Original</h2>
          <div className="bg-[hsl(var(--card))] p-4 rounded-[var(--radius)] border border-[hsl(var(--border))] aspect-square flex items-center justify-center">
            {originalImage ? (
              <img src={originalImage.previewUrl} alt="Original" className="max-w-full max-h-full rounded-md" />
            ) : (
              <p className="text-[hsl(var(--muted-foreground))]">Upload an image to start</p>
            )}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4 text-center">Edited</h2>
          <div className="bg-[hsl(var(--card))] p-4 rounded-[var(--radius)] border border-[hsl(var(--border))] aspect-square flex items-center justify-center">
            {loading ? (
              <Spinner size="lg" />
            ) : editedImage ? (
              <img src={editedImage} alt="Edited" className="max-w-full max-h-full rounded-md" />
            ) : (
              <p className="text-[hsl(var(--muted-foreground))]">Your edited image will appear here</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
