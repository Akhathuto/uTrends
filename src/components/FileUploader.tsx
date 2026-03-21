
import React from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept: string;
  label: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, accept, label }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileSelect(event.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-[hsl(var(--muted-foreground))] mb-2">{label}</label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[hsl(var(--border))] border-dashed rounded-[var(--radius)]">
        <div className="space-y-1 text-center">
          <svg className="mx-auto h-12 w-12 text-[hsl(var(--muted-foreground))]" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex text-sm text-[hsl(var(--muted-foreground))]">
            <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-[hsl(var(--primary))] hover:opacity-90 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-[hsl(var(--background))] focus-within:ring-[hsl(var(--primary))]">
              <span>Upload a file</span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" accept={accept} onChange={handleFileChange} />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))] opacity-80">
            {accept.includes('image') ? 'PNG, JPG, GIF up to 10MB' : 'MP4, MOV up to 50MB'}
          </p>
        </div>
      </div>
    </div>
  );
};
