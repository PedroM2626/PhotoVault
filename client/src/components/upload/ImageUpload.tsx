import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';

interface PreviewImage {
  file: File;
  url: string;
  title: string;
  tags: string;
  album_id?: string;
  uploaded?: boolean;
  error?: string;
}

export const ImageUpload = () => {
  const [previews, setPreviews] = React.useState<PreviewImage[]>([]);
  const [albums, setAlbums] = React.useState([]);
  const [uploading, setUploading] = React.useState(false);
  const [uploadComplete, setUploadComplete] = React.useState(false);

  React.useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      const response = await fetch('/api/albums', {
        credentials: 'include',
      });
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
      } else {
        alert(`File "${file.name}" is either not an image or exceeds 5MB limit.`);
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
    setUploadComplete(false);
    
    const updatedPreviews = [...previews];
    
    for (let i = 0; i < previews.length; i++) {
      const preview = previews[i];
      const formData = new FormData();
      formData.append('image', preview.file);
      formData.append('title', preview.title);
      formData.append('tags', preview.tags);
      if (preview.album_id) {
        formData.append('album_id', preview.album_id);
      }

      try {
        const response = await fetch('/api/images/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        
        if (response.ok) {
          updatedPreviews[i] = { ...updatedPreviews[i], uploaded: true };
        } else {
          const errorData = await response.json();
          updatedPreviews[i] = { 
            ...updatedPreviews[i], 
            error: errorData.error || 'Upload failed' 
          };
        }
      } catch (error) {
        console.error('Upload failed:', error);
        updatedPreviews[i] = { 
          ...updatedPreviews[i], 
          error: 'Network error during upload' 
        };
      }
      
      setPreviews([...updatedPreviews]);
    }

    setUploading(false);
    setUploadComplete(true);
    
    // Auto-clear successful uploads after 3 seconds
    setTimeout(() => {
      setPreviews(prev => prev.filter(p => !p.uploaded));
      setUploadComplete(false);
    }, 3000);
  };

  const clearAll = () => {
    previews.forEach(preview => URL.revokeObjectURL(preview.url));
    setPreviews([]);
    setUploadComplete(false);
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
              disabled={uploading}
            />
            <Button asChild disabled={uploading}>
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
            <div className="flex justify-between items-center">
              <CardTitle>Image Previews</CardTitle>
              {!uploading && (
                <Button variant="outline" onClick={clearAll}>
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {previews.map((preview, index) => (
                <div key={index} className="flex gap-4 p-4 border rounded-lg">
                  <div className="relative">
                    <img
                      src={preview.url}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded"
                    />
                    {preview.uploaded && (
                      <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {preview.error && (
                      <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1">
                        <AlertCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor={`title-${index}`}>Title</Label>
                      <Input
                        id={`title-${index}`}
                        value={preview.title}
                        onChange={(e) => updatePreview(index, 'title', e.target.value)}
                        disabled={uploading || preview.uploaded}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`tags-${index}`}>Tags</Label>
                      <Input
                        id={`tags-${index}`}
                        value={preview.tags}
                        onChange={(e) => updatePreview(index, 'tags', e.target.value)}
                        placeholder="nature, landscape, vacation"
                        disabled={uploading || preview.uploaded}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`album-${index}`}>Album</Label>
                      <Select 
                        onValueChange={(value) => updatePreview(index, 'album_id', value)}
                        disabled={uploading || preview.uploaded}
                      >
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
                    {preview.error && (
                      <div className="text-red-600 text-sm">{preview.error}</div>
                    )}
                  </div>
                  {!uploading && !preview.uploaded && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removePreview(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button 
                onClick={handleUpload} 
                disabled={uploading || uploadComplete} 
                className="w-full"
              >
                {uploading ? 'Uploading...' : 
                 uploadComplete ? 'Upload Complete!' : 
                 `Upload ${previews.length} Image${previews.length > 1 ? 's' : ''}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};