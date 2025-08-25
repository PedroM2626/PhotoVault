import * as React from 'react';
import { Header } from '../../components/layout/Header';
import { ImageUpload } from '../../components/upload/ImageUpload';

export const UploadPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Upload Images</h1>
        <ImageUpload />
      </main>
    </div>
  );
};