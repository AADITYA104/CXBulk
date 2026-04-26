/**
 * India DLT (Distributed Ledger Technology) Rules & Regulations (2025-2026 Updated)
 * 
 * DLT is mandatory for all commercial SMS and WhatsApp business messages in India.
 */

export type DLTCategory = 
  | 'Transactional' 
  | 'Service Implicit' 
  | 'Service Explicit' 
  | 'Promotional';

export interface DLTRule {
  id: DLTCategory;
  label: string;
  suffix: string;
  description: string;
  useCases: string[];
  senderIdType: 'Numeric' | 'Alphanumeric';
  restrictions: string[];
  consentRequired: boolean;
  timeRestricted: boolean;
}

export const DLT_RULES: Record<DLTCategory, DLTRule> = {
  Transactional: {
    id: 'Transactional',
    label: 'Transactional',
    suffix: '-T',
    description: 'For Banking OTPs and fund transfer alerts only.',
    useCases: ['OTP', 'Bank transaction alerts', 'Account balance'],
    senderIdType: 'Numeric',
    restrictions: ['Banks ONLY (National, Scheduled, Private, MNC)'],
    consentRequired: false,
    timeRestricted: false,
  },
  'Service Implicit': {
    id: 'Service Implicit',
    label: 'Service Implicit',
    suffix: '-S',
    description: 'Order updates, app OTPs, and service alerts for existing customers.',
    useCases: ['Order confirmation', 'Delivery status', 'App OTP', 'Appointment reminder'],
    senderIdType: 'Alphanumeric',
    restrictions: ['No promotional content allowed'],
    consentRequired: false,
    timeRestricted: false,
  },
  'Service Explicit': {
    id: 'Service Explicit',
    label: 'Service Explicit',
    suffix: '-S',
    description: 'Cross-selling or promoting additional products to existing customers.',
    useCases: ['Voucher reminders', 'Subscription upgrades', 'Feature announcements'],
    senderIdType: 'Alphanumeric',
    restrictions: ['Must link to an approved Consent Template'],
    consentRequired: true,
    timeRestricted: false,
  },
  Promotional: {
    id: 'Promotional',
    label: 'Promotional',
    suffix: '-P',
    description: 'Pure marketing, ads, and product promotions.',
    useCases: ['Sales alerts', 'Discounts', 'Product launches', 'Festival offers'],
    senderIdType: 'Numeric',
    restrictions: [
      '6-digit random numeric sender ID',
      'Mandatory DND scrubbing',
      'Sent only between 9 AM to 9 PM',
      'URLs must be pre-whitelisted (Oct 2024 TRAI Rule)'
    ],
    consentRequired: true,
    timeRestricted: true,
  }
};

export const SMS_LIMITS = {
  TEXT_CHAR_LIMIT: 160,
  UNICODE_CHAR_LIMIT: 70,
};

export const WHATSAPP_LIMITS = {
  UTILITY_FREE_WINDOW: 24, // hours
};
