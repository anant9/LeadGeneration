import React from 'react';
import { Contact } from '@/lib/api';

interface ContactsListProps {
  contacts: Contact[];
  confidence?: number;
}

export const ContactsList: React.FC<ContactsListProps> = ({ contacts, confidence }) => {
  if (!contacts || contacts.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
        <p className="text-yellow-700">No contacts found</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {confidence !== undefined && (
        <div className="text-xs text-gray-500 mb-2">
          Confidence: {(confidence * 100).toFixed(0)}%
        </div>
      )}
      {contacts.map((contact, idx) => (
        <div
          key={idx}
          className="bg-blue-50 border border-blue-200 rounded p-3 hover:bg-blue-100 transition-colors"
        >
          <div className="font-medium text-blue-900">{contact.name}</div>
          {contact.title && (
            <div className="text-sm text-blue-700">{contact.title}</div>
          )}
          {contact.company && (
            <div className="text-xs text-blue-700">{contact.company}</div>
          )}
          {contact.department && (
            <div className="text-xs text-blue-600">Dept: {contact.department}</div>
          )}
          {(contact.city || contact.state || contact.country) && (
            <div className="text-xs text-blue-600">
              {contact.city || ''}
              {contact.city && contact.state ? ', ' : ''}
              {contact.state || ''}
              {(contact.city || contact.state) && contact.country ? ', ' : ''}
              {contact.country || ''}
            </div>
          )}
          <div className="flex flex-col gap-1 mt-2 text-xs">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="text-blue-600 hover:underline break-all"
              >
                📧 {contact.email}
              </a>
            )}
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="text-blue-600 hover:underline"
              >
                📱 {contact.phone}
              </a>
            )}
            {contact.mobile_phone && (
              <a
                href={`tel:${contact.mobile_phone}`}
                className="text-blue-600 hover:underline"
              >
                📱 Mobile: {contact.mobile_phone}
              </a>
            )}
            {contact.website && (
              <a
                href={contact.website}
                className="text-blue-600 hover:underline break-all"
                target="_blank"
                rel="noreferrer"
              >
                🌐 {contact.website}
              </a>
            )}
            {contact.linkedin_url && (
              <a
                href={contact.linkedin_url}
                className="text-blue-600 hover:underline break-all"
                target="_blank"
                rel="noreferrer"
              >
                in {contact.linkedin_url}
              </a>
            )}
            {contact.twitter_url && (
              <a
                href={contact.twitter_url}
                className="text-blue-600 hover:underline break-all"
                target="_blank"
                rel="noreferrer"
              >
                𝕏 {contact.twitter_url}
              </a>
            )}
            {contact.facebook_url && (
              <a
                href={contact.facebook_url}
                className="text-blue-600 hover:underline break-all"
                target="_blank"
                rel="noreferrer"
              >
                f {contact.facebook_url}
              </a>
            )}
            {contact.instagram_url && (
              <a
                href={contact.instagram_url}
                className="text-blue-600 hover:underline break-all"
                target="_blank"
                rel="noreferrer"
              >
                📸 {contact.instagram_url}
              </a>
            )}
            {contact.youtube_url && (
              <a
                href={contact.youtube_url}
                className="text-blue-600 hover:underline break-all"
                target="_blank"
                rel="noreferrer"
              >
                ▶ {contact.youtube_url}
              </a>
            )}
            {contact.other_social_urls && contact.other_social_urls.length > 0 && (
              <div className="text-blue-600 break-all">
                🔗 {contact.other_social_urls.join(', ')}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactsList;
