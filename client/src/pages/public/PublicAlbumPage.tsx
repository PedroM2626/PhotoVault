import * as React from 'react';
import { useParams } from 'react-router-dom';
import { ImageGrid } from '../../components/gallery/ImageGrid';
import { SearchBar } from '../../components/gallery/SearchBar';
import { SortControls } from '../../components/gallery/SortControls';

export const PublicAlbumPage = () => {
  const { id } = useParams();
  const [album, setAlbum] = React.useState(null);
  const [images, setImages] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState('date_desc');

  React.useEffect(() => {
    loadPublicAlbum();
  }, [id, sortBy]);

  const loadPublicAlbum = async () => {
    try {
      const response = await fetch(`/api/public/albums/${id}?sort=${sortBy}`);
      if (response.ok) {
        const data = await response.json();
        setAlbum(data.album);
        setImages(data.images || []);
      }
    } catch (error) {
      console.error('Failed to load public album:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = images.filter(image =>
    image.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.tags?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!album) {
    return <div className="min-h-screen flex items-center justify-center">Album not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">PhotoVault</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{album.name}</h1>
          {album.description && (
            <p className="text-gray-600">{album.description}</p>
          )}
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
            <SortControls value={sortBy} onChange={setSortBy} />
          </div>
        </div>
        
        <ImageGrid images={filteredImages} />
      </main>
    </div>
  );
};