import { useState } from 'react';
import { OptimizedImage } from './OptimizedImage';

export function ImageUploadTest() {
  const [uploadedImage, setUploadedImage] = useState<{
    r2Key: string;
    title: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = (await response.json()) as any; // Quick fix for testing

      if (result.success) {
        setUploadedImage({
          r2Key: result.data.r2Key,
          title: result.data.title,
        });
      } else {
        alert('Upload failed: ' + result.message);
      }
    } catch (error) {
      alert('Upload error: ' + error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h2>Image Upload Test</h2>

      <form onSubmit={handleUpload}>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Image: <input type="file" name="image" accept="image/*" required />
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Contest ID:{' '}
            <input
              type="text"
              name="contestId"
              defaultValue="test-contest"
              required
            />
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Title:{' '}
            <input
              type="text"
              name="title"
              defaultValue="Test Image"
              required
            />
          </label>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Description:{' '}
            <input
              type="text"
              name="description"
              placeholder="Optional description"
            />
          </label>
        </div>
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </form>

      {uploadedImage && (
        <div style={{ marginTop: '20px' }}>
          <h3>Uploaded Image (Auto-optimized):</h3>
          <p>
            <strong>Title:</strong> {uploadedImage.title}
          </p>
          <p>
            <strong>R2 Key:</strong> {uploadedImage.r2Key}
          </p>
          <p>
            <em>
              Automatically optimized to max 1200px width, WebP format, quality
              85
            </em>
          </p>

          <OptimizedImage
            r2Key={uploadedImage.r2Key}
            alt={uploadedImage.title}
            className="uploaded-image"
          />
        </div>
      )}
    </div>
  );
}
