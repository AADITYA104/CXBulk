import { View, Text, ScrollView, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CampaignScreen() {
  return (
    <View style={{flex: 1, backgroundColor: "#F5F5F7"}}>
      <ScrollView contentContainerStyle={{paddingTop: 64, paddingBottom: 120, paddingHorizontal: 24}}>
        
        <Text style={{fontSize: 32, fontWeight: "800", color: "#1C1C1E", marginBottom: 24}}>New Campaign</Text>

        {/* Channel Selection */}
        <View style={{backgroundColor: "#fff", borderRadius: 24, padding: 20, marginBottom: 20, shadowColor: "#000", shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2}}>
          <Text style={{color: "#8E8E93", fontWeight: "600", fontSize: 13, marginBottom: 16, textTransform: "uppercase"}}>Broadcast Method</Text>
          
          <Pressable style={{flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F2F2F7"}}>
            <View style={{width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(52,199,89,0.1)", alignItems: "center", justifyContent: "center", marginRight: 16}}>
              <Ionicons name="logo-whatsapp" size={20} color="#34C759" />
            </View>
            <View style={{flex: 1}}>
              <Text style={{fontSize: 16, fontWeight: "600", color: "#1C1C1E"}}>WhatsApp Priority</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
          </Pressable>

          <Pressable style={{flexDirection: "row", alignItems: "center", paddingVertical: 12}}>
            <View style={{width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(0,122,255,0.1)", alignItems: "center", justifyContent: "center", marginRight: 16}}>
              <Ionicons name="chatbubble" size={20} color="#007AFF" />
            </View>
            <View style={{flex: 1}}>
              <Text style={{fontSize: 16, fontWeight: "600", color: "#1C1C1E"}}>Standard SMS</Text>
            </View>
            <View style={{width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: "#C7C7CC"}} />
          </Pressable>
        </View>

        {/* Message Editor */}
        <View style={{backgroundColor: "#fff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2}}>
          <Text style={{color: "#8E8E93", fontWeight: "600", fontSize: 13, marginBottom: 12, textTransform: "uppercase"}}>Message Content</Text>
          
          <View style={{backgroundColor: "#F2F2F7", borderRadius: 16, minHeight: 120, padding: 16, marginBottom: 16}}>
            <TextInput
              multiline
              placeholder="Type your message here..."
              placeholderTextColor="#8E8E93"
              style={{fontSize: 16, color: "#1C1C1E", lineHeight: 24, textAlignVertical: "top"}}
            />
          </View>

          <View style={{flexDirection: "row", flexWrap: "wrap", gap: 8}}>
            <Pressable style={{backgroundColor: "rgba(0,122,255,0.1)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12}}>
              <Text style={{color: "#007AFF", fontWeight: "600", fontSize: 14}}>+ {`{Name}`}</Text>
            </Pressable>
            <Pressable style={{backgroundColor: "rgba(0,122,255,0.1)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12}}>
              <Text style={{color: "#007AFF", fontWeight: "600", fontSize: 14}}>+ {`{Crop}`}</Text>
            </Pressable>
          </View>
        </View>

        <Pressable style={{backgroundColor: "#007AFF", height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginTop: 24, shadowColor: "#007AFF", shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4}}>
          <Text style={{color: "#fff", fontSize: 18, fontWeight: "bold"}}>Send Broadcast</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}
