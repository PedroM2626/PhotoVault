import * as React from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { ImageGrid } from '../../components/gallery/ImageGrid';
import { SearchBar } from '../../components/gallery/SearchBar';
import { SortControls } from '../../components/gallery/SortControls';

export const GalleryPage = () => {
  const { id } = useParams();
  const [images, setImages] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState('date_desc');

  React.useEffect(() => {
    loadImages();
  }, [id, sortBy]);

  const loadImages = async () => {
    try {
      setLoading(true);
      setError('');
      
      const url = id ? `/api/albums/${id}/images` : '/api/images';
      const response = await fetch(`${url}?sort=${sortBy}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load images');
      }
    } catch (error) {
      console.error('Failed to load images:', error);
      setError('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = images.filter(image =>
    image.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.tags?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">
            {id ? 'Album Gallery' : 'My Gallery'}
          </h1>
          <div className="flex flex-col md:flex-row gap-4">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
            <SortControls value={sortBy} onChange={setSortBy} />
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading images...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600">{error}</div>
            <button 
              onClick={loadImages}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <ImageGrid images={filteredImages} />
        )}
      </main>
    </div>
  );
};