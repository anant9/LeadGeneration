import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { loginWithGoogle } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { Button } from './Button';

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleLoginButtonProps {
  onLogin?: () => void;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onLogin }) => {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const setUser = useAppStore((s) => s.setUser);
  const setCredits = useAppStore((s) => s.setCredits);
  const setMessage = useAppStore((s) => s.setMessage);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || !isLoaded || !buttonRef.current || !window.google?.accounts?.id) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential?: string }) => {
        if (!response.credential) {
          setMessage('Google login failed', 'error');
          return;
        }
        try {
          const data = await loginWithGoogle(response.credential);
          setUser(data.user);
          setCredits(data.user?.credits ?? 0);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('leadgen_has_session', '1');
          }
          setMessage('Signed in successfully', 'success');
          onLogin?.();
        } catch (error: any) {
          setMessage(error.response?.data?.detail || 'Login failed', 'error');
        }
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      width: 260,
    });
    setIsInitialized(true);
  }, [isLoaded, onLogin, setCredits, setMessage, setUser]);

  const handleFallbackClick = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setMessage('Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID in frontend/.env.local', 'warning');
      return;
    }
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
      return;
    }
    setMessage('Google login script not ready yet', 'info');
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setIsLoaded(true)}
      />
      <div ref={buttonRef} />
      {!isInitialized && (
        <div className="mt-2">
          <Button type="button" variant="secondary" onClick={handleFallbackClick}>
            Sign in with Google
          </Button>
        </div>
      )}
    </>
  );
};
