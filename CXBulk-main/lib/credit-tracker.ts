import { DLTCategory } from '../constants/dlt-rules';

export interface CreditStats {
  available: number;
  used: number;
  estimatedCost: number;
}

/**
 * Credit Tracker and Optimizer
 * Helps users estimate costs and optimize message spending.
 */
class CreditTracker {
  // Rates in INR (Approximate)
  private rates = {
    sms: 0.25, // Rs. 0.25 per SMS
    whatsappMarketing: 0.80, // Rs. 0.80 per marketing msg
    whatsappUtility: 0.40, // Rs. 0.40 per utility msg
    whatsappAuthentication: 0.35, // Rs. 0.35 per auth msg
  };

  /**
   * Estimate the cost of a campaign
   */
  estimateCost(
    contactCount: number,
    channel: 'sms' | 'whatsapp' | 'both',
    category: DLTCategory,
    smsPages: number = 1
  ): number {
    let cost = 0;

    if (channel === 'sms' || channel === 'both') {
      cost += contactCount * this.rates.sms * smsPages;
    }

    if (channel === 'whatsapp' || channel === 'both') {
      const waRate = this.getWhatsAppRate(category);
      cost += contactCount * waRate;
    }

    return parseFloat(cost.toFixed(2));
  }

  /**
   * Determine the WhatsApp rate based on DLT category
   */
  private getWhatsAppRate(category: DLTCategory): number {
    switch (category) {
      case 'Promotional':
      case 'Service Explicit':
        return this.rates.whatsappMarketing;
      case 'Service Implicit':
        return this.rates.whatsappUtility;
      case 'Transactional':
        return this.rates.whatsappAuthentication;
      default:
        return this.rates.whatsappMarketing;
    }
  }

  /**
   * Check if a utility window is likely open (mock logic)
   */
  isUtilityWindowOpen(lastRepliedAt?: number): boolean {
    if (!lastRepliedAt) return false;
    const hoursSinceReply = (Date.now() - lastRepliedAt) / (1000 * 60 * 60);
    return hoursSinceReply <= 24;
  }
}

export const creditTracker = new CreditTracker();
