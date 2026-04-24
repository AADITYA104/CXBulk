import { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SMS from "expo-sms";
import * as Linking from "expo-linking";
import { useContacts, Contact } from "../../context/contacts";
import { useCampaigns } from "../../context/campaigns";

// ─── Types ────────────────────────────────────────────────────────────────────

type Channel = "sms" | "whatsapp" | "both";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function personalise(template: string, contact: Contact): string {
  return template
    .replace(/\{Name\}/gi, contact.name)
    .replace(/\{Crop\}/gi, contact.crop || "")
    .replace(/\{Mobile\}/gi, contact.mobile);
}

/** Normalise number to E.164 format for WhatsApp links */
function toWhatsAppNumber(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  if (digits.length === 10) return "91" + digits; // assume India
  return digits;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CampaignScreen() {
  const { contacts } = useContacts();
  const { addCampaign } = useCampaigns();

  // Form state
  const [channel, setChannel] = useState<Channel>("sms");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [dltTemplateId, setDltTemplateId] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Character + DLT info
  const charCount = message.length;
  const smsPages = Math.ceil(charCount / 160) || 1;

  // Filtered contacts for picker
  const filteredForPicker = useMemo(() => {
    if (!contactSearch.trim()) return contacts;
    const q = contactSearch.toLowerCase();
    return contacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.mobile.includes(q)
    );
  }, [contacts, contactSearch]);

  const selectedContacts = contacts.filter((c) => selectedIds.has(c.id));

  const toggleContact = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () =>
    setSelectedIds(new Set(filteredForPicker.map((c) => c.id)));
  const clearAll = () => setSelectedIds(new Set());

  // ── Personalise preview ──
  const preview = useMemo(() => {
    const demo: Contact = {
      id: "demo",
      name: "Rajesh Patel",
      mobile: "9876543210",
      crop: "Wheat",
      createdAt: 0,
    };
    return personalise(message, demo);
  }, [message]);

  // ── Send via SMS (expo-sms) ──
  const sendSMS = async (contacts: Contact[]): Promise<{ sent: number; failed: number }> => {
    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      throw new Error("SMS is not available on this device.");
    }

    let sent = 0;
    let failed = 0;

    for (const contact of contacts) {
      try {
        const body = personalise(message, contact);
        const { result } = await SMS.sendSMSAsync([contact.mobile], body);
        if (result === "sent" || result === "unknown") {
          sent++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }
    return { sent, failed };
  };

  // ── Send via WhatsApp (deep link) ──
  const sendWhatsApp = async (contacts: Contact[]): Promise<{ sent: number; failed: number }> => {
    let sent = 0;
    let failed = 0;

    for (const contact of contacts) {
      try {
        const body = personalise(message, contact);
        const num = toWhatsAppNumber(contact.mobile);
        const url = `whatsapp://send?phone=${num}&text=${encodeURIComponent(body)}`;
        const canOpen = await Linking.canOpenURL(url);
        if (!canOpen) {
          failed++;
          continue;
        }
        await Linking.openURL(url);
        // Wait a moment between messages to avoid being flagged as spam
        await new Promise((res) => setTimeout(res, 2000));
        sent++;
      } catch {
        failed++;
      }
    }
    return { sent, failed };
  };

  // ── Main send handler ──
  const handleSend = async () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please give your campaign a name.");
      return;
    }
    if (!message.trim()) {
      Alert.alert("Missing Message", "Please type your message.");
      return;
    }
    if (channel === "sms" && !dltTemplateId.trim()) {
      Alert.alert(
        "DLT Template ID Required",
        "For SMS campaigns, you must provide a TRAI-registered DLT Template ID to comply with regulations."
      );
      return;
    }
    if (selectedContacts.length === 0) {
      Alert.alert("No Recipients", "Please select at least one contact.");
      return;
    }

    Alert.alert(
      "Confirm Broadcast",
      `Send "${title}" to ${selectedContacts.length} contact(s) via ${
        channel === "both" ? "WhatsApp + SMS" : channel.toUpperCase()
      }?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          style: "default",
          onPress: async () => {
            setIsSending(true);
            try {
              let totalSent = 0;
              let totalFailed = 0;

              if (channel === "sms" || channel === "both") {
                const { sent, failed } = await sendSMS(selectedContacts);
                totalSent += sent;
                totalFailed += failed;
              }

              if (channel === "whatsapp" || channel === "both") {
                const { sent, failed } = await sendWhatsApp(selectedContacts);
                totalSent += sent;
                totalFailed += failed;
              }

              // Record campaign in Firestore
              await addCampaign({
                title: title.trim(),
                message: message.trim(),
                dltTemplateId: dltTemplateId.trim(),
                channel,
                totalContacts: selectedContacts.length,
                sent: totalSent,
                failed: totalFailed,
              });

              Alert.alert(
                "Broadcast Complete",
                `✅ Sent: ${totalSent}\n❌ Failed: ${totalFailed}\n\nCampaign saved to history.`
              );

              // Reset form
              setTitle("");
              setMessage("");
              setDltTemplateId("");
              setSelectedIds(new Set());
            } catch (e: any) {
              Alert.alert("Send Error", e.message || "An unexpected error occurred.");
            } finally {
              setIsSending(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>New Campaign</Text>

        {/* ── Campaign Title ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CAMPAIGN NAME</Text>
          <View style={styles.inputRow}>
            <Ionicons name="megaphone-outline" size={18} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.inputField}
              placeholder="e.g. Wheat Market Update"
              placeholderTextColor="#C7C7CC"
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>

        {/* ── Channel Selection ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>BROADCAST METHOD</Text>
          <View style={styles.channelRow}>
            {(
              [
                { key: "sms" as Channel, label: "SMS", icon: "chatbubble", color: "#007AFF", bg: "rgba(0,122,255,0.1)" },
                { key: "whatsapp" as Channel, label: "WhatsApp", icon: "logo-whatsapp", color: "#34C759", bg: "rgba(52,199,89,0.1)" },
                { key: "both" as Channel, label: "Both", icon: "megaphone", color: "#FF9500", bg: "rgba(255,149,0,0.1)" },
              ] as const
            ).map((ch) => {
              const isActive = channel === ch.key;
              return (
                <Pressable
                  key={ch.key}
                  style={[
                    styles.channelBtn,
                    { borderColor: isActive ? ch.color : "#E5E5EA" },
                    isActive && { backgroundColor: ch.bg },
                  ]}
                  onPress={() => setChannel(ch.key)}
                >
                  <Ionicons name={ch.icon as any} size={22} color={isActive ? ch.color : "#C7C7CC"} />
                  <Text style={[styles.channelLabel, isActive && { color: ch.color }]}>
                    {ch.label}
                  </Text>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={14} color={ch.color} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── DLT Template ID (only for SMS / both) ── */}
        {(channel === "sms" || channel === "both") && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DLT TEMPLATE ID</Text>
            <View style={styles.inputRow}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.inputField}
                placeholder="TRAI Registered Template ID"
                placeholderTextColor="#C7C7CC"
                keyboardType="number-pad"
                value={dltTemplateId}
                onChangeText={setDltTemplateId}
              />
            </View>
            <Text style={styles.helperText}>
              Required by TRAI for commercial SMS. Register at sanchar.trai.gov.in
            </Text>
          </View>
        )}

        {/* ── Message Editor ── */}
        <View style={styles.section}>
          <View style={styles.sectionLabelRow}>
            <Text style={styles.sectionLabel}>MESSAGE CONTENT</Text>
            <Text style={styles.charCount}>
              {charCount} chars · {smsPages} SMS
            </Text>
          </View>

          <View style={styles.messageBox}>
            <TextInput
              multiline
              placeholder="Type your message here... Use {Name}, {Crop} for personalization."
              placeholderTextColor="#8E8E93"
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              textAlignVertical="top"
            />
          </View>

          {/* Variable chips */}
          <View style={styles.chipsRow}>
            {["{Name}", "{Crop}", "{Mobile}"].map((v) => (
              <Pressable
                key={v}
                style={styles.chip}
                onPress={() => setMessage((m) => m + v)}
              >
                <Text style={styles.chipText}>+ {v}</Text>
              </Pressable>
            ))}
          </View>

          {/* Preview */}
          {message.trim().length > 0 && (
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>PREVIEW</Text>
              <Text style={styles.previewText}>{preview}</Text>
            </View>
          )}
        </View>

        {/* ── Contact Selector ── */}
        <View style={styles.section}>
          <View style={styles.sectionLabelRow}>
            <Text style={styles.sectionLabel}>RECIPIENTS</Text>
            <Pressable onPress={() => setShowContactPicker(true)}>
              <Text style={styles.selectLink}>
                {selectedIds.size > 0
                  ? `${selectedIds.size} selected — change`
                  : "Select contacts →"}
              </Text>
            </Pressable>
          </View>

          {selectedIds.size > 0 ? (
            <View style={styles.recipientPill}>
              <Ionicons name="people" size={16} color="#007AFF" />
              <Text style={styles.recipientPillText}>
                {selectedIds.size} of {contacts.length} contacts selected
              </Text>
              <Pressable onPress={clearAll}>
                <Ionicons name="close-circle" size={16} color="#8E8E93" />
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.selectContactsBtn}
              onPress={() => setShowContactPicker(true)}
            >
              <Ionicons name="people-outline" size={20} color="#007AFF" />
              <Text style={styles.selectContactsBtnText}>
                {contacts.length > 0
                  ? `Choose from ${contacts.length} contacts`
                  : "No contacts — import some first"}
              </Text>
            </Pressable>
          )}
        </View>

        {/* ── Send Button ── */}
        <Pressable
          style={[styles.sendBtn, isSending && { opacity: 0.7 }]}
          onPress={handleSend}
          disabled={isSending}
        >
          {isSending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="paper-plane" size={20} color="#FFF" />
              <Text style={styles.sendBtnText}>Send Broadcast</Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      {/* ── Contact Picker Modal ── */}
      <Modal
        visible={showContactPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowContactPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowContactPicker(false)}>
                <Text style={styles.modalClose}>Done</Text>
              </Pressable>
              <Text style={styles.modalTitle}>Select Recipients</Text>
              <Pressable onPress={selectAll}>
                <Text style={styles.modalSelectAll}>All</Text>
              </Pressable>
            </View>

            {/* Search */}
            <View style={styles.modalSearch}>
              <Ionicons name="search" size={16} color="#8E8E93" />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search contacts..."
                placeholderTextColor="#C7C7CC"
                value={contactSearch}
                onChangeText={setContactSearch}
              />
            </View>

            {/* List */}
            <ScrollView showsVerticalScrollIndicator={false}>
              {filteredForPicker.length === 0 ? (
                <View style={styles.modalEmpty}>
                  <Text style={styles.modalEmptyText}>No contacts found</Text>
                </View>
              ) : (
                filteredForPicker.map((c) => {
                  const isSelected = selectedIds.has(c.id);
                  return (
                    <Pressable
                      key={c.id}
                      style={styles.contactRow}
                      onPress={() => toggleContact(c.id)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && { backgroundColor: "#007AFF", borderColor: "#007AFF" },
                        ]}
                      >
                        {isSelected && <Ionicons name="checkmark" size={12} color="#FFF" />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.contactRowName}>{c.name}</Text>
                        <Text style={styles.contactRowPhone}>{c.mobile}</Text>
                      </View>
                      {c.crop ? (
                        <Text style={styles.contactRowCrop}>{c.crop}</Text>
                      ) : null}
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  scrollContent: {
    paddingTop: 56,
    paddingBottom: 120,
    paddingHorizontal: 20,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: "#1C1C1E",
    letterSpacing: -0.5,
    marginBottom: 24,
  },

  section: { marginBottom: 20 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8E8E93",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  sectionLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: { marginRight: 10 },
  inputField: { flex: 1, fontSize: 16, color: "#1C1C1E" },

  helperText: {
    fontSize: 11,
    color: "#8E8E93",
    marginTop: 6,
    marginLeft: 4,
    lineHeight: 16,
  },

  // Channel selector
  channelRow: { flexDirection: "row", gap: 10 },
  channelBtn: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 14,
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
  },
  channelLabel: { fontSize: 12, fontWeight: "700", color: "#C7C7CC" },

  // Message
  charCount: { fontSize: 11, color: "#8E8E93", fontWeight: "600" },
  messageBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    minHeight: 130,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 10,
  },
  messageInput: { flex: 1, fontSize: 16, color: "#1C1C1E", lineHeight: 24 },
  chipsRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  chip: {
    backgroundColor: "rgba(0,122,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  chipText: { color: "#007AFF", fontWeight: "600", fontSize: 13 },
  previewBox: {
    backgroundColor: "#E8FAF0",
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#34C759",
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#34C759",
    letterSpacing: 1,
    marginBottom: 4,
  },
  previewText: { fontSize: 14, color: "#1C1C1E", lineHeight: 20 },

  // Recipients
  selectLink: { fontSize: 13, color: "#007AFF", fontWeight: "600" },
  recipientPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5F2FF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  recipientPillText: { flex: 1, color: "#007AFF", fontSize: 14, fontWeight: "600" },
  selectContactsBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  selectContactsBtnText: { fontSize: 15, color: "#007AFF", fontWeight: "600" },

  // Send button
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#007AFF",
    height: 56,
    borderRadius: 28,
    marginTop: 8,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  sendBtnText: { color: "#FFF", fontSize: 18, fontWeight: "700" },

  // Contact Picker Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalSheet: {
    backgroundColor: "#F2F2F7",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: Platform.OS === "ios" ? 48 : 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
  },
  modalClose: { fontSize: 17, color: "#007AFF", fontWeight: "700" },
  modalTitle: { fontSize: 17, fontWeight: "700", color: "#1C1C1E" },
  modalSelectAll: { fontSize: 15, color: "#007AFF" },
  modalSearch: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E5EA",
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  modalSearchInput: { flex: 1, fontSize: 15, color: "#1C1C1E" },
  modalEmpty: { padding: 40, alignItems: "center" },
  modalEmptyText: { color: "#8E8E93", fontSize: 15 },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#C7C7CC",
    alignItems: "center",
    justifyContent: "center",
  },
  contactRowName: { fontSize: 15, fontWeight: "600", color: "#1C1C1E" },
  contactRowPhone: { fontSize: 12, color: "#8E8E93", marginTop: 1 },
  contactRowCrop: {
    fontSize: 11,
    color: "#007AFF",
    fontWeight: "600",
    backgroundColor: "#E5F2FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
});
