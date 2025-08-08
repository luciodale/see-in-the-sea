import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import SubmissionGallery from '../../components/SubmissionGallery';

export const Route = createFileRoute('/user/submissions')({
  component: UserSubmissions,
});

function UserSubmissions() {
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    title: string;
  } | null>(null);

  const handleReplaceImage = (submissionId: string, categoryId: string) => {
    // Navigate to upload page with replacement info
    router.navigate({
      to: '/user/upload',
      search: {
        categoryId,
        replacedSubmissionId: submissionId,
      },
    });
  };

  const handleImageClick = (imageUrl: string, title: string) => {
    // Open lightbox modal
    setLightboxImage({ url: imageUrl, title });
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  // Force refresh gallery (useful after uploads/deletions)
  const refreshGallery = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <SignedIn>
        <div className="py-8">
          <SubmissionGallery
            onReplaceImage={handleReplaceImage}
            onImageClick={handleImageClick}
            refreshTrigger={refreshTrigger}
          />

          {/* Simple Lightbox Modal */}
          {lightboxImage && (
            <div
              className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
              onClick={closeLightbox}
            >
              <div className="relative max-w-4xl max-h-full">
                <button
                  onClick={closeLightbox}
                  className="absolute -top-4 -right-4 bg-white text-gray-900 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100 z-10"
                >
                  ×
                </button>
                <img
                  src={lightboxImage.url}
                  alt={lightboxImage.title}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onClick={e => e.stopPropagation()}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <h3 className="text-white text-lg font-medium">
                    {lightboxImage.title}
                  </h3>
                </div>
              </div>
            </div>
          )}
        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
