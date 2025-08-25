import * as React from 'react';
import { Header } from '../../components/layout/Header';
import { AlbumGrid } from '../../components/albums/AlbumGrid';
import { CreateAlbumDialog } from '../../components/albums/CreateAlbumDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const AlbumsPage = () => {
  const [albums, setAlbums] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);

  React.useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      const response = await fetch('/api/albums');
      if (response.ok) {
        const data = await response.json();
        setAlbums(data.albums || []);
      }
    } catch (error) {
      console.error('Failed to load albums:', error);
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
          <div className="text-center py-12">Loading...</div>
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