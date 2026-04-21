import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, StatusBar, Modal, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ContactsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");

  const handleAddFarmer = () => {
    // Add logic here to save the farmer
    setModalVisible(false);
    setNewName("");
    setNewNumber("");
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
          />
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>ALL CONTACTS</Text>

        <View style={styles.listCard}>
          {/* Contact 1 */}
          <Pressable style={styles.listItem}>
            <View style={styles.listItemContent}>
              <View style={[styles.avatar, { backgroundColor: "#E5F2FF" }]}>
                <Text style={[styles.avatarText, { color: "#007AFF" }]}>RK</Text>
              </View>
              <View>
                <Text style={styles.contactName}>Ramesh Kumar</Text>
                <Text style={styles.contactPhone}>+91 98765 43210</Text>
              </View>
            </View>
            <Ionicons name="logo-whatsapp" size={24} color="#34C759" />
          </Pressable>

          {/* Contact 2 */}
          <Pressable style={[styles.listItem, styles.listItemNoBorder]}>
            <View style={styles.listItemContent}>
              <View style={[styles.avatar, { backgroundColor: "#E5E5EA" }]}>
                <Text style={[styles.avatarText, { color: "#8E8E93" }]}>SD</Text>
              </View>
              <View>
                <Text style={styles.contactName}>Suresh Das</Text>
                <Text style={styles.contactPhone}>+91 91234 56789</Text>
              </View>
            </View>
            <View style={styles.messageIconWrap}>
              <Ionicons name="chatbubble" size={14} color="#FFF" />
            </View>
          </Pressable>
        </View>
      </ScrollView>

      {/* iOS Style Floating Action Button */}
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

      {/* Add Farmer Modal (iOS Sheet Style) */}
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
              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </Pressable>
              <Text style={styles.modalTitle}>New Contact</Text>
              <Pressable onPress={handleAddFarmer}>
                <Text style={styles.modalSave}>Save</Text>
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
                  placeholder="+91"
                  placeholderTextColor="#C7C7CC"
                  keyboardType="phone-pad"
                  value={newNumber}
                  onChangeText={setNewNumber}
                />
              </View>
            </View>

            <Text style={styles.modalDisclaimer}>
              Saving this contact will automatically verify their WhatsApp status for future broadcasts.
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
    borderBottomWidth: StyleSheet.hairlineWidth, 
    borderBottomColor: "#E5E5EA" 
  },
  listItemNoBorder: { borderBottomWidth: 0 },
  listItemContent: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: "700" },
  contactName: { fontSize: 17, fontWeight: "600", color: "#1C1C1E", marginBottom: 2 },
  contactPhone: { fontSize: 14, color: "#8E8E93" },
  messageIconWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#007AFF", alignItems: "center", justifyContent: "center" },
  
  fabContainer: { position: "absolute", bottom: 40, right: 24, zIndex: 20 },
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
