import * as React from 'react';
import { Header } from '../../components/layout/Header';
import { AlbumGrid } from '../../components/albums/AlbumGrid';
import { CreateAlbumDialog } from '../../components/albums/CreateAlbumDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const AlbumsPage = () => {
  const [albums, setAlbums] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);

  React.useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/albums', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setAlbums(data.albums || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load albums');
      }
    } catch (error) {
      console.error('Failed to load albums:', error);
      setError('Failed to load albums');
    } finally {
      setLoading(false);
    }
  };

  const handleAlbumCreated = () => {
    setShowCreateDialog(false);
    loadAlbums();
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Albums</h1>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Album
          </Button>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading albums...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600">{error}</div>
            <button 
              onClick={loadAlbums}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <AlbumGrid albums={albums} onAlbumUpdated={loadAlbums} />
        )}

        <CreateAlbumDialog
          open={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          onCreated={handleAlbumCreated}
        />
      </main>
    </div>
  );
};