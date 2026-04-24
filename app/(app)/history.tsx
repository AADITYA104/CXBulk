import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";

type MessageHistory = {
  id: string;
  campaignName: string;
  message: string;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  status: "completed" | "sending" | "failed";
  sentAt: number;
  channel: "whatsapp" | "sms";
};

function StatusBadge({ status }: { status: string }) {
  const config = {
    completed: { bg: "#E8FAF0", color: "#34C759", label: "Delivered" },
    sending: { bg: "#FFF3E0", color: "#FF9500", label: "Sending" },
    failed: { bg: "#FFEBEE", color: "#FF3B30", label: "Failed" },
  };
  const { bg, color, label } = config[status as keyof typeof config] || config.sending;
  return (
    <View style={[styles.statusBadge, { backgroundColor: bg }]}>
      <Text style={[styles.statusText, { color }]}>{label}</Text>
    </View>
  );
}

function formatTime(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return `Today, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  } else if (diffDays === 1) {
    return `Yesterday, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const [histories, setHistories] = useState<MessageHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "whatsapp" | "sms">("all");

  useEffect(() => {
    if (!user) return;

    const historyRef = collection(db, "users", user.id, "messageHistory");
    const q = query(historyRef, orderBy("sentAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: MessageHistory[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        sentAt: d.data().sentAt || Date.now(),
      })) as MessageHistory[];
      setHistories(list);
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading history:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredHistories = histories.filter(h => 
    filter === "all" ? true : h.channel === filter
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Message History</Text>
        <Text style={styles.subtitle}>Track your sent broadcasts</Text>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {(["all", "whatsapp", "sms"] as const).map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterTab, filter === f && styles.filterTabActive]}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === "all" ? "All" : f === "whatsapp" ? "WhatsApp" : "SMS"}
              </Text>
            </Pressable>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : filteredHistories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="chatbubbles-outline" size={48} color="#C7C7CC" />
            </View>
            <Text style={styles.emptyTitle}>No Messages Yet</Text>
            <Text style={styles.emptyDesc}>
              Your sent broadcasts will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {filteredHistories.map((item, index) => (
              <View 
                key={item.id} 
                style={[
                  styles.historyCard,
                  index === filteredHistories.length - 1 && styles.lastCard
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={[
                      styles.channelIcon,
                      { backgroundColor: item.channel === "whatsapp" ? "rgba(52,199,89,0.1)" : "rgba(0,122,255,0.1)" }
                    ]}>
                      <Ionicons 
                        name={item.channel === "whatsapp" ? "logo-whatsapp" : "chatbubble"} 
                        size={18} 
                        color={item.channel === "whatsapp" ? "#34C759" : "#007AFF"} 
                      />
                    </View>
                    <View style={styles.cardHeaderInfo}>
                      <Text style={styles.campaignName} numberOfLines={1}>{item.campaignName}</Text>
                      <Text style={styles.timeText}>{formatTime(item.sentAt)}</Text>
                    </View>
                  </View>
                  <StatusBadge status={item.status} />
                </View>

                <Text style={styles.messageText} numberOfLines={2}>{item.message}</Text>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                    <Text style={styles.statText}>{item.sentCount} Sent</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="checkmark-done" size={16} color="#007AFF" />
                    <Text style={styles.statText}>{item.deliveredCount} Delivered</Text>
                  </View>
                  {item.failedCount > 0 && (
                    <View style={styles.statItem}>
                      <Ionicons name="alert-circle" size={16} color="#FF3B30" />
                      <Text style={styles.statText}>{item.failedCount} Failed</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  scrollContent: {
    paddingTop: 64,
    paddingBottom: 120,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#8E8E93",
    marginBottom: 24,
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  filterTabActive: {
    backgroundColor: "#F2F2F7",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8E8E93",
  },
  filterTextActive: {
    color: "#1C1C1E",
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 15,
    color: "#8E8E93",
    textAlign: "center",
  },
  historyList: {
    gap: 12,
  },
  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  lastCard: {
    marginBottom: 0,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  channelIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  timeText: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  messageText: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 20,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F2F2F7",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1C1C1E",
  },
});