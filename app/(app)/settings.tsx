import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/auth";

export default function SettingsScreen() {
  const { signOut, user } = useAuth();

  return (
    <View style={{flex: 1, backgroundColor: "#F5F5F7"}}>
      <ScrollView contentContainerStyle={{paddingTop: 64, paddingBottom: 120, paddingHorizontal: 24}}>
        
        <Text style={{fontSize: 32, fontWeight: "800", color: "#1C1C1E", marginBottom: 24}}>Settings</Text>

        {/* Profile Card */}
        <View style={{alignItems: "center", marginBottom: 32}}>
          <View style={{width: 88, height: 88, borderRadius: 44, backgroundColor: user?.role === "superadmin" ? "#5E5CE6" : "#007AFF", alignItems: "center", justifyContent: "center", marginBottom: 16, shadowColor: user?.role === "superadmin" ? "#5E5CE6" : "#007AFF", shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8}}>
            <Text style={{fontSize: 32, fontWeight: "bold", color: "#FFFFFF"}}>{user?.role === "superadmin" ? "SA" : "WD"}</Text>
          </View>
          <Text style={{fontSize: 22, fontWeight: "bold", color: "#1C1C1E"}}>{user?.role === "superadmin" ? "Super Admin" : "Wholesale Distributor"}</Text>
          <Text style={{fontSize: 15, color: "#8E8E93", marginTop: 4}}>{user?.email || "admin@cxbulk.com"}</Text>
          <View style={{flexDirection: "row", alignItems: "center", backgroundColor: "rgba(52,199,89,0.1)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 12}}>
            <Ionicons name="shield-checkmark" size={14} color="#34C759" style={{marginRight: 4}} />
            <Text style={{fontSize: 13, fontWeight: "bold", color: "#34C759"}}>Pro Verified</Text>
          </View>
        </View>

        {/* Account Module */}
        <Text style={{color: "#8E8E93", fontWeight: "600", fontSize: 13, marginBottom: 12, textTransform: "uppercase"}}>Account & Preferences</Text>
        <View style={{backgroundColor: "#fff", borderRadius: 24, paddingHorizontal: 20, marginBottom: 24, shadowColor: "#000", shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2}}>
          
          <Pressable style={{flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F2F2F7", justifyContent: "space-between"}}>
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <View style={{width: 32, height: 32, borderRadius: 8, backgroundColor: "#5E5CE6", alignItems: "center", justifyContent: "center", marginRight: 16}}>
                <Ionicons name="business" size={18} color="#FFF" />
              </View>
              <Text style={{fontSize: 16, fontWeight: "500", color: "#1C1C1E"}}>Business Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </Pressable>

          <Pressable style={{flexDirection: "row", alignItems: "center", paddingVertical: 16, justifyContent: "space-between"}}>
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <View style={{width: 32, height: 32, borderRadius: 8, backgroundColor: "#32ADE6", alignItems: "center", justifyContent: "center", marginRight: 16}}>
                <Ionicons name="key" size={18} color="#FFF" />
              </View>
              <Text style={{fontSize: 16, fontWeight: "500", color: "#1C1C1E"}}>API Keys</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </Pressable>
        </View>

        {/* System Module */}
        <Text style={{color: "#8E8E93", fontWeight: "600", fontSize: 13, marginBottom: 12, textTransform: "uppercase"}}>System Configuration</Text>
        <View style={{backgroundColor: "#fff", borderRadius: 24, paddingHorizontal: 20, marginBottom: 32, shadowColor: "#000", shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2}}>
          
          <Pressable style={{flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F2F2F7", justifyContent: "space-between"}}>
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <View style={{width: 32, height: 32, borderRadius: 8, backgroundColor: "#34C759", alignItems: "center", justifyContent: "center", marginRight: 16}}>
                <Ionicons name="logo-whatsapp" size={18} color="#FFF" />
              </View>
              <Text style={{fontSize: 16, fontWeight: "500", color: "#1C1C1E"}}>WhatsApp Config</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </Pressable>

          <Pressable style={{flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F2F2F7", justifyContent: "space-between"}}>
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <View style={{width: 32, height: 32, borderRadius: 8, backgroundColor: "#FFCC00", alignItems: "center", justifyContent: "center", marginRight: 16}}>
                <Ionicons name="document-text" size={18} color="#FFF" />
              </View>
              <Text style={{fontSize: 16, fontWeight: "500", color: "#1C1C1E"}}>Activity Logs</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </Pressable>

          <Pressable style={{flexDirection: "row", alignItems: "center", paddingVertical: 16, justifyContent: "space-between"}}>
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <View style={{width: 32, height: 32, borderRadius: 8, backgroundColor: "#FF3B30", alignItems: "center", justifyContent: "center", marginRight: 16}}>
                <Ionicons name="hand-left" size={18} color="#FFF" />
              </View>
              <Text style={{fontSize: 16, fontWeight: "500", color: "#1C1C1E"}}>Global DND Filter</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </Pressable>

        </View>

        <Pressable 
          style={{backgroundColor: "#fff", height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2}}
          onPress={() => signOut()}
        >
          <Text style={{color: "#FF3B30", fontSize: 16, fontWeight: "bold"}}>Sign Out</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}
