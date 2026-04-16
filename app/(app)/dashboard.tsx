import { View, Text, ScrollView, Pressable } from "../../src/tw";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function DashboardScreen() {
  return (
    <View className="flex-1 bg-[#F5F5F7]">
      <ScrollView className="flex-1" contentContainerClassName="pt-16 pb-32 px-6">
        
        {/* Apple Style Header */}
        <View className="flex-row justify-between items-end mb-8 mt-4">
          <View>
            <Text className="text-gray-500 font-medium text-sm mb-1 uppercase tracking-wider">Overview</Text>
            <Text className="text-4xl font-extrabold text-black tracking-tight">Dashboard</Text>
          </View>
          <Pressable className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm">
            <Ionicons name="notifications" size={22} color="#1c1c1e" />
          </Pressable>
        </View>

        {/* Apple Style Stat Cards */}
        <View className="flex-row gap-x-4 mb-6">
          <View className="flex-1 bg-white rounded-[28px] p-5 shadow-sm justify-between">
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mb-4">
              <Ionicons name="paper-plane" size={20} color="#007AFF" />
            </View>
            <View>
              <Text className="text-3xl font-extrabold text-black tracking-tight">1.2k</Text>
              <Text className="text-gray-500 font-medium mt-1">Total Sent</Text>
            </View>
          </View>
          
          <View className="flex-1 bg-[#1C1C1E] rounded-[28px] p-5 shadow-sm justify-between">
            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mb-4">
              <Ionicons name="people" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text className="text-3xl font-extrabold text-white tracking-tight">890</Text>
              <Text className="text-gray-400 font-medium mt-1">Farmers</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions (Floating Glass style) */}
        <Text className="text-xl font-bold text-black tracking-tight mb-4 mt-2">Actions</Text>
        <View className="flex-row gap-x-4 mb-8">
          <Pressable 
            className="flex-1 bg-[#007AFF] rounded-[24px] py-4 items-center justify-center shadow-sm"
            onPress={() => router.push("/(app)/campaign")}
          >
            <Ionicons name="add" size={28} color="white" />
            <Text className="text-white font-bold mt-1">New</Text>
          </Pressable>
          <Pressable 
            className="flex-1 bg-white rounded-[24px] py-4 items-center justify-center shadow-sm"
            onPress={() => router.push("/(app)/contacts")}
          >
            <Ionicons name="person-add" size={26} color="#1c1c1e" />
            <Text className="text-[#1c1c1e] font-bold mt-1.5">Add User</Text>
          </Pressable>
          <Pressable className="flex-1 bg-white rounded-[24px] py-4 items-center justify-center shadow-sm">
            <Ionicons name="document-text" size={24} color="#1c1c1e" />
            <Text className="text-[#1c1c1e] font-bold mt-1.5">Import</Text>
          </Pressable>
        </View>

        {/* iOS style List View for Campaigns */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-black tracking-tight">Recent Activity</Text>
          <Text className="text-[#007AFF] font-medium text-base">See All</Text>
        </View>
        
        <View className="bg-white rounded-[28px] overflow-hidden shadow-sm">
          {/* List Item 1 */}
          <Pressable className="flex-row items-center p-4 border-b border-gray-100 bg-white active:bg-gray-50">
            <View className="w-12 h-12 rounded-2xl bg-green-100 items-center justify-center mr-4">
              <Ionicons name="logo-whatsapp" size={24} color="#34C759" />
            </View>
            <View className="flex-1">
              <Text className="text-black font-bold text-base">Wheat Market Update</Text>
              <Text className="text-gray-500 text-sm mt-0.5">Today, 9:41 AM</Text>
            </View>
            <View className="items-end">
              <Text className="font-bold text-gray-400">842</Text>
            </View>
          </Pressable>
          
          {/* List Item 2 */}
          <Pressable className="flex-row items-center p-4 bg-white active:bg-gray-50">
            <View className="w-12 h-12 rounded-2xl bg-blue-100 items-center justify-center mr-4">
              <Ionicons name="chatbubble" size={24} color="#007AFF" />
            </View>
            <View className="flex-1">
              <Text className="text-black font-bold text-base">Fertilizer Subsidy</Text>
              <Text className="text-gray-500 text-sm mt-0.5">Aug 23, 2:30 PM</Text>
            </View>
            <View className="items-end">
              <Text className="font-bold text-gray-400">462</Text>
            </View>
          </Pressable>
        </View>

      </ScrollView>
    </View>
  );
}
