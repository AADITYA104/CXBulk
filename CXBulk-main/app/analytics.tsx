import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Dimensions 
} from 'react-native';
import { useCampaigns } from '../context/campaigns';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { campaigns } = useCampaigns();

  const stats = useMemo(() => {
    const total = campaigns.length;
    const sent = campaigns.reduce((acc, c) => acc + (c.sent || 0), 0);
    const failed = campaigns.reduce((acc, c) => acc + (c.failed || 0), 0);
    const totalContacts = campaigns.reduce((acc, c) => acc + (c.totalContacts || 0), 0);
    
    return {
      total,
      sent,
      failed,
      totalContacts,
      successRate: totalContacts > 0 ? Math.round((sent / totalContacts) * 100) : 0
    };
  }, [campaigns]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#007AFF' }]}>
            <Ionicons name="megaphone" size={24} color="#FFF" />
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Campaigns</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#34C759' }]}>
            <Ionicons name="checkmark-done" size={24} color="#FFF" />
            <Text style={styles.statValue}>{stats.sent}</Text>
            <Text style={styles.statLabel}>Total Sent</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FF9500' }]}>
            <Ionicons name="stats-chart" size={24} color="#FFF" />
            <Text style={styles.statValue}>{stats.successRate}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FF3B30' }]}>
            <Ionicons name="alert-circle" size={24} color="#FFF" />
            <Text style={styles.statValue}>{stats.failed}</Text>
            <Text style={styles.statLabel}>Total Failed</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Performance</Text>
          {campaigns.slice(0, 5).map((c) => (
            <View key={c.id} style={styles.campaignRow}>
              <View style={styles.campaignInfo}>
                <Text style={styles.campaignName}>{c.title}</Text>
                <Text style={styles.campaignDate}>{new Date(c.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={styles.campaignStats}>
                <Text style={styles.campaignSent}>{c.sent} / {c.totalContacts}</Text>
                <View style={styles.miniBar}>
                  <View style={[styles.miniBarFill, { width: `${(c.sent / c.totalContacts) * 100}%` }]} />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFF',
  },
  title: { fontSize: 34, fontWeight: '800', color: '#1C1C1E' },
  scrollContent: { padding: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: (width - 44) / 2,
    padding: 20,
    borderRadius: 24,
    gap: 8,
  },
  statValue: { fontSize: 24, fontWeight: '800', color: '#FFF' },
  statLabel: { fontSize: 13, fontWeight: '600', color: '#FFF', opacity: 0.8 },
  section: { marginTop: 32 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1E', marginBottom: 16 },
  campaignRow: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  campaignInfo: { flex: 1 },
  campaignName: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
  campaignDate: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  campaignStats: { alignItems: 'flex-end', width: 100 },
  campaignSent: { fontSize: 14, fontWeight: '600', color: '#1C1C1E', marginBottom: 6 },
  miniBar: { height: 4, width: 80, backgroundColor: '#F2F2F7', borderRadius: 2, overflow: 'hidden' },
  miniBarFill: { height: '100%', backgroundColor: '#34C759' },
});
