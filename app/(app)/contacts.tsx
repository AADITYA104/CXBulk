import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, StatusBar, Modal, KeyboardAvoidingView, Platform, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useContacts } from "../../context/contacts";

export default function ContactsScreen() {
  const { contacts, isLoading, addContact } = useContacts();
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddContact = async () => {
    if (!newName.trim() || !newNumber.trim()) {
      Alert.alert("Missing Info", "Please enter both name and mobile number.");
      return;
    }

    setIsSaving(true);
    try {
      await addContact(newName, newNumber);
      setModalVisible(false);
      setNewName("");
      setNewNumber("");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to save contact.");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter contacts by search query
  const filteredContacts = contacts.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.mobile.includes(q);
  });

  // Generate initials from name
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Generate a deterministic color from name
  const getAvatarColor = (name: string) => {
    const colors = [
      { bg: "#E5F2FF", text: "#007AFF" },
      { bg: "#E8FAF0", text: "#34C759" },
      { bg: "#FFF3E0", text: "#FF9500" },
      { bg: "#F3E8FF", text: "#AF52DE" },
      { bg: "#E5E5EA", text: "#8E8E93" },
      { bg: "#FEECED", text: "#FF3B30" },
      { bg: "#E0F7FA", text: "#5AC8FA" },
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Contacts</Text>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#C7C7CC" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>ALL CONTACTS ({filteredContacts.length})</Text>

        {isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.emptyText}>Loading contacts...</Text>
          </View>
        ) : filteredContacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color="#C7C7CC" />
            <Text style={styles.emptyText}>
              {searchQuery ? "No contacts match your search" : "No contacts yet"}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? "Try a different search term" : "Tap + to add your first contact"}
            </Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            {filteredContacts.map((contact, idx) => {
              const color = getAvatarColor(contact.name);
              const isLast = idx === filteredContacts.length - 1;
              return (
                <Pressable
                  key={contact.id}
                  style={[styles.listItem, !isLast && styles.listItemBorder]}
                >
                  <View style={styles.listItemContent}>
                    <View style={[styles.avatar, { backgroundColor: color.bg }]}>
                      <Text style={[styles.avatarText, { color: color.text }]}>
                        {getInitials(contact.name)}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      <Text style={styles.contactPhone}>{contact.mobile}</Text>
                      {contact.crop ? (
                        <Text style={styles.contactCrop}>{contact.crop}</Text>
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.messageIconWrap}>
                    <Ionicons name="chatbubble" size={14} color="#FFF" />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.fab,
            pressed && styles.fabPressed
          ]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Add Contact Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>

            {/* Header */}
            <View style={styles.modalHeader}>
              <Pressable onPress={() => { setModalVisible(false); setNewName(""); setNewNumber(""); }}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </Pressable>
              <Text style={styles.modalTitle}>New Contact</Text>
              <Pressable onPress={handleAddContact} disabled={isSaving}>
                {isSaving ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Text style={styles.modalSave}>Save</Text>
                )}
              </Pressable>
            </View>

            {/* Inputs Form */}
            <View style={styles.inputGroup}>
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="Enter contact name"
                  placeholderTextColor="#C7C7CC"
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>
              <View style={[styles.inputRow, styles.inputRowNoBorder]}>
                <Text style={styles.inputLabel}>Mobile</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="+91XXXXXXXXXX"
                  placeholderTextColor="#C7C7CC"
                  keyboardType="phone-pad"
                  value={newNumber}
                  onChangeText={setNewNumber}
                />
              </View>
            </View>

            <Text style={styles.modalDisclaimer}>
              Saving this contact will store it in your account for future broadcasts.
            </Text>

          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F7" },
  header: { 
    backgroundColor: "#F2F2F7", 
    paddingHorizontal: 24, 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, 
    paddingBottom: 16 
  },
  headerTitle: { 
    fontSize: 34, 
    fontWeight: "900", 
    color: "#1C1C1E", 
    letterSpacing: -0.5, 
    marginBottom: 16 
  },
  searchBar: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#E5E5EA", 
    borderRadius: 12, 
    paddingHorizontal: 8, 
    height: 44 
  },
  searchIcon: { marginRight: 8, marginLeft: 4 },
  searchInput: { flex: 1, fontSize: 17, color: "#1C1C1E" },
  
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 120, paddingTop: 16 },
  
  sectionTitle: { fontSize: 13, fontWeight: "600", color: "#8E8E93", letterSpacing: 0.5, marginBottom: 8, marginLeft: 8 },
  
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 17, fontWeight: "600", color: "#8E8E93" },
  emptySubtext: { fontSize: 14, color: "#C7C7CC" },

  listCard: { 
    backgroundColor: "#FFFFFF", 
    borderRadius: 16, 
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  listItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    padding: 16, 
  },
  listItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth, 
    borderBottomColor: "#E5E5EA" 
  },
  listItemContent: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: "700" },
  contactName: { fontSize: 17, fontWeight: "600", color: "#1C1C1E", marginBottom: 2 },
  contactPhone: { fontSize: 14, color: "#8E8E93" },
  contactCrop: { fontSize: 12, color: "#007AFF", fontWeight: "500", marginTop: 2 },
  messageIconWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#007AFF", alignItems: "center", justifyContent: "center" },
  
  fabContainer: { position: "absolute", bottom: 100, right: 24, zIndex: 20 },
  fab: { 
    backgroundColor: "#007AFF", 
    width: 56, 
    height: 56, 
    borderRadius: 28, 
    alignItems: "center", 
    justifyContent: "center",
    shadowColor: "#007AFF", 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 16, 
    elevation: 8 
  },
  fabPressed: { transform: [{ scale: 0.95 }] },

  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  modalContent: { 
    backgroundColor: "#F2F2F7", 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    paddingTop: 24, 
    paddingBottom: Platform.OS === 'ios' ? 48 : 24, 
    paddingHorizontal: 24 
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalCancel: { color: "#007AFF", fontSize: 17 },
  modalTitle: { color: "#1C1C1E", fontWeight: "700", fontSize: 17 },
  modalSave: { color: "#007AFF", fontSize: 17, fontWeight: "700" },
  
  inputGroup: { backgroundColor: "#FFFFFF", borderRadius: 16, overflow: "hidden", marginBottom: 24 },
  inputRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#E5E5EA" },
  inputRowNoBorder: { borderBottomWidth: 0 },
  inputLabel: { color: "#1C1C1E", fontSize: 17, width: 96 },
  inputField: { flex: 1, color: "#1C1C1E", fontSize: 17, paddingVertical: 0 },
  
  modalDisclaimer: { color: "#8E8E93", fontSize: 13, textAlign: "center", paddingHorizontal: 16, lineHeight: 18 }
});
