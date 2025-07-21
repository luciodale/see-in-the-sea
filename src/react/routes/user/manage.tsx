import { SignedIn, UserButton } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';
import { ImageUploadForm } from '../../components/ImageUploadForm';

export const Route = createFileRoute('/user/manage')({
  component: UserManage,
})

function UserManage() {
   
    
    return (
        <div>
          <SignedIn>
            <UserButton />
          </SignedIn>
         <ImageUploadForm />
        </div>
      )
    
}

