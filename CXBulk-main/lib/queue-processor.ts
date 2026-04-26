import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  increment,
  onSnapshot 
} from 'firebase/firestore';
import { gateway } from './sms-gateway';
import { DLTTemplate } from '../context/templates';
import { Contact } from '../context/contacts';

export interface CampaignJob {
  id: string;
  campaignId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total: number;
  sent: number;
  failed: number;
  currentContactIndex: number;
}

class QueueProcessor {
  /**
   * Create a new campaign and start processing
   */
  async createCampaign(
    userId: string,
    title: string,
    template: DLTTemplate,
    contacts: Contact[],
    channel: 'sms' | 'whatsapp' | 'both'
  ) {
    const now = Date.now();
    
    // 1. Create Campaign record
    const campaignRef = await addDoc(collection(db, 'campaigns'), {
      userId,
      title,
      templateId: template.id,
      templateName: template.name,
      channel,
      status: 'processing',
      totalContacts: contacts.length,
      sent: 0,
      failed: 0,
      createdAt: now,
      updatedAt: now,
    });

    // 2. Start Processing in background (Batching)
    this.processCampaign(campaignRef.id, contacts, template, channel);

    return campaignRef.id;
  }

  private async processCampaign(
    campaignId: string,
    contacts: Contact[],
    template: DLTTemplate,
    channel: 'sms' | 'whatsapp' | 'both'
  ) {
    const campaignRef = doc(db, 'campaigns', campaignId);
    const batchSize = 10;
    
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize);
      
      // Process individual channels
      const channels: ('sms' | 'whatsapp')[] = channel === 'both' ? ['sms', 'whatsapp'] : [channel];
      
      for (const ch of channels) {
        const { sent, failed } = await gateway.sendBatch(batch, template, ch);
        
        // Update stats in Firestore
        await updateDoc(campaignRef, {
          sent: increment(sent),
          failed: increment(failed),
          updatedAt: Date.now(),
        });
      }

      // Small delay between batches to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Mark completed
    await updateDoc(campaignRef, {
      status: 'completed',
      updatedAt: Date.now(),
    });
  }

  /**
   * Listen to real-time progress of a campaign
   */
  subscribeToProgress(campaignId: string, callback: (data: any) => void) {
    return onSnapshot(doc(db, 'campaigns', campaignId), (snapshot) => {
      callback(snapshot.data());
    });
  }
}

export const queueProcessor = new QueueProcessor();
