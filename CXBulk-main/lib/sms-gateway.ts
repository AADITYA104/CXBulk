import { DLTTemplate } from '../context/templates';
import { Contact } from '../context/contacts';

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  status: 'sent' | 'delivered' | 'failed' | 'rejected';
}

export interface CampaignBatch {
  campaignId: string;
  template: DLTTemplate;
  contacts: Contact[];
  channel: 'sms' | 'whatsapp' | 'both';
}

/**
 * SMS Gateway / WhatsApp Business API Wrapper
 * This acts as the bridge between the app and the backend/external APIs.
 */
class MessageGateway {
  private apiUrl = process.env.EXPO_PUBLIC_API_URL || '';
  private apiKey = process.env.EXPO_PUBLIC_API_KEY || '';

  /**
   * Send a message to a single recipient
   */
  async sendMessage(
    contact: Contact,
    template: DLTTemplate,
    channel: 'sms' | 'whatsapp'
  ): Promise<SendResult> {
    // 1. Personalize content
    const body = this.personalize(template.content, contact);

    // 2. Mock API call (In production, this would be a fetch to your backend or SMS provider)
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mocking DLT validation/rejection
      if (template.status !== 'Approved' && channel === 'sms') {
        return { success: false, status: 'rejected', error: 'DLT Template not approved' };
      }

      // Mock success
      return { 
        success: true, 
        messageId: `msg_${Math.random().toString(36).substr(2, 9)}`,
        status: 'sent'
      };
    } catch (e: any) {
      return { success: false, status: 'failed', error: e.message };
    }
  }

  /**
   * Process a batch of messages
   */
  async sendBatch(
    contacts: Contact[],
    template: DLTTemplate,
    channel: 'sms' | 'whatsapp',
    onProgress?: (sent: number, failed: number) => void
  ): Promise<{ sent: number; failed: number; results: SendResult[] }> {
    let sent = 0;
    let failed = 0;
    const results: SendResult[] = [];

    for (const contact of contacts) {
      const result = await this.sendMessage(contact, template, channel);
      results.push(result);
      if (result.success) {
        sent++;
      } else {
        failed++;
      }
      onProgress?.(sent, failed);
    }

    return { sent, failed, results };
  }

  /**
   * Replace {#var#} with contact details
   */
  private personalize(content: string, contact: Contact): string {
    // Current app uses {Name}, {Crop}, {Mobile}
    // New DLT app uses {#var#}
    
    // Support both formats for backward compatibility
    return content
      .replace(/\{Name\}|\{#var#\}/gi, contact.name)
      .replace(/\{Crop\}|\{#var#\}/gi, contact.crop || '')
      .replace(/\{Mobile\}|\{#var#\}/gi, contact.mobile);
  }
}

export const gateway = new MessageGateway();
