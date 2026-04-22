import { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { File as ExpoFile } from "expo-file-system";
import Papa from "papaparse";
import { useContacts } from "../../context/contacts";

const chartData = [
  { label: "Mon", value: 380 },
  { label: "Tue", value: 620 },
  { label: "Wed", value: 420 },
  { label: "Thu", value: 890 },
  { label: "Fri", value: 710 },
  { label: "Sat", value: 530 },
  { label: "Sun", value: 310 },
];

const maxVal = Math.max(...chartData.map(d => d.value));

function BarChart() {
  return (
    <View style={chart.wrapper}>
      {/* Y-axis labels */}
      <View style={chart.yAxis}>
        {[maxVal, Math.round(maxVal * 0.5), 0].map((v, i) => (
          <Text key={i} style={chart.yLabel}>{v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}</Text>
        ))}
      </View>

      {/* Bars + X labels */}
      <View style={chart.barsContainer}>
        {chartData.map((d, i) => {
          const ratio = d.value / maxVal;
          const isPeak = d.value === maxVal;
          return (
            <View key={i} style={chart.barGroup}>
              {/* Value label on top of bar */}
              <Text style={[chart.barValue, isPeak && { color: "#FF6B8A" }]}>
                {d.value >= 1000 ? `${(d.value/1000).toFixed(1)}k` : d.value}
              </Text>
              {/* Track */}
              <View style={chart.track}>
                {/* Fill */}
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

const CHART_HEIGHT = 150;

const chart = StyleSheet.create({
  wrapper: { flexDirection: "row", alignItems: "stretch", height: CHART_HEIGHT + 36 },
  yAxis: { justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 22, paddingRight: 6, width: 36 },
  yLabel: { fontSize: 9, color: "#C7C7CC", fontWeight: "600" },
  barsContainer: { flex: 1, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  barGroup: { flex: 1, alignItems: "center", justifyContent: "flex-end", paddingHorizontal: 3 },
  barValue: { fontSize: 8, fontWeight: "700", color: "#8E8E93", marginBottom: 3 },
  track: { width: "100%", height: CHART_HEIGHT, justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 8, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  barNormal: { backgroundColor: "#007AFF", opacity: 0.75 },
  barPeak: { backgroundColor: "#FF6B8A" },
  xLabel: { fontSize: 9, color: "#8E8E93", fontWeight: "600", marginTop: 6 },
  chartFooter: { flexDirection: "row", alignItems: "center", marginTop: 12, gap: 12 },
});

export default function DashboardScreen() {
  const { contacts, importContacts } = useContacts();
  const [isImporting, setIsImporting] = useState(false);

  const handleImportFile = async () => {
    try {
      // 1. Pick the document
      const result = await DocumentPicker.getDocumentAsync({
        // Support common CSV MIME types including those used by Android/Excel
        type: [
          "text/csv", 
          "text/comma-separated-values", 
          "application/vnd.ms-excel", 
          "text/plain",
          "application/octet-stream"
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const pickerAsset = result.assets?.[0];
      if (!pickerAsset) {
        Alert.alert("Error", "No file was selected.");
        return;
      }

      const { name, uri } = asset;
      
      // 2. Initial validation
      const isCsv = name.toLowerCase().endsWith(".csv") || 
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

      // 3. Verify file and read content using new SDK 54 API
      let fileContent: string;
      try {
        const expoFile = new ExpoFile(uri);
        
        if (!expoFile.exists) {
          throw new Error("File not found at picked location.");
        }

        // Read as text (new API uses .text() which returns a promise)
        fileContent = await expoFile.text();

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

      // 4. Parse CSV
      const parsed = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h: string) => h.trim().toLowerCase(),
      });

      if (parsed.errors.length > 0) {
        const errorMessages = parsed.errors.slice(0, 3).map((e: any) => e.message).join("\n");
        Alert.alert("CSV Parse Error", `Found ${parsed.errors.length} error(s):\n${errorMessages}`);
        setIsImporting(false);
        return;
      }

      const rows = parsed.data as Record<string, string>[];
      if (rows.length === 0) {
        Alert.alert("Empty File", "The CSV file contains no data rows.");
        setIsImporting(false);
        return;
      }

      // 5. Map and filter
      const mappedRows = rows.map((row) => ({
        name: (row.name || row.full_name || row.fullname || row.contact_name || "").trim(),
        mobile: (row.mobile || row.phone || row.number || row.phone_number || row.mobile_number || "").trim().replace(/\s+/g, ""),
        crop: (row.crop || row.product || row.category || "").trim(),
      })).filter(r => r.name && r.mobile);

      if (mappedRows.length === 0) {
        Alert.alert(
          "No Valid Contacts",
          "Could not find valid contacts in the CSV. Make sure your CSV has 'Name' and 'Mobile' columns.\n\nSupported column names:\n• Name: name, full_name, contact_name\n• Mobile: mobile, phone, number, phone_number\n• Crop: crop, product, category"
        );
        setIsImporting(false);
        return;
      }

      // 6. Preview & Confirm
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
          <View style={[styles.card, { backgroundColor: "#FFFFFF" }]}>
            <View style={[styles.cardIconWrap, { backgroundColor: "#E5F2FF" }]}>
              <Ionicons name="paper-plane" size={18} color="#007AFF" />
            </View>
            <Text style={[styles.cardStat, { color: "#1C1C1E" }]}>1.2k</Text>
            <Text style={[styles.cardLabel, { color: "#8E8E93" }]}>Total Sent</Text>
            <View style={styles.cardBadge}>
              <Ionicons name="trending-up" size={10} color="#34C759" />
              <Text style={styles.cardBadgeText}>+12%</Text>
            </View>
          </View>

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

          <View style={[styles.card, { backgroundColor: "#007AFF" }]}>
            <View style={[styles.cardIconWrap, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
            </View>
            <Text style={[styles.cardStat, { color: "#FFFFFF", fontSize: 20 }]}>96.4%</Text>
            <Text style={[styles.cardLabel, { color: "rgba(255,255,255,0.75)" }]}>Delivery</Text>
            <View style={[styles.cardBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Ionicons name="trending-up" size={10} color="#FFFFFF" />
              <Text style={[styles.cardBadgeText, { color: "#FFFFFF" }]}>+2%</Text>
            </View>
          </View>
        </View>

        {/* Chart Card */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Weekly Messages</Text>
              <Text style={styles.chartSubtitle}>Apr 9 – Apr 16, 2026</Text>
            </View>
            <View style={styles.chartPill}>
              <Text style={styles.chartPillText}>This Week</Text>
            </View>
          </View>

          <BarChart />

          <View style={chart.chartFooter}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#007AFF" }]} />
              <Text style={styles.legendText}>SMS</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: "#FF6B8A" }]} />
              <Text style={styles.legendText}>Peak</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Text style={styles.chartTotal}>Total: 3,860</Text>
          </View>
        </View>

        {/* Actions */}
        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.actionsRow}>
          <Pressable style={[styles.actionBtn, { backgroundColor: "#007AFF" }]} onPress={() => router.push("/(app)/campaign")}>
            <Ionicons name="add" size={24} color="white" />
            <Text style={[styles.actionBtnText, { color: "#FFF" }]}>New</Text>
          </Pressable>
          <Pressable style={[styles.actionBtn, { backgroundColor: "#FFFFFF" }]} onPress={() => router.push("/(app)/contacts")}>
            <Ionicons name="person-add" size={21} color="#1C1C1E" />
            <Text style={styles.actionBtnText}>Add User</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: "#FFFFFF" }, isImporting && { opacity: 0.6 }]}
            onPress={handleImportFile}
            disabled={isImporting}
          >
            {isImporting ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Ionicons name="document-text" size={21} color="#1C1C1E" />
            )}
            <Text style={styles.actionBtnText}>{isImporting ? "Importing..." : "Import"}</Text>
          </Pressable>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text style={styles.seeAll}>See All</Text>
        </View>

        <View style={styles.listCard}>
          {[
            { icon: "logo-whatsapp", color: "#34C759", bg: "#E8FAF0", label: "Wheat Market Update", time: "Today, 9:41 AM", count: "842", isPeak: true },
            { icon: "chatbubble-ellipses", color: "#007AFF", bg: "#E5F2FF", label: "Fertilizer Subsidy", time: "Aug 23, 2:30 PM", count: "462", isPeak: false },
            { icon: "megaphone", color: "#FF9500", bg: "#FFF3E0", label: "Crop Advisory Alert", time: "Aug 20, 10:00 AM", count: "301", isPeak: false },
          ].map((item, idx, arr) => (
            <Pressable
              key={idx}
              style={[styles.listItem, idx < arr.length - 1 && styles.listItemBorder]}
            >
              <View style={[styles.listIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{item.label}</Text>
                <Text style={styles.listTime}>{item.time}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.listCount}>{item.count}</Text>
                <View style={[styles.statusDot, { backgroundColor: item.isPeak ? "#34C759" : "#8E8E93" }]} />
              </View>
            </Pressable>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 56, paddingBottom: 120, paddingHorizontal: 20 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, marginTop: 4 },
  overviewLabel: { fontSize: 11, fontWeight: "700", color: "#8E8E93", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 2 },
  headerTitle: { fontSize: 34, fontWeight: "900", color: "#1C1C1E", letterSpacing: -0.5 },
  bellButton: { width: 44, height: 44, backgroundColor: "#FFFFFF", borderRadius: 22, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },

  cardRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  card: { flex: 1, borderRadius: 22, padding: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3, minHeight: 130 },
  cardIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  cardStat: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  cardLabel: { fontSize: 11, fontWeight: "600", marginTop: 2, marginBottom: 6 },
  cardBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#E8FAF0", borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2, alignSelf: "flex-start", gap: 2 },
  cardBadgeText: { fontSize: 9, fontWeight: "700", color: "#34C759" },

  chartCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 18, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 14, elevation: 3 },
  chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  chartTitle: { fontSize: 17, fontWeight: "800", color: "#1C1C1E" },
  chartSubtitle: { fontSize: 12, color: "#8E8E93", marginTop: 2 },
  chartPill: { backgroundColor: "#F2F2F7", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  chartPillText: { fontSize: 11, fontWeight: "600", color: "#007AFF" },
  chartFooter: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, color: "#8E8E93", fontWeight: "500" },
  chartTotal: { fontSize: 13, fontWeight: "700", color: "#1C1C1E" },

  sectionTitle: { fontSize: 20, fontWeight: "800", color: "#1C1C1E", letterSpacing: -0.3, marginBottom: 12 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 4 },
  seeAll: { fontSize: 14, color: "#007AFF", fontWeight: "600" },

  actionsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  actionBtn: { flex: 1, borderRadius: 22, paddingVertical: 16, alignItems: "center", justifyContent: "center", gap: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  actionBtnText: { fontSize: 12, fontWeight: "700", color: "#1C1C1E" },

  listCard: { backgroundColor: "#FFFFFF", borderRadius: 22, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 14, elevation: 3 },
  listItem: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  listItemBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  listIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  listTitle: { fontSize: 15, fontWeight: "700", color: "#1C1C1E" },
  listTime: { fontSize: 12, color: "#8E8E93", marginTop: 2 },
  listCount: { fontSize: 16, fontWeight: "800", color: "#1C1C1E" },
  statusDot: { width: 7, height: 7, borderRadius: 4, marginTop: 4, alignSelf: "flex-end" },
});
