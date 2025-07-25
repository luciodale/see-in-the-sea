import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/user/manage')({
  component: () => <Navigate to="/user" />,
})

