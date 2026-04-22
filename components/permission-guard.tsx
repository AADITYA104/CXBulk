import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as SMS from 'expo-sms';
import Constants from 'expo-constants';

export function PermissionGuard({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      // expo-media-library can fail in Expo Go if manifest doesn't match
      const { status: mediaStatus } = await MediaLibrary.getPermissionsAsync();
      const smsAvailable = await SMS.isAvailableAsync();

      if (mediaStatus !== 'granted') {
        setIsVisible(true);
      }
    } catch (error) {
      console.log("Permission check error (expected in some Expo Go environments):", error);
      // If it fails, we show the guard anyway so the user can try to request
      setIsVisible(true);
    }
  };

  const requestAll = async () => {
    try {
      // Request Media Library
      const { status: mStatus } = await MediaLibrary.requestPermissionsAsync();
      
      // We don't request Notifications here to avoid Expo Go SDK 54 crash
      // Local notifications can be added later if using Development Builds
      
      if (mStatus === 'granted') {
        setIsVisible(false);
      } else {
        Alert.alert(
          "Permissions Required",
          "CXBulk needs access to your files to import CSV contact lists. Please enable it in settings.",
          [{ text: "OK", onPress: () => setIsVisible(false) }]
        );
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
      setIsVisible(false);
    }
  };

  // If we are in Expo Go, we should be careful with some permissions
  const isExpoGo = Constants.appOwnership === 'expo';

  if (!isVisible) return <>{children}</>;

  return (
    <View style={{ flex: 1 }}>
      {children}
      <Modal transparent visible={isVisible} animationType="fade">
        <View style={styles.overlay}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.container}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={40} color="#007AFF" />
            </View>
            
            <Text style={styles.title}>Device Permissions</Text>
            <Text style={styles.subtitle}>
              To provide a seamless experience, CXBulk requires access to your device for CSV imports and messaging.
            </Text>

            <View style={styles.list}>
              <View style={styles.item}>
                <Ionicons name="folder-open" size={24} color="#007AFF" />
                <View style={styles.itemText}>
                  <Text style={styles.itemTitle}>File Access</Text>
                  <Text style={styles.itemDesc}>Required to import your CSV contact lists.</Text>
                </View>
              </View>

              <View style={styles.item}>
                <Ionicons name="chatbox-ellipses" size={24} color="#5856D6" />
                <View style={styles.itemText}>
                  <Text style={styles.itemTitle}>Messaging</Text>
                  <Text style={styles.itemDesc}>Access to send SMS and WhatsApp messages to your contacts.</Text>
                </View>
              </View>
              
              {isExpoGo && (
                <Text style={styles.note}>
                  Note: Some advanced features like Push Notifications require a Development Build and are disabled in Expo Go.
                </Text>
              )}
            </View>

            <Pressable 
              style={({ pressed }) => [
                styles.btn,
                pressed && { opacity: 0.8 }
              ]}
              onPress={requestAll}
            >
              <Text style={styles.btnText}>Allow Access</Text>
            </Pressable>

            <Pressable onPress={() => setIsVisible(false)}>
              <Text style={styles.skipText}>Maybe Later</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  list: {
    width: '100%',
    marginBottom: 32,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  itemText: {
    marginLeft: 16,
    flex: 1,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  itemDesc: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  note: {
    fontSize: 11,
    color: '#FF9500',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  btn: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  skipText: {
    color: '#8E8E93',
    fontSize: 15,
    fontWeight: '600',
  },
});
