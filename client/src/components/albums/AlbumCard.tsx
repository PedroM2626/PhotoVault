import * as React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Lock, Images } from 'lucide-react';

interface Album {
  id: number;
  name: string;
  description: string;
  is_public: boolean;
  image_count: number;
  cover_image?: string;
}

interface AlbumCardProps {
  album: Album;
  onUpdated: () => void;
}

export const AlbumCard = ({ album, onUpdated }: AlbumCardProps) => {
  const toggleVisibility = async () => {
    try {
      const response = await fetch(`/api/albums/${album.id}/visibility`, {
        method: 'POST',
      });
      if (response.ok) {
        onUpdated();
      }
    } catch (error) {
      console.error('Failed to toggle album visibility:', error);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <Link to={`/album/${album.id}`}>
          <div className="relative h-48 bg-gray-200">
            {album.cover_image ? (
              <img
                src={album.cover_image}
                alt={album.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Images className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <div className="absolute top-2 right-2">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  toggleVisibility();
                }}
              >
                {album.is_public ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </Link>
        <div className="p-4">
          <h3 className="font-semibold text-lg truncate">{album.name}</h3>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{album.description}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-gray-500">
              {album.image_count} image{album.image_count !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-gray-400">
              {album.is_public ? 'Public' : 'Private'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};