import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  LayoutWrapper,
  Input,
  Button,
  Card,
  Loading,
} from '@/components';
import { useAppStore } from '@/lib/store';
import { searchBusinesses, createCheckoutSession } from '@/lib/api';
import { GoogleLoginButton } from '@/components';

interface Business {
  name: string;
  place_id: string;
  types: string[];
  primary_type?: string;
  business_status?: string;
  google_maps_url?: string;

  formatted_address?: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;

  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;

  rating?: number;
  user_ratings_total?: number;
  price_level?: string;
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };

  photos?: string[];
}

export default function SearchPage() {
  const [loading, setLoading] = useState(false);
  const [billingLoading, setBillingLoading] = useState<string | null>(null);
  const router = useRouter();
  
  const query = useAppStore((s) => s.searchQuery);
  const setQuery = useAppStore((s) => s.setSearchQuery);
  const results = useAppStore((s) => s.searchResults) as Business[];
  const setResults = useAppStore((s) => s.setSearchResults);
  const setMessage = useAppStore((s) => s.setMessage);
  const user = useAppStore((s) => s.user);
  const credits = useAppStore((s) => s.credits);

  useEffect(() => {
    const checkout = router.query.checkout;
    if (checkout === 'success') {
      setMessage('Payment received. Credits will update shortly.', 'success');
    }
    if (checkout === 'cancel') {
      setMessage('Checkout canceled.', 'info');
    }
  }, [router.query.checkout, setMessage]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setMessage('Please enter a search query', 'warning');
      return;
    }

    setLoading(true);
    try {
      const data = await searchBusinesses(query, 5);
      const nextResults = data.results || [];
      setResults(nextResults);
      if (nextResults.length > 0) {
        setMessage(`Found ${nextResults.length} businesses`, 'success');
      } else {
        setMessage('No businesses found', 'info');
      }
    } catch (error: any) {
      setMessage(
        error.response?.data?.detail || error.message || 'Search failed',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (packId: string) => {
    setBillingLoading(packId);
    try {
      const data = await createCheckoutSession(packId);
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setMessage('Stripe session missing URL', 'error');
      }
    } catch (error: any) {
      setMessage(error.response?.data?.detail || 'Checkout failed', 'error');
    } finally {
      setBillingLoading(null);
    }
  };

  return (
    <>
      <Head>
        <title>Search Businesses</title>
      </Head>

      <LayoutWrapper>
        <div className="space-y-6">
          <Card title="💳 Credits" subtitle="Recharge with Stripe">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Remaining credits</p>
                    <p className="text-2xl font-semibold text-gray-900">{credits}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    loading={billingLoading === 'starter'}
                    onClick={() => handleCheckout('starter')}
                  >
                    Buy 100 - $5
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    loading={billingLoading === 'growth'}
                    onClick={() => handleCheckout('growth')}
                  >
                    Buy 500 - $20
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    loading={billingLoading === 'scale'}
                    onClick={() => handleCheckout('scale')}
                  >
                    Buy 1000 - $35
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  Sign in with Google to view and recharge credits.
                </p>
                <GoogleLoginButton />
              </div>
            )}
          </Card>

          <Card title="🔍 Search Businesses">
            <form onSubmit={handleSearch} className="space-y-4">
              <Input
                placeholder="e.g., 'cafes in NYC', 'pizza restaurants'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-400">
                Limited to 3 searches/day, 5 results per search (anonymous)
              </p>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
              >
                Search
              </Button>
            </form>
          </Card>

          {loading && <Loading />}

          {results.length > 0 && (
            <>
              <Card title="📋 Results Table" subtitle="Google Maps Places API (V1)">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs text-left">
                    <thead className="text-gray-500">
                      <tr>
                        <th className="py-2 pr-3">Name</th>
                        <th className="py-2 pr-3">Place ID</th>
                        <th className="py-2 pr-3">Primary Type</th>
                        <th className="py-2 pr-3">Business Status</th>
                        <th className="py-2 pr-3">Maps URL</th>
                        <th className="py-2 pr-3">Address</th>
                        <th className="py-2 pr-3">City</th>
                        <th className="py-2 pr-3">State</th>
                        <th className="py-2 pr-3">Country</th>
                        <th className="py-2 pr-3">Postal</th>
                        <th className="py-2 pr-3">Phone</th>
                        <th className="py-2 pr-3">Intl Phone</th>
                        <th className="py-2 pr-3">Website</th>
                        <th className="py-2 pr-3">Rating</th>
                        <th className="py-2 pr-3">Ratings</th>
                        <th className="py-2 pr-3">Lat</th>
                        <th className="py-2 pr-3">Lng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((business, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="py-2 pr-3 font-medium text-gray-900">{business.name}</td>
                          <td className="py-2 pr-3 text-gray-700 break-all">{business.place_id}</td>
                          <td className="py-2 pr-3 text-gray-700">{business.primary_type || '-'}</td>
                          <td className="py-2 pr-3 text-gray-700">{business.business_status || '-'}</td>
                          <td className="py-2 pr-3 text-blue-600 max-w-48 truncate">
                            {business.google_maps_url ? (
                              <a
                                href={business.google_maps_url}
                                className="hover:underline"
                                target="_blank"
                                rel="noreferrer"
                                title={business.google_maps_url}
                              >
                                {business.google_maps_url}
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-2 pr-3 text-gray-700">{business.formatted_address || '-'}</td>
                          <td className="py-2 pr-3 text-gray-700">{business.city || '-'}</td>
                          <td className="py-2 pr-3 text-gray-700">{business.state || '-'}</td>
                          <td className="py-2 pr-3 text-gray-700">{business.country || '-'}</td>
                          <td className="py-2 pr-3 text-gray-700">{business.postal_code || '-'}</td>
                          <td className="py-2 pr-3 text-gray-700">{business.formatted_phone_number || '-'}</td>
                          <td className="py-2 pr-3 text-gray-700">{business.international_phone_number || '-'}</td>
                          <td className="py-2 pr-3 text-blue-600 max-w-48 truncate">
                            {business.website ? (
                              <a
                                href={business.website}
                                className="hover:underline"
                                target="_blank"
                                rel="noreferrer"
                                title={business.website}
                              >
                                {business.website}
                              </a>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-2 pr-3 text-gray-700">{business.rating ?? '-'}</td>
                          <td className="py-2 pr-3 text-gray-700">{business.user_ratings_total ?? '-'}</td>
                          <td className="py-2 pr-3 text-gray-700">{business.latitude}</td>
                          <td className="py-2 pr-3 text-gray-700">{business.longitude}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {!loading && results.length === 0 && query && (
            <Card>
              <p className="text-center text-gray-500">No results yet. Try a search!</p>
            </Card>
          )}
        </div>
      </LayoutWrapper>
    </>
  );
}
