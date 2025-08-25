import * as React from 'react';
import { AlbumCard } from './AlbumCard';

interface Album {
  id: number;
  name: string;
  description: string;
  is_public: boolean;
  image_count: number;
  cover_image?: string;
}

interface AlbumGridProps {
  albums: Album[];
  onAlbumUpdated: () => void;
}

export const AlbumGrid = ({ albums, onAlbumUpdated }: AlbumGridProps) => {
  if (albums.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No albums found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {albums.map((album) => (
        <AlbumCard key={album.id} album={album} onUpdated={onAlbumUpdated} />
      ))}
    </div>
  );
};