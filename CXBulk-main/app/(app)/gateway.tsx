import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function GatewayScreen() {
  return (
    <View style={{flex: 1, backgroundColor: "#F5F5F7"}}>
      <ScrollView contentContainerStyle={{paddingTop: 64, paddingBottom: 120, paddingHorizontal: 24}}>
        
        <Text style={{fontSize: 32, fontWeight: "800", color: "#1C1C1E", marginBottom: 24}}>Local Gateway</Text>

        <View style={{alignItems: "center", justifyContent: "center", marginVertical: 32}}>
          <View style={{position: "relative", alignItems: "center", justifyContent: "center", width: 140, height: 140}}>
            <View style={{position: "absolute", backgroundColor: "rgba(52,199,89,0.1)", borderRadius: 70, width: 140, height: 140}} />
            <View style={{position: "absolute", backgroundColor: "rgba(52,199,89,0.2)", borderRadius: 50, width: 100, height: 100}} />
            <View style={{backgroundColor: "#34C759", borderRadius: 36, width: 72, height: 72, alignItems: "center", justifyContent: "center", shadowColor: "#34C759", shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8}}>
              <Ionicons name="radio" size={36} color="#FFFFFF" />
            </View>
          </View>
          <Text style={{fontSize: 24, fontWeight: "bold", color: "#1C1C1E", marginTop: 24}}>Gateway Active</Text>
          <Text style={{fontSize: 15, color: "#8E8E93", marginTop: 8, textAlign: "center", paddingHorizontal: 16}}>
            Your device is actively processing fallback SMS queues in the background.
          </Text>
        </View>

        <View style={{backgroundColor: "#fff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, marginBottom: 20}}>
          <Text style={{color: "#8E8E93", fontWeight: "600", fontSize: 13, marginBottom: 16, textTransform: "uppercase"}}>Telecom Constraints</Text>
          
          <View style={{flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F2F2F7", justifyContent: "space-between"}}>
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <View style={{width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(0,122,255,0.1)", alignItems: "center", justifyContent: "center", marginRight: 12}}>
                <Ionicons name="shield-checkmark" size={16} color="#007AFF" />
              </View>
              <Text style={{fontSize: 16, fontWeight: "500", color: "#1C1C1E"}}>Daily Quota</Text>
            </View>
            <Text style={{fontSize: 16, fontWeight: "bold", color: "#8E8E93"}}>90 / day</Text>
          </View>

          <View style={{flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F2F2F7", justifyContent: "space-between"}}>
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <View style={{width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(52,199,89,0.1)", alignItems: "center", justifyContent: "center", marginRight: 12}}>
                <Ionicons name="stats-chart" size={16} color="#34C759" />
              </View>
              <Text style={{fontSize: 16, fontWeight: "500", color: "#1C1C1E"}}>Delivered Today</Text>
            </View>
            <Text style={{fontSize: 16, fontWeight: "bold", color: "#34C759"}}>18 / 90</Text>
          </View>

          <View style={{flexDirection: "row", alignItems: "center", paddingVertical: 12, justifyContent: "space-between"}}>
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <View style={{width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,149,0,0.1)", alignItems: "center", justifyContent: "center", marginRight: 12}}>
                <Ionicons name="timer" size={16} color="#FF9500" />
              </View>
              <Text style={{fontSize: 16, fontWeight: "500", color: "#1C1C1E"}}>Pacing</Text>
            </View>
            <Text style={{fontSize: 16, fontWeight: "bold", color: "#8E8E93"}}>1 / 5m</Text>
          </View>
        </View>

        <Pressable style={{backgroundColor: "rgba(255,59,48,0.1)", height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center", marginTop: 8}}>
          <Text style={{color: "#FF3B30", fontSize: 16, fontWeight: "bold"}}>Stop Background Service</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}
