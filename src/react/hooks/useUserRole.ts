import { useUser } from '@clerk/clerk-react';

export function useUserRole() {
  const { user, isLoaded } = useUser();

  const role = user?.publicMetadata?.role as string | undefined;
  const isAdmin = role === 'admin';
  const isModerator = role === 'moderator';
  const isUser = role === 'user' || !role; // Default to user if no role set

  return {
    role,
    isAdmin,
    isModerator,
    isUser,
    isLoaded,
    hasRole: (requiredRole: string) => role === requiredRole,
    // Helper to check multiple roles
    hasAnyRole: (roles: string[]) => roles.includes(role || ''),
  };
}
