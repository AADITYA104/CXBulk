import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * DND (Do Not Disturb) and Opt-out Manager
 * Required for TRAI compliance in India.
 */
class DNDManager {
  /**
   * Check if a list of numbers are in the opt-out list
   * Returns a list of numbers that are NOT in DND.
   */
  async scrubNumbers(userId: string, numbers: string[]): Promise<string[]> {
    const dndList = await this.getDNDList(userId);
    return numbers.filter(num => !dndList.includes(this.normalize(num)));
  }

  /**
   * Add a number to the opt-out list
   */
  async optOut(userId: string, mobile: string, reason: string = 'User requested') {
    const normalized = this.normalize(mobile);
    
    // Check if already exists
    const q = query(
      collection(db, 'dnd_list'),
      where('userId', '==', userId),
      where('mobile', '==', normalized)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      await addDoc(collection(db, 'dnd_list'), {
        userId,
        mobile: normalized,
        reason,
        timestamp: serverTimestamp(),
      });
    }
  }

  /**
   * Fetch all DND numbers for a user
   */
  async getDNDList(userId: string): Promise<string[]> {
    const q = query(
      collection(db, 'dnd_list'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data().mobile);
  }

  private normalize(mobile: string): string {
    return mobile.replace(/\D/g, '').slice(-10); // Last 10 digits
  }
}

export const dndManager = new DNDManager();
