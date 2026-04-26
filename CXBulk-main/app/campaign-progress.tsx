import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  ActivityIndicator,
  Dimensions 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { queueProcessor } from '../lib/queue-processor';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function CampaignProgressScreen() {
  const { campaignId } = useLocalSearchParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<any>(null);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!campaignId) return;

    const unsubscribe = queueProcessor.subscribeToProgress(campaignId as string, (data) => {
      setCampaign(data);
      if (data?.totalContacts) {
        progress.value = (data.sent + data.failed) / data.totalContacts;
      }
    });

    return () => unsubscribe();
  }, [campaignId]);

  const progressStyle = useAnimatedStyle(() => ({
    width: withSpring(progress.value * (width - 40)),
  }));

  if (!campaign) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const isCompleted = campaign.status === 'completed';
  const totalProcessed = campaign.sent + campaign.failed;
  const progressPercent = Math.round((totalProcessed / campaign.totalContacts) * 100);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons 
            name={isCompleted ? "checkmark-circle" : "send"} 
            size={64} 
            color={isCompleted ? "#34C759" : "#007AFF"} 
          />
          <Text style={styles.title}>
            {isCompleted ? "Broadcast Complete" : "Sending Campaign..."}
          </Text>
          <Text style={styles.campaignTitle}>{campaign.title}</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              {totalProcessed} of {campaign.totalContacts} processed
            </Text>
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, progressStyle, { backgroundColor: isCompleted ? "#34C759" : "#007AFF" }]} />
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{campaign.sent}</Text>
            <Text style={styles.statLabel}>SENT</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#FF3B30' }]}>{campaign.failed}</Text>
            <Text style={styles.statLabel}>FAILED</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{campaign.channel.toUpperCase()}</Text>
            <Text style={styles.statLabel}>CHANNEL</Text>
          </View>
        </View>

        {isCompleted && (
          <Pressable 
            style={styles.doneButton}
            onPress={() => router.replace('/(app)/history')}
          >
            <Text style={styles.doneButtonText}>View Detailed Report</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#1C1C1E', marginTop: 16 },
  campaignTitle: { fontSize: 16, color: '#8E8E93', marginTop: 4 },
  progressContainer: { width: '100%', marginBottom: 40 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 14, color: '#8E8E93', fontWeight: '600' },
  progressPercent: { fontSize: 14, color: '#1C1C1E', fontWeight: '700' },
  progressBarBg: { height: 12, backgroundColor: '#F2F2F7', borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 6 },
  statsGrid: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 40 },
  statCard: { 
    flex: 1, 
    backgroundColor: '#F9F9FB', 
    padding: 16, 
    borderRadius: 16, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  statValue: { fontSize: 20, fontWeight: '800', color: '#1C1C1E', marginBottom: 4 },
  statLabel: { fontSize: 10, fontWeight: '700', color: '#8E8E93', letterSpacing: 1 },
  doneButton: {
    backgroundColor: '#1C1C1E',
    height: 56,
    borderRadius: 28,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
