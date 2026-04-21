import { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput } from "../../src/tw";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar, Modal, KeyboardAvoidingView, Platform } from "react-native";

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
    <View className="flex-1 bg-[#F5F5F7]">
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View className="bg-white px-6 pt-16 pb-4 z-10 border-b border-gray-100">
        <Text className="text-3xl font-extrabold text-black tracking-tight mb-4">Contact</Text>

        <View className="bg-gray-100 flex-row items-center p-2 rounded-xl">
          <Ionicons name="search" size={20} color="#8E8E93" className="ml-2 mr-2" />
          <TextInput
            className="flex-1 py-1 text-black font-medium"
            placeholder="Search"
            placeholderTextColor="#8E8E93"
          />
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-32 pt-5">
        <Text className="text-gray-500 font-medium text-sm mb-3 uppercase tracking-wider">All Contacts</Text>

        <View className="bg-white rounded-[24px] overflow-hidden shadow-sm">
          {/* Contact 1 */}
          <Pressable className="p-4 border-b border-gray-100 flex-row justify-between items-center active:bg-gray-50">
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-3">
                <Text className="text-[#007AFF] font-bold text-lg">RK</Text>
              </View>
              <View>
                <Text className="font-bold text-black text-base">Ramesh Kumar</Text>
                <Text className="text-sm text-gray-500 mt-0.5">+91 98765 43210</Text>
              </View>
            </View>
            <Ionicons name="logo-whatsapp" size={20} color="#34C759" />
          </Pressable>

          {/* Contact 2 */}
          <Pressable className="p-4 flex-row justify-between items-center active:bg-gray-50">
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-3">
                <Text className="text-gray-500 font-bold text-lg">SD</Text>
              </View>
              <View>
                <Text className="font-bold text-black text-base">Suresh Das</Text>
                <Text className="text-sm text-gray-500 mt-0.5">+91 91234 56789</Text>
              </View>
            </View>
            <Ionicons name="chatbubble" size={20} color="#007AFF" />
          </Pressable>
        </View>
      </ScrollView>

      {/* iOS Style Floating Action Button */}
      <View style={{ position: "absolute", bottom: 112, right: 24, zIndex: 20 }}>
        <Pressable
          style={({ pressed }) => [
            {
              backgroundColor: "#007AFF", width: 56, height: 56, borderRadius: 28,
              alignItems: "center", justifyContent: "center",
              shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8
            },
            pressed && { transform: [{ scale: 0.95 }] }
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
          style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          <View style={{ backgroundColor: "#F2F2F7", borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 24, paddingBottom: 48, paddingHorizontal: 24, height: "85%" }}>

            {/* Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={{ color: "#007AFF", fontSize: 18 }}>Cancel</Text>
              </Pressable>
              <Text style={{ color: "#000", fontWeight: "bold", fontSize: 18 }}>New Farmer</Text>
              <Pressable onPress={handleAddFarmer}>
                <Text style={{ color: "#007AFF", fontSize: 18, fontWeight: "bold" }}>Save</Text>
              </Pressable>
            </View>

            {/* Inputs Form */}
            <View style={{ backgroundColor: "#fff", borderRadius: 20, overflow: "hidden", marginBottom: 24 }}>
              <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#F2F2F7" }}>
                <Text style={{ color: "#000", fontSize: 16, width: 96 }}>Name</Text>
                <TextInput
                  style={{ flex: 1, color: "#000", fontSize: 16, paddingVertical: 0 }}
                  placeholder="Enter farmer's name"
                  placeholderTextColor="#C7C7CC"
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
                <Text style={{ color: "#000", fontSize: 16, width: 96 }}>Mobile</Text>
                <TextInput
                  style={{ flex: 1, color: "#000", fontSize: 16, paddingVertical: 0 }}
                  placeholder="+91"
                  placeholderTextColor="#C7C7CC"
                  keyboardType="phone-pad"
                  value={newNumber}
                  onChangeText={setNewNumber}
                />
              </View>
            </View>

            <Text style={{ color: "#8E8E93", fontSize: 14, textAlign: "center", paddingHorizontal: 16 }}>
              Saving this contact will automatically verify their WhatsApp status for future broadcasts.
            </Text>

          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}
