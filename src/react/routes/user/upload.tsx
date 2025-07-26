import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute, useRouter, useSearch } from '@tanstack/react-router';
import type { UploadResponse } from '../../../types/api.js';
import ImageUploadForm from '../../components/ImageUploadForm';

// Define search params type for category pre-selection
type UploadSearch = {
  categoryId?: string;
  replacedSubmissionId?: string;
};

export const Route = createFileRoute('/user/upload')({
  component: UploadPage,
  validateSearch: (search: Record<string, unknown>): UploadSearch => {
    return {
      categoryId: search.categoryId as string,
      replacedSubmissionId: search.replacedSubmissionId as string,
    };
  },
});

function UploadPage() {
  const router = useRouter();
  const { categoryId, replacedSubmissionId } = useSearch({
    from: '/user/upload',
  });

  const handleUploadSuccess = (result: UploadResponse) => {
    // Show success and navigate to gallery
    alert(
      `${result.data?.action === 'replace' ? 'Image replaced' : 'Upload'} successful!`
    );
    router.navigate({ to: '/user/gallery' });
  };

  const handleCancel = () => {
    // Navigate back to main contest page
    router.navigate({ to: '/user' });
  };

  return (
    <>
      <SignedIn>
        <div className="py-8">
          <ImageUploadForm
            selectedCategoryId={categoryId}
            replacedSubmissionId={replacedSubmissionId}
            onUploadSuccess={handleUploadSuccess}
            onCancel={handleCancel}
          />
        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
