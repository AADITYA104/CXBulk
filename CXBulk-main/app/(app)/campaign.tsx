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
import { useRouter } from "expo-router";
import { useContacts } from "../../context/contacts";
import { useTemplates, DLTTemplate } from "../../context/templates";
import { queueProcessor } from "../../lib/queue-processor";
import { creditTracker } from "../../lib/credit-tracker";
import { dndManager } from "../../lib/dnd-checker";
import { auth } from "../../lib/firebase";


// ─── Types ────────────────────────────────────────────────────────────────────

type Channel = "sms" | "whatsapp" | "both";

// ─── Component ────────────────────────────────────────────────────────────────

export default function CampaignScreen() {
  const { contacts } = useContacts();
  const { templates } = useTemplates();
  const router = useRouter();

  // Form state
  const [channel, setChannel] = useState<Channel>("sms");
  const [title, setTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<DLTTemplate | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Derived state
  const charCount = selectedTemplate?.content.length || 0;
  const isUnicode = selectedTemplate ? /[^\u0000-\u007F]/.test(selectedTemplate.content) : false;
  const smsPages = selectedTemplate ? Math.ceil(charCount / (isUnicode ? 70 : 160)) : 1;

  const filteredForPicker = useMemo(() => {
    if (!contactSearch.trim()) return contacts;
    const q = contactSearch.toLowerCase();
    return contacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.mobile.includes(q)
    );
  }, [contacts, contactSearch]);

  const selectedContacts = contacts.filter((c) => selectedIds.has(c.id));

  const estimatedCost = useMemo(() => {
    if (!selectedTemplate || selectedContacts.length === 0) return 0;
    return creditTracker.estimateCost(
      selectedContacts.length,
      channel,
      selectedTemplate.category,
      smsPages
    );
  }, [selectedContacts.length, channel, selectedTemplate, smsPages]);

  const toggleContact = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () =>
    setSelectedIds(new Set(filteredForPicker.map((c) => c.id)));
  const clearAll = () => setSelectedIds(new Set());

  // ── Main send handler ──
  const handleSend = async () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please give your campaign a name.");
      return;
    }
    if (!selectedTemplate) {
      Alert.alert("No Template", "Please select a DLT-approved template.");
      return;
    }
    if (selectedTemplate.status !== 'Approved' && (channel === 'sms' || channel === 'both')) {
      Alert.alert(
        "Template Not Approved",
        "This template is not yet approved on DLT. SMS campaigns require an approved template."
      );
      return;
    }
    if (selectedContacts.length === 0) {
      Alert.alert("No Recipients", "Please select at least one contact.");
      return;
    }

    Alert.alert(
      "Confirm Broadcast",
      `Send "${title}" to ${selectedContacts.length} contacts?\n\nEst. Cost: ₹${estimatedCost}\nChannel: ${channel.toUpperCase()}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start Sending",
          style: "default",
          onPress: async () => {
            setIsSending(true);
            try {
              let finalContacts = [...selectedContacts];

              // 1. DND Scrubbing for Promotional
              if (selectedTemplate.category === 'Promotional') {
                const nonDndNumbers = await dndManager.scrubNumbers(auth.currentUser?.uid!, finalContacts.map(c => c.mobile));
                finalContacts = finalContacts.filter(c => nonDndNumbers.includes(c.mobile));
                
                if (finalContacts.length < selectedContacts.length) {
                  const blocked = selectedContacts.length - finalContacts.length;
                  Alert.alert("DND Scrubbing", `${blocked} contacts were removed because they are in the DND list.`);
                }
              }

              if (finalContacts.length === 0) {
                Alert.alert("No Valid Contacts", "All selected contacts were filtered out (DND or Invalid).");
                setIsSending(false);
                return;
              }

              // 2. Start Queue Processing
              const campaignId = await queueProcessor.createCampaign(
                auth.currentUser?.uid!,
                title.trim(),
                selectedTemplate,
                finalContacts,
                channel
              );

              // 3. Navigate to progress screen
              router.push({ pathname: "/campaign-progress", params: { campaignId } } as any);
              
              // Reset form
              setTitle("");
              setSelectedTemplate(null);
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
              placeholder="e.g. Festival Greetings 2026"
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

        {/* ── Template Selection ── */}
        <View style={styles.section}>
          <View style={styles.sectionLabelRow}>
            <Text style={styles.sectionLabel}>DLT TEMPLATE</Text>
            <Pressable onPress={() => router.push('/templates' as any)}>
              <Text style={styles.selectLink}>Manage Templates →</Text>
            </Pressable>
          </View>
          
          <Pressable 
            style={styles.templateSelector}
            onPress={() => setShowTemplatePicker(true)}
          >
            {selectedTemplate ? (
              <View style={styles.templateSelected}>
                <View style={styles.templateHeader}>
                  <Text style={styles.templateName}>{selectedTemplate.name}</Text>
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryText}>{selectedTemplate.category}</Text>
                  </View>
                </View>
                <Text style={styles.templatePreview} numberOfLines={2}>
                  {selectedTemplate.content}
                </Text>
              </View>
            ) : (
              <View style={styles.templatePlaceholder}>
                <Ionicons name="document-text-outline" size={20} color="#007AFF" />
                <Text style={styles.templatePlaceholderText}>Select an approved template</Text>
              </View>
            )}
            <Ionicons name="chevron-down" size={20} color="#8E8E93" />
          </Pressable>
          
          {selectedTemplate && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>CHARS</Text>
                <Text style={styles.statValue}>{charCount}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>PAGES</Text>
                <Text style={styles.statValue}>{smsPages} SMS</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>EST. COST</Text>
                <Text style={[styles.statValue, { color: '#34C759' }]}>₹{estimatedCost}</Text>
              </View>
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
                {selectedIds.size} contacts selected
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

      {/* ── Template Picker Modal ── */}
      <Modal
        visible={showTemplatePicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTemplatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Template</Text>
              <Pressable onPress={() => setShowTemplatePicker(false)}>
                <Text style={styles.modalClose}>Cancel</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.templateList}>
              {templates.length === 0 ? (
                <View style={styles.modalEmpty}>
                  <Text style={styles.modalEmptyText}>No templates found</Text>
                  <Pressable onPress={() => { setShowTemplatePicker(false); router.push('/template-editor' as any); }}>
                    <Text style={styles.emptyLink}>Create Template</Text>
                  </Pressable>
                </View>
              ) : (
                templates.map((t) => (
                  <Pressable 
                    key={t.id} 
                    style={styles.templateItem}
                    onPress={() => {
                      setSelectedTemplate(t);
                      setShowTemplatePicker(false);
                    }}
                  >
                    <View style={styles.templateItemHeader}>
                      <Text style={styles.templateItemName}>{t.name}</Text>
                      <View style={[styles.statusTag, { backgroundColor: t.status === 'Approved' ? '#34C75920' : '#8E8E9320' }]}>
                        <Text style={[styles.statusTagText, { color: t.status === 'Approved' ? '#34C759' : '#8E8E93' }]}>{t.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.templateItemContent} numberOfLines={1}>{t.content}</Text>
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

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

  // Template selector
  templateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  templatePlaceholder: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  templatePlaceholderText: { color: '#007AFF', fontSize: 15, fontWeight: '600' },
  templateSelected: { flex: 1 },
  templateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  templateName: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
  templatePreview: { fontSize: 13, color: '#8E8E93' },
  categoryPill: { backgroundColor: '#F2F2F7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  categoryText: { fontSize: 10, fontWeight: '700', color: '#8E8E93' },
  
  statsRow: { flexDirection: 'row', marginTop: 12, gap: 16, backgroundColor: '#FFF', padding: 12, borderRadius: 12 },
  statItem: { flex: 1 },
  statLabel: { fontSize: 10, fontWeight: '700', color: '#C7C7CC', marginBottom: 2 },
  statValue: { fontSize: 13, fontWeight: '700', color: '#1C1C1E' },

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

  // Modals
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
  modalEmpty: { padding: 40, alignItems: 'center' },
  modalEmptyText: { color: '#8E8E93', fontSize: 15 },
  emptyLink: { color: '#007AFF', marginTop: 8, fontWeight: '600' },
  
  templateList: { padding: 16 },
  templateItem: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 12 },
  templateItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  templateItemName: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  templateItemContent: { fontSize: 13, color: '#8E8E93' },
  statusTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusTagText: { fontSize: 10, fontWeight: '700' },
  
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
});
