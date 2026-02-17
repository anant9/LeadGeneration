import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Type definitions
export interface SearchResult {
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

export interface CRMConnection {
  connected: boolean;
  message: string;
  portal_id?: string;
  error?: string;
}

export interface Lead {
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  company?: string;
  website?: string;
  address?: string;
  business_type?: string;
  rating?: number;
  latitude?: number;
  longitude?: number;
}

export interface Deal {
  dealname: string;
  dealstage: string;
  amount?: string;
  description?: string;
}

export interface Contact {
  name: string;
  first_name?: string;
  last_name?: string;
  title?: string;
  email?: string;
  phone?: string;
  mobile_phone?: string;
  department?: string;
  company?: string;
  website?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  other_social_urls?: string[];
  source_url?: string;
  notes?: string;
}

export interface EnrichmentResponse {
  name: string;
  website: string;
  contacts: Contact[];
  confidence: number;
  scraped_content_length: number;
  status: string;
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  picture?: string | null;
  credits: number;
}

// Business search API
export const searchBusinesses = async (query: string, maxResults: number = 5) => {
  const response = await apiClient.get('/api/v1/search/natural', {
    params: { query, max_results: maxResults },
  });
  return response.data;
};

export const importApifyJsonFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/api/v1/search/business/import/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    responseType: 'blob',
  });

  const contentDisposition = response.headers['content-disposition'] || '';
  const filenameMatch = contentDisposition.match(/filename=([^;]+)/i);
  const filename = filenameMatch ? filenameMatch[1].replace(/"/g, '').trim() : 'converted_businesses.json';

  const blob: Blob = response.data;
  const text = await blob.text();
  const data = JSON.parse(text);

  return { data, blob, filename };
};

// CRM Connection APIs
export const checkCRMConnection = async (provider: string = 'hubspot') => {
  const response = await apiClient.get(`/api/v1/${provider}/status`);
  return response.data;
};

export const setCRMConnection = async (
  provider: string,
  accessToken: string,
  clientId?: string,
  clientSecret?: string
) => {
  const response = await apiClient.post(`/api/v1/${provider}/connection`, {
    access_token: accessToken,
    client_id: clientId,
    client_secret: clientSecret,
  });
  return response.data;
};

// Lead APIs
export const createLead = async (provider: string, lead: Lead) => {
  const response = await apiClient.post(`/api/v1/${provider}/leads`, lead);
  return response.data;
};

export const createBatchLeads = async (provider: string, leads: Lead[]) => {
  const response = await apiClient.post(`/api/v1/${provider}/leads/batch`, { leads });
  return response.data;
};

export const upsertLead = async (provider: string, lead: Lead) => {
  const response = await apiClient.post(`/api/v1/${provider}/leads/upsert`, lead);
  return response.data;
};

// Deal APIs
export const createDeal = async (provider: string, deal: Deal) => {
  const response = await apiClient.post(`/api/v1/${provider}/deals`, deal);
  return response.data;
};

// Search contacts
export const searchContacts = async (provider: string, query: string, limit: number = 20) => {
  const response = await apiClient.post(`/api/v1/${provider}/contacts/search`, null, {
    params: { query, limit },
  });
  return response.data;
};

// Enrichment APIs
export const enrichBusiness = async (
  name: string,
  website: string,
  address?: string
): Promise<EnrichmentResponse> => {
  const response = await apiClient.post('/api/v1/enrichment/enrich', {
    name,
    website,
    address,
  });
  return response.data;
};

export const batchEnrichBusinesses = async (
  businesses: Array<{ name: string; website: string; address?: string }>
) => {
  const response = await apiClient.post('/api/v1/enrichment/batch-enrich', {
    businesses,
  });
  return response.data;
};

export const checkEnrichmentHealth = async () => {
  const response = await apiClient.get('/api/v1/enrichment/health');
  return response.data;
};

// Auth APIs
export const loginWithGoogle = async (idToken: string) => {
  const response = await apiClient.post('/api/v1/auth/google', { id_token: idToken });
  return response.data;
};

export const fetchMe = async () => {
  const response = await apiClient.get('/api/v1/auth/me');
  return response.data;
};

export const logout = async () => {
  const response = await apiClient.post('/api/v1/auth/logout');
  return response.data;
};

// Billing APIs
export const getCredits = async () => {
  const response = await apiClient.get('/api/v1/billing/credits');
  return response.data;
};

export const createCheckoutSession = async (packId: string) => {
  const response = await apiClient.post('/api/v1/billing/checkout', { pack_id: packId });
  return response.data;
};

export default apiClient;
