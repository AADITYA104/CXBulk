import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

export function PermissionGuard({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      setIsVisible(false);
    } catch (error) {
      console.log("Permission check:", error);
      setIsVisible(false);
    }
  };

  const requestAll = async () => {
    try {
      setIsVisible(false);
    } catch (error) {
      console.error("Error:", error);
      setIsVisible(false);
    }
  };

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
            
            <Text style={styles.title}>Welcome to CXBulk</Text>
            <Text style={styles.subtitle}>
              Import your CSV contact lists and start sending bulk messages to your customers.
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
                  <Text style={styles.itemDesc}>Access to send SMS and WhatsApp messages.</Text>
                </View>
              </View>
            </View>

            <Pressable 
              style={({ pressed }) => [
                styles.btn,
                pressed && { opacity: 0.8 }
              ]}
              onPress={requestAll}
            >
              <Text style={styles.btnText}>Get Started</Text>
            </Pressable>

            <Pressable onPress={() => setIsVisible(false)}>
              <Text style={styles.skipText}>Skip for Now</Text>
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