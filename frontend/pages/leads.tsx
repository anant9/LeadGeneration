import React, { useState } from 'react';
import Head from 'next/head';
import {
  LayoutWrapper,
  Card,
  Input,
  Button,
  Select,
} from '@/components';
import { useAppStore } from '@/lib/store';
import { createLead, createDeal } from '@/lib/api';

const dealStages = [
  { label: 'Negotiation', value: 'negotiation' },
  { label: 'Proposal Sent', value: 'proposal_sent' },
  { label: 'In Contract', value: 'in_contract' },
  { label: 'Closed Won', value: 'closed_won' },
  { label: 'Closed Lost', value: 'closed_lost' },
];

export default function LeadsPage() {
  // Lead form state
  const [leadForm, setLeadForm] = useState({
    email: '',
    firstname: '',
    lastname: '',
    phone: '',
    company: '',
    website: '',
  });

  // Deal form state
  const [dealForm, setDealForm] = useState({
    dealname: '',
    dealstage: 'negotiation',
    amount: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const provider = useAppStore((s) => s.provider);
  const isConnected = useAppStore((s) => s.isConnected);
  const setMessage = useAppStore((s) => s.setMessage);

  const handleLeadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLeadForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDealChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDealForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      setMessage('Please connect to CRM first', 'error');
      return;
    }
    if (!leadForm.email) {
      setMessage('Email is required', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await createLead(provider, leadForm);
      if (response.success) {
        setMessage(`Lead created successfully!`, 'success');
        setLeadForm({
          email: '',
          firstname: '',
          lastname: '',
          phone: '',
          company: '',
          website: '',
        });
      } else {
        setMessage(response.error || 'Failed to create lead', 'error');
      }
    } catch (error: any) {
      setMessage(error.message || 'Failed to create lead', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      setMessage('Please connect to CRM first', 'error');
      return;
    }
    if (!dealForm.dealname) {
      setMessage('Deal name is required', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await createDeal(provider, dealForm);
      if (response.success) {
        setMessage(`Deal created successfully!`, 'success');
        setDealForm({
          dealname: '',
          dealstage: 'negotiation',
          amount: '',
          description: '',
        });
      } else {
        setMessage(response.error || 'Failed to create deal', 'error');
      }
    } catch (error: any) {
      setMessage(error.message || 'Failed to create deal', 'error');
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
        <title>Lead Management</title>
      </Head>

      <LayoutWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Lead */}
          <Card title="➕ Create Lead">
            <form onSubmit={handleCreateLead} className="space-y-4">
              <Input
                label="Email *"
                type="email"
                name="email"
                value={leadForm.email}
                onChange={handleLeadChange}
                placeholder="john@example.com"
                disabled={loading}
              />
              <Input
                label="First Name"
                name="firstname"
                value={leadForm.firstname}
                onChange={handleLeadChange}
                placeholder="John"
                disabled={loading}
              />
              <Input
                label="Last Name"
                name="lastname"
                value={leadForm.lastname}
                onChange={handleLeadChange}
                placeholder="Doe"
                disabled={loading}
              />
              <Input
                label="Phone"
                name="phone"
                value={leadForm.phone}
                onChange={handleLeadChange}
                placeholder="+1234567890"
                disabled={loading}
              />
              <Input
                label="Company"
                name="company"
                value={leadForm.company}
                onChange={handleLeadChange}
                placeholder="Company Name"
                disabled={loading}
              />
              <Input
                label="Website"
                name="website"
                value={leadForm.website}
                onChange={handleLeadChange}
                placeholder="https://example.com"
                disabled={loading}
              />
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
              >
                Create Lead
              </Button>
            </form>
          </Card>

          {/* Create Deal */}
          <Card title="📊 Create Deal">
            <form onSubmit={handleCreateDeal} className="space-y-4">
              <Input
                label="Deal Name *"
                name="dealname"
                value={dealForm.dealname}
                onChange={handleDealChange}
                placeholder="e.g., ABC Corp Q1 Opportunity"
                disabled={loading}
              />
              <Select
                label="Deal Stage"
                name="dealstage"
                value={dealForm.dealstage}
                onChange={handleDealChange}
                options={dealStages}
                disabled={loading}
              />
              <Input
                label="Amount"
                name="amount"
                value={dealForm.amount}
                onChange={handleDealChange}
                placeholder="50000"
                disabled={loading}
              />
              <div className="mb-4">
                <label className="label">Description</label>
                <textarea
                  name="description"
                  value={dealForm.description}
                  onChange={handleDealChange}
                  placeholder="Add deal details..."
                  disabled={loading}
                  className="input h-24"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
              >
                Create Deal
              </Button>
            </form>
          </Card>
        </div>
      </LayoutWrapper>
    </>
  );
}
