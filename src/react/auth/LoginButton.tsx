import { useAuth0 } from "@auth0/auth0-react";

export function LoginButton() {
  const { loginWithRedirect } = useAuth0();
  return (
      <button onClick={() => loginWithRedirect()}>Log In</button>
  );
};
