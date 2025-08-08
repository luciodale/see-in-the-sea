import { SignedIn, UserButton } from '@clerk/clerk-react';
import { Link } from '@tanstack/react-router';

const linkClasses =
  'text-gray-300 font-medium [&.active]:text-white [&.active]:font-semibold';

export function SubNav() {
  return (
    <header className="bg-slate-800 sticky top-0 z-50 flex items-center h-[80px] uppercase">
      <div className="w-full  px-6 py-4">
        {/* Navigation */}
        <nav className="flex justify-between items-center space-x-6">
          <SignedIn>
            <Link to="/user/submissions" className={linkClasses}>
              Submissions
            </Link>
            <UserButton userProfileUrl="/user/account" />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}
