import React from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { GoogleLoginButton } from './GoogleLoginButton';
import { logout } from '@/lib/api';

export const Header: React.FC = () => {
  const provider = useAppStore((s) => s.provider);
  const isConnected = useAppStore((s) => s.isConnected);
  const user = useAppStore((s) => s.user);
  const credits = useAppStore((s) => s.credits);
  const setUser = useAppStore((s) => s.setUser);
  const setCredits = useAppStore((s) => s.setCredits);
  const setMessage = useAppStore((s) => s.setMessage);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setCredits(0);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('leadgen_has_session');
      }
      setMessage('Signed out', 'info');
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Logout failed', 'error');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-blue-600">🚀 Lead Gen</h1>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Provider: {provider.toUpperCase()}</span>
            <span
              className={`text-sm px-3 py-1 rounded-full ${
                isConnected
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>

            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700">Credits: {credits}</span>
                <button
                  className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <GoogleLoginButton />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface SidebarProps {
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ items }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 bg-blue-600 text-white p-2 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-gray-900 text-white transform transition-transform md:relative md:translate-x-0 md:block ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 mt-16 md:mt-0">
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon} {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};
