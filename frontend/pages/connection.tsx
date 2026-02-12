import React, { useState } from 'react';
import Head from 'next/head';
import { LayoutWrapper, Card, Input, Button, Loading } from '@/components';
import { useAppStore, CRMProvider } from '@/lib/store';
import { checkCRMConnection, setCRMConnection } from '@/lib/api';
import { checkEnrichmentHealth } from '@/lib/api';
import { useEffect } from 'react';

export default function ConnectionPage() {
  const [accessToken, setAccessToken] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);

  const provider = useAppStore((s) => s.provider);
  const setProvider = useAppStore((s) => s.setProvider);
  const isConnected = useAppStore((s) => s.isConnected);
  const setIsConnected = useAppStore((s) => s.setIsConnected);
  const setMessage = useAppStore((s) => s.setMessage);

  const [geminiInfo, setGeminiInfo] = React.useState<{
    model_name?: string | null;
    preferred_models?: string[] | null;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const info = await checkEnrichmentHealth();
        setGeminiInfo({
          model_name: info.model_name || null,
          preferred_models: info.preferred_models || null,
        });
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const providers: CRMProvider[] = ['hubspot', 'zoho', 'salesforce'];

  const handleCheckConnection = async () => {
    setLoading(true);
    try {
      const response = await checkCRMConnection(provider);
      if (response.connected) {
        setIsConnected(true);
        setMessage(`Connected to ${provider}!`, 'success');
      } else {
        setIsConnected(false);
        setMessage(
          response.message || `Not connected to ${provider}`,
          'info'
        );
      }
    } catch (error: any) {
      setIsConnected(false);
      setMessage(error.message || 'Failed to check connection', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken.trim()) {
      setMessage('Access token is required', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await setCRMConnection(
        provider,
        accessToken,
        clientId || undefined,
        clientSecret || undefined
      );
      if (response.connected) {
        setIsConnected(true);
        setMessage(`Successfully connected to ${provider}!`, 'success');
        setAccessToken('');
        setClientId('');
        setClientSecret('');
      } else {
        setIsConnected(false);
        setMessage(response.message || 'Connection failed', 'error');
      }
    } catch (error: any) {
      setIsConnected(false);
      setMessage(error.message || 'Connection failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>CRM Connection</title>
      </Head>

      <LayoutWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Provider Selection */}
          <Card title="🔗 Select CRM Provider">
            <div className="space-y-2">
              {providers.map((p) => (
                <label key={p} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="provider"
                    value={p}
                    checked={provider === p}
                    onChange={() => setProvider(p)}
                    className="w-4 h-4"
                  />
                  <span className="font-medium capitalize">{p}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* Connection Status */}
          <Card title="📊 Connection Status">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-100">
                <p className="text-sm text-gray-600">Current Provider</p>
                <p className="text-xl font-bold capitalize text-blue-600">{provider}</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-100">
                <p className="text-sm text-gray-600">Status</p>
                <p className={`text-lg font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? '🟢 Connected' : '🔴 Not Connected'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-100">
                <p className="text-sm text-gray-600">Gemini Model</p>
                <p className="text-sm text-gray-700">
                  {geminiInfo?.model_name || 'Not selected / using fallback'}
                </p>
                {geminiInfo?.preferred_models && (
                  <p className="text-xs text-gray-500 mt-2">
                    Preferred: {geminiInfo.preferred_models.join(', ')}
                  </p>
                )}
              </div>
              <Button
                variant="secondary"
                onClick={handleCheckConnection}
                loading={loading}
                fullWidth
              >
                🔄 Check Status
              </Button>
            </div>
          </Card>

          {/* Connection Form */}
          <div className="lg:col-span-2">
            <Card title={`🔐 Connect to ${provider.toUpperCase()}`}>
              <form onSubmit={handleConnect} className="space-y-4">
                <Input
                  label="Access Token *"
                  type="password"
                  placeholder="Enter your API token"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  disabled={loading}
                />
                <Input
                  label="Client ID (optional)"
                  placeholder="For OAuth flows"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  disabled={loading}
                />
                <Input
                  label="Client Secret (optional)"
                  type="password"
                  placeholder="For OAuth flows"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  disabled={loading}
                />
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  <p className="font-semibold mb-2">Getting your token:</p>
                  {provider === 'hubspot' && (
                    <p>Create a private app in HubSpot Settings → Integrations → Private Apps</p>
                  )}
                  {provider === 'zoho' && (
                    <p>Generate an OAuth token from Zoho's API Console</p>
                  )}
                  {provider === 'salesforce' && (
                    <p>Use Connected App credentials or OAuth token from Salesforce</p>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                >
                  Connect to {provider.toUpperCase()}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </LayoutWrapper>
    </>
  );
}
