import React, { useState } from 'react';
import Head from 'next/head';
import { LayoutWrapper, Card, Input, Button, Loading } from '@/components';
import { useAppStore } from '@/lib/store';
import { searchContacts } from '@/lib/api';

export default function ContactsPage() {
  const [query, setQuery] = useState('');
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const provider = useAppStore((s) => s.provider);
  const isConnected = useAppStore((s) => s.isConnected);
  const setMessage = useAppStore((s) => s.setMessage);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setMessage('Please enter a search query', 'warning');
      return;
    }
    if (!isConnected) {
      setMessage('Please connect to CRM first', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await searchContacts(provider, query, 20);
      if (response.success) {
        setContacts(response.contacts || []);
        setMessage(`Found ${response.contacts?.length || 0} contacts`, 'success');
      } else {
        setMessage(response.error || 'Search failed', 'error');
      }
    } catch (error: any) {
      setMessage(error.message || 'Search failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <LayoutWrapper>
        <Card>
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">
              ⚠️ Please connect to {provider} first
            </p>
            <a href="/connection" className="text-blue-600 font-semibold mt-4 inline-block">
              Go to Connection Settings →
            </a>
          </div>
        </Card>
      </LayoutWrapper>
    );
  }

  return (
    <>
      <Head>
        <title>Contacts</title>
      </Head>

      <LayoutWrapper>
        <Card title="👥 Search Contacts">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <Input
                placeholder="Search by name, email, or company..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
              />
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="flex-shrink-0"
              >
                Search
              </Button>
            </div>
          </form>

          {loading && <Loading />}

          {contacts.length > 0 && (
            <div className="space-y-3">
              {contacts.map((contact, idx) => (
                <div key={idx} className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50">
                  <p className="font-semibold">{contact.firstname} {contact.lastname}</p>
                  {contact.email && (
                    <p className="text-sm text-gray-600">{contact.email}</p>
                  )}
                  {contact.phone && (
                    <p className="text-sm text-gray-600">{contact.phone}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading && contacts.length === 0 && query && (
            <p className="text-center text-gray-500">No contacts found</p>
          )}
        </Card>
      </LayoutWrapper>
    </>
  );
}
