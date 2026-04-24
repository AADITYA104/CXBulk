import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import Papa from "papaparse";
import { useContacts } from "../../context/contacts";
import { useCampaigns } from "../../context/campaigns";

// ─── Weekly bar chart (static demo) ──────────────────────────────────────────

const chartData = [
  { label: "Mon", value: 380 },
  { label: "Tue", value: 620 },
  { label: "Wed", value: 420 },
  { label: "Thu", value: 890 },
  { label: "Fri", value: 710 },
  { label: "Sat", value: 530 },
  { label: "Sun", value: 310 },
];
const maxVal = Math.max(...chartData.map((d) => d.value));
const CHART_HEIGHT = 150;

function BarChart() {
  return (
    <View style={chart.wrapper}>
      <View style={chart.yAxis}>
        {[maxVal, Math.round(maxVal * 0.5), 0].map((v, i) => (
          <Text key={i} style={chart.yLabel}>
            {v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
          </Text>
        ))}
      </View>
      <View style={chart.barsContainer}>
        {chartData.map((d, i) => {
          const ratio = d.value / maxVal;
          const isPeak = d.value === maxVal;
          return (
            <View key={i} style={chart.barGroup}>
              <Text style={[chart.barValue, isPeak && { color: "#FF6B8A" }]}>
                {d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value}
              </Text>
              <View style={chart.track}>
                <View
                  style={[
                    chart.bar,
                    { height: `${Math.round(ratio * 100)}%` },
                    isPeak ? chart.barPeak : chart.barNormal,
                  ]}
                />
              </View>
              <Text style={chart.xLabel}>{d.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const chart = StyleSheet.create({
  wrapper: { flexDirection: "row", alignItems: "stretch", height: CHART_HEIGHT + 36 },
  yAxis: { justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 22, paddingRight: 6, width: 36 },
  yLabel: { fontSize: 9, color: "#C7C7CC", fontWeight: "600" },
  barsContainer: { flex: 1, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  barGroup: { flex: 1, alignItems: "center", justifyContent: "flex-end", paddingHorizontal: 3 },
  barValue: { fontSize: 8, fontWeight: "700", color: "#8E8E93", marginBottom: 3 },
  track: { width: "100%", height: CHART_HEIGHT, justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 8 },
  barNormal: { backgroundColor: "#007AFF", opacity: 0.75 },
  barPeak: { backgroundColor: "#FF6B8A" },
  xLabel: { fontSize: 9, color: "#8E8E93", fontWeight: "600", marginTop: 6 },
});

// ─── SMS Quota Progress Bar ───────────────────────────────────────────────────

function QuotaBar({ sent, quota }: { sent: number; quota: number }) {
  const pct = Math.min(sent / quota, 1);
  const remaining = Math.max(quota - sent, 0);
  const isNearLimit = pct >= 0.8;
  const barColor = pct >= 1 ? "#FF3B30" : isNearLimit ? "#FF9500" : "#34C759";

  return (
    <View style={styles.quotaCard}>
      <View style={styles.quotaHeader}>
        <View style={styles.quotaLabelRow}>
          <Ionicons name="chatbubble-ellipses" size={16} color={barColor} />
          <Text style={styles.quotaTitle}>SMS Quota Today</Text>
        </View>
        <Text style={[styles.quotaCount, { color: barColor }]}>
          {sent} / {quota}
        </Text>
      </View>

      {/* Progress track */}
      <View style={styles.quotaTrack}>
        <View
          style={[
            styles.quotaFill,
            { width: `${Math.round(pct * 100)}%`, backgroundColor: barColor },
          ]}
        />
      </View>

      <View style={styles.quotaFooter}>
        <Text style={styles.quotaRemaining}>
          {remaining > 0
            ? `${remaining} messages remaining today`
            : "Daily quota reached — resets at midnight"}
        </Text>
        <Text style={styles.quotaPct}>{Math.round(pct * 100)}%</Text>
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const { contacts, importContacts } = useContacts();
  const { campaigns, stats } = useCampaigns();
  const [isImporting, setIsImporting] = useState(false);

  const handleImportFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "text/csv",
          "text/comma-separated-values",
          "application/vnd.ms-excel",
          "text/plain",
          "application/octet-stream",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const pickerAsset = result.assets?.[0];
      if (!pickerAsset) {
        Alert.alert("Error", "No file was selected.");
        return;
      }

      const { name, uri } = pickerAsset; // ✅ Fixed: was `asset` before

      const isCsv =
        name.toLowerCase().endsWith(".csv") ||
        pickerAsset.mimeType?.includes("csv") ||
        pickerAsset.mimeType === "text/comma-separated-values";

      if (!isCsv) {
        Alert.alert(
          "Unsupported Format",
          "Please select a CSV file (.csv). Excel files (.xlsx/.xls) are not yet supported."
        );
        return;
      }

      setIsImporting(true);

      // ✅ Fixed: use classic FileSystem.readAsStringAsync (SDK 54 compatible)
      let fileContent: string;
      try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
          throw new Error("File not found at the selected location.");
        }
        fileContent = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        // Strip UTF-8 BOM if present
        if (fileContent.startsWith("\uFEFF")) {
          fileContent = fileContent.substring(1);
        }
      } catch (readError: any) {
        console.error("File reading failed:", readError);
        Alert.alert("Read Error", "Could not read the file: " + readError.message);
        setIsImporting(false);
        return;
      }

      const parsed = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h: string) => h.trim().toLowerCase(),
      });

      if (parsed.errors.length > 0) {
        const errorMessages = parsed.errors
          .slice(0, 3)
          .map((e: any) => e.message)
          .join("\n");
        Alert.alert(
          "CSV Parse Error",
          `Found ${parsed.errors.length} error(s):\n${errorMessages}`
        );
        setIsImporting(false);
        return;
      }

      const rows = parsed.data as Record<string, string>[];
      if (rows.length === 0) {
        Alert.alert("Empty File", "The CSV file contains no data rows.");
        setIsImporting(false);
        return;
      }

      const mappedRows = rows
        .map((row) => ({
          name: (
            row.name ||
            row.full_name ||
            row.fullname ||
            row.contact_name ||
            ""
          ).trim(),
          mobile: (
            row.mobile ||
            row.phone ||
            row.number ||
            row.phone_number ||
            row.mobile_number ||
            ""
          )
            .trim()
            .replace(/\s+/g, ""),
          crop: (row.crop || row.product || row.category || "").trim(),
        }))
        .filter((r) => r.name && r.mobile);

      if (mappedRows.length === 0) {
        Alert.alert(
          "No Valid Contacts",
          "Could not find valid contacts in the CSV.\n\nMake sure your CSV has 'Name' and 'Mobile' columns.\n\nSupported column names:\n• Name: name, full_name, contact_name\n• Mobile: mobile, phone, number, phone_number\n• Crop: crop, product, category"
        );
        setIsImporting(false);
        return;
      }

      Alert.alert(
        "Import Contacts",
        `Found ${mappedRows.length} valid contacts in "${name}".\n\nDo you want to import them?`,
        [
          { text: "Cancel", style: "cancel", onPress: () => setIsImporting(false) },
          {
            text: "Import",
            style: "default",
            onPress: async () => {
              try {
                const count = await importContacts(mappedRows);
                Alert.alert("Import Complete", `Successfully imported ${count} contacts.`);
              } catch (e: any) {
                Alert.alert("Import Failed", e.message || "An error occurred during import.");
              } finally {
                setIsImporting(false);
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("General error in handleImportFile:", error);
      Alert.alert("Error", "An unexpected error occurred: " + error.message);
      setIsImporting(false);
    }
  };

  // Format total sent nicely
  const formatNum = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

  // Recent campaigns (last 3)
  const recentCampaigns = campaigns.slice(0, 3);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.overviewLabel}>OVERVIEW</Text>
            <Text style={styles.headerTitle}>Dashboard</Text>
          </View>
          <Pressable style={styles.bellButton}>
            <Ionicons name="notifications" size={20} color="#1C1C1E" />
          </Pressable>
        </View>

        {/* Stat Cards */}
        <View style={styles.cardRow}>
          {/* Total Sent */}
          <View style={[styles.card, { backgroundColor: "#FFFFFF" }]}>
            <View style={[styles.cardIconWrap, { backgroundColor: "#E5F2FF" }]}>
              <Ionicons name="paper-plane" size={18} color="#007AFF" />
            </View>
            <Text style={[styles.cardStat, { color: "#1C1C1E" }]}>
              {formatNum(stats.totalSent)}
            </Text>
            <Text style={[styles.cardLabel, { color: "#8E8E93" }]}>Total Sent</Text>
            <View style={styles.cardBadge}>
              <Ionicons name="trending-up" size={10} color="#34C759" />
              <Text style={styles.cardBadgeText}>{stats.campaignsRun} runs</Text>
            </View>
          </View>

          {/* Contacts */}
          <View style={[styles.card, { backgroundColor: "#1C1C1E" }]}>
            <View style={[styles.cardIconWrap, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
              <Ionicons name="people" size={18} color="#FFFFFF" />
            </View>
            <Text style={[styles.cardStat, { color: "#FFFFFF" }]}>{contacts.length}</Text>
            <Text style={[styles.cardLabel, { color: "#8E8E93" }]}>Contacts</Text>
            <View style={[styles.cardBadge, { backgroundColor: "rgba(52,199,89,0.2)" }]}>
              <Ionicons name="trending-up" size={10} color="#30D158" />
              <Text style={[styles.cardBadgeText, { color: "#30D158" }]}>Live</Text>
            </View>
          </View>

          {/* Failed */}
          <View style={[styles.card, { backgroundColor: "#007AFF" }]}>
            <View style={[styles.cardIconWrap, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
              <Ionicons name="close-circle" size={18} color="#FFFFFF" />
            </View>
            <Text style={[styles.cardStat, { color: "#FFFFFF", fontSize: 20 }]}>
              {formatNum(stats.totalFailed)}
            </Text>
            <Text style={[styles.cardLabel, { color: "rgba(255,255,255,0.75)" }]}>Failed</Text>
            <View style={[styles.cardBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Ionicons name="alert-circle" size={10} color="#FFFFFF" />
              <Text style={[styles.cardBadgeText, { color: "#FFFFFF" }]}>Errors</Text>
            </View>
          </View>
        </View>

        {/* SMS Quota Card */}
        <QuotaBar sent={stats.todaySent} quota={stats.quotaPerDay} />

        {/* Chart Card */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Weekly Messages</Text>
              <Text style={styles.chartSubtitle}>Last 7 days activity</Text>
            </View>
            <View style={styles.chartPill}>
              <Text style={styles.chartPillText}>This Week</Text>
            </View>
          </View>
          <BarChart />
          <View style={styles.chartFooter}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#007AFF" }]} />
              <Text style={styles.legendText}>SMS</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#FF6B8A" }]} />
              <Text style={styles.legendText}>Peak</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Text style={styles.chartTotal}>
              Total: {chartData.reduce((a, d) => a + d.value, 0).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: "#007AFF" }]}
            onPress={() => router.push("/(app)/campaign")}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={[styles.actionBtnText, { color: "#FFF" }]}>New</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: "#FFFFFF" }]}
            onPress={() => router.push("/(app)/contacts")}
          >
            <Ionicons name="person-add" size={21} color="#1C1C1E" />
            <Text style={styles.actionBtnText}>Add User</Text>
          </Pressable>
          <Pressable
            style={[
              styles.actionBtn,
              { backgroundColor: "#FFFFFF" },
              isImporting && { opacity: 0.6 },
            ]}
            onPress={handleImportFile}
            disabled={isImporting}
          >
            {isImporting ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Ionicons name="document-text" size={21} color="#1C1C1E" />
            )}
            <Text style={styles.actionBtnText}>
              {isImporting ? "Importing..." : "Import"}
            </Text>
          </Pressable>
        </View>

        {/* Recent Campaigns */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Campaigns</Text>
          <Text style={styles.seeAll}>See All</Text>
        </View>

        <View style={styles.listCard}>
          {recentCampaigns.length === 0 ? (
            <View style={styles.emptyCampaigns}>
              <Ionicons name="paper-plane-outline" size={32} color="#C7C7CC" />
              <Text style={styles.emptyCampaignText}>No campaigns yet</Text>
              <Text style={styles.emptyCampaignSub}>
                Tap "New" above to send your first broadcast
              </Text>
            </View>
          ) : (
            recentCampaigns.map((item, idx) => {
              const isLast = idx === recentCampaigns.length - 1;
              const channelIcon =
                item.channel === "whatsapp"
                  ? "logo-whatsapp"
                  : item.channel === "both"
                  ? "megaphone"
                  : "chatbubble-ellipses";
              const channelColor =
                item.channel === "whatsapp"
                  ? "#34C759"
                  : item.channel === "both"
                  ? "#FF9500"
                  : "#007AFF";
              const channelBg =
                item.channel === "whatsapp"
                  ? "#E8FAF0"
                  : item.channel === "both"
                  ? "#FFF3E0"
                  : "#E5F2FF";
              const statusColor =
                item.status === "completed"
                  ? "#34C759"
                  : item.status === "partial"
                  ? "#FF9500"
                  : "#FF3B30";

              return (
                <Pressable
                  key={item.id}
                  style={[styles.listItem, !isLast && styles.listItemBorder]}
                >
                  <View style={[styles.listIcon, { backgroundColor: channelBg }]}>
                    <Ionicons name={channelIcon as any} size={22} color={channelColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listTitle}>{item.title}</Text>
                    <Text style={styles.listTime}>
                      {new Date(item.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.listCount}>{item.sent}</Text>
                    <View
                      style={[styles.statusDot, { backgroundColor: statusColor }]}
                    />
                  </View>
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 56, paddingBottom: 120, paddingHorizontal: 20 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 24,
    marginTop: 4,
  },
  overviewLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8E8E93",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  headerTitle: { fontSize: 34, fontWeight: "900", color: "#1C1C1E", letterSpacing: -0.5 },
  bellButton: {
    width: 44,
    height: 44,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  // Stat Cards
  cardRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  card: {
    flex: 1,
    borderRadius: 22,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    minHeight: 130,
  },
  cardIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  cardStat: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  cardLabel: { fontSize: 11, fontWeight: "600", marginTop: 2, marginBottom: 6 },
  cardBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8FAF0",
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
    alignSelf: "flex-start",
    gap: 2,
  },
  cardBadgeText: { fontSize: 9, fontWeight: "700", color: "#34C759" },

  // SMS Quota Card
  quotaCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  quotaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  quotaLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  quotaTitle: { fontSize: 15, fontWeight: "700", color: "#1C1C1E" },
  quotaCount: { fontSize: 15, fontWeight: "800" },
  quotaTrack: {
    height: 8,
    backgroundColor: "#F2F2F7",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  quotaFill: { height: 8, borderRadius: 4 },
  quotaFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quotaRemaining: { fontSize: 12, color: "#8E8E93" },
  quotaPct: { fontSize: 12, fontWeight: "700", color: "#1C1C1E" },

  // Chart
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  chartTitle: { fontSize: 17, fontWeight: "800", color: "#1C1C1E" },
  chartSubtitle: { fontSize: 12, color: "#8E8E93", marginTop: 2 },
  chartPill: {
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  chartPillText: { fontSize: 11, fontWeight: "600", color: "#007AFF" },
  chartFooter: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: "#8E8E93", fontWeight: "500" },
  chartTotal: { fontSize: 13, fontWeight: "700", color: "#1C1C1E" },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1C1C1E",
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 4,
  },
  seeAll: { fontSize: 14, color: "#007AFF", fontWeight: "600" },

  actionsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  actionBtn: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  actionBtnText: { fontSize: 12, fontWeight: "700", color: "#1C1C1E" },

  listCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 3,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  listItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
  },
  listIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  listTitle: { fontSize: 15, fontWeight: "700", color: "#1C1C1E" },
  listTime: { fontSize: 12, color: "#8E8E93", marginTop: 2 },
  listCount: { fontSize: 16, fontWeight: "800", color: "#1C1C1E" },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: "flex-end",
  },

  emptyCampaigns: {
    alignItems: "center",
    paddingVertical: 40,
    gap: 8,
  },
  emptyCampaignText: { fontSize: 16, fontWeight: "600", color: "#8E8E93" },
  emptyCampaignSub: { fontSize: 13, color: "#C7C7CC", textAlign: "center", paddingHorizontal: 24 },
});
