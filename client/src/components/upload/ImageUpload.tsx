import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X } from 'lucide-react';

interface PreviewImage {
  file: File;
  url: string;
  title: string;
  tags: string;
  album_id?: string;
}

export const ImageUpload = () => {
  const [previews, setPreviews] = React.useState<PreviewImage[]>([]);
  const [albums, setAlbums] = React.useState([]);
  const [uploading, setUploading] = React.useState(false);

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
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      if (file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
        const url = URL.createObjectURL(file);
        const preview: PreviewImage = {
          file,
          url,
          title: file.name.split('.')[0],
          tags: '',
        };
        setPreviews(prev => [...prev, preview]);
      }
    });
  };

  const updatePreview = (index: number, field: string, value: string) => {
    setPreviews(prev => prev.map((preview, i) => 
      i === index ? { ...preview, [field]: value } : preview
    ));
  };

  const removePreview = (index: number) => {
    setPreviews(prev => {
      const updated = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index].url);
      return updated;
    });
  };

  const handleUpload = async () => {
    if (previews.length === 0) return;

    setUploading(true);
    
    for (const preview of previews) {
      const formData = new FormData();
      formData.append('image', preview.file);
      formData.append('title', preview.title);
      formData.append('tags', preview.tags);
      if (preview.album_id) {
        formData.append('album_id', preview.album_id);
      }

      try {
        await fetch('/api/images/upload', {
          method: 'POST',
          body: formData,
        });
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }

    setPreviews([]);
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">
              Drag and drop images here, or click to select files
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <Button asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                Choose Files
              </label>
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Maximum 5MB per file. Supported: JPG, PNG, GIF
            </p>
          </div>
        </CardContent>
      </Card>

      {previews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Image Previews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {previews.map((preview, index) => (
                <div key={index} className="flex gap-4 p-4 border rounded-lg">
                  <img
                    src={preview.url}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor={`title-${index}`}>Title</Label>
                      <Input
                        id={`title-${index}`}
                        value={preview.title}
                        onChange={(e) => updatePreview(index, 'title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`tags-${index}`}>Tags</Label>
                      <Input
                        id={`tags-${index}`}
                        value={preview.tags}
                        onChange={(e) => updatePreview(index, 'tags', e.target.value)}
                        placeholder="nature, landscape, vacation"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`album-${index}`}>Album</Label>
                      <Select onValueChange={(value) => updatePreview(index, 'album_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select album (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {albums.map((album: any) => (
                            <SelectItem key={album.id} value={album.id.toString()}>
                              {album.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removePreview(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button onClick={handleUpload} disabled={uploading} className="w-full">
                {uploading ? 'Uploading...' : `Upload ${previews.length} Image${previews.length > 1 ? 's' : ''}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};