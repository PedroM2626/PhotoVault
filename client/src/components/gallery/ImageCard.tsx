import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Eye } from 'lucide-react';

interface Image {
  id: number;
  title: string;
  thumbnail_path: string;
  medium_path: string;
  original_path: string;
  tags?: string;
  views: number;
  is_favorite: boolean;
}

interface ImageCardProps {
  image: Image;
}

export const ImageCard = ({ image }: ImageCardProps) => {
  const [isFavorite, setIsFavorite] = React.useState(image.is_favorite);

  const handleFavoriteToggle = async () => {
    try {
      const response = await fetch(`/api/images/${image.id}/favorite`, {
        method: 'POST',
      });
      if (response.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleImageClick = () => {
    // TODO: Open lightbox
    console.log('Open lightbox for image:', image.id);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div className="relative">
          <img
            src={image.thumbnail_path}
            alt={image.title}
            className="w-full h-48 object-cover cursor-pointer"
            onClick={handleImageClick}
          />
          <div className="absolute top-2 right-2">
            <Button
              size="sm"
              variant={isFavorite ? "default" : "outline"}
              onClick={handleFavoriteToggle}
              className="w-8 h-8 p-0"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-medium truncate">{image.title}</h3>
          <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {image.views}
            </div>
            {image.tags && (
              <span className="truncate max-w-24">#{image.tags}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};