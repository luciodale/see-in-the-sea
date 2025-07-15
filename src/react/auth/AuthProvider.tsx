import { Auth0Provider } from '@auth0/auth0-react';
import React from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <Auth0Provider
            domain="see-in-the-sea.eu.auth0.com"
            clientId="wzXVaeg2jKG2EJBPBFs5WfttcxArkwZQ"
            authorizationParams={{
                redirect_uri: window.location.origin
            }}
        >
            {children}
        </Auth0Provider>
    );
}
