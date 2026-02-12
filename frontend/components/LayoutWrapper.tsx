import React from 'react';
import { Header, Sidebar } from './Layout';
import { Alert } from './Alert';
import { useAppStore } from '@/lib/store';
import { fetchMe } from '@/lib/api';

const navItems = [
  { label: 'Search Businesses', href: '/', icon: '🔍' },
  { label: 'CRM Connection', href: '/connection', icon: '🔗' },
  { label: 'Lead Management', href: '/leads', icon: '📋' },
  { label: 'Contacts', href: '/contacts', icon: '👥' },
];

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const message = useAppStore((s) => s.message);
  const messageType = useAppStore((s) => s.messageType);
  const setMessage = useAppStore((s) => s.setMessage);
  const setUser = useAppStore((s) => s.setUser);
  const setCredits = useAppStore((s) => s.setCredits);

  React.useEffect(() => {
    let isMounted = true;
    const loadUser = async () => {
      if (typeof window !== 'undefined') {
        const hasSession = window.localStorage.getItem('leadgen_has_session');
        if (!hasSession) {
          return;
        }
      }
      try {
        const data = await fetchMe();
        if (isMounted && data?.user) {
          setUser(data.user);
          setCredits(data.user.credits ?? 0);
        }
      } catch {
        if (isMounted) {
          setUser(null);
          setCredits(0);
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem('leadgen_has_session');
          }
        }
      }
    };

    loadUser();
    return () => {
      isMounted = false;
    };
  }, [setCredits, setUser]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar items={navItems} />
        <main className="flex-1 p-4 md:p-8 mt-16 md:mt-0">
          <div className="max-w-7xl">
            {message && messageType && (
              <div className="mb-4">
                <Alert
                  type={messageType}
                  message={message}
                  onClose={() => setMessage(null)}
                />
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
