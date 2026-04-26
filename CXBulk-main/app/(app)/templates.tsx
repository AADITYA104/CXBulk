import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Pressable, 
  StyleSheet, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTemplates, DLTTemplate } from '../../context/templates';


export default function TemplatesScreen() {
  const { templates, loading, deleteTemplate } = useTemplates();
  const router = useRouter();
  const [filter, setFilter] = useState<'All' | 'Approved' | 'Pending' | 'Draft'>('All');

  const filteredTemplates = templates.filter(t => {
    if (filter === 'All') return true;
    return t.status === filter;
  });

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Template",
      "Are you sure you want to delete this template?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteTemplate(id) }
      ]
    );
  };

  const getStatusColor = (status: DLTTemplate['status']) => {
    switch (status) {
      case 'Approved': return '#34C759';
      case 'Pending': return '#FF9500';
      case 'Rejected': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Templates</Text>
        <Pressable 
          style={styles.addButton}
          onPress={() => router.push('/template-editor' as any)}
        >
          <Ionicons name="add" size={24} color="#FFF" />
          <Text style={styles.addButtonText}>New Template</Text>
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        {(['All', 'Approved', 'Pending', 'Draft'] as const).map((f) => (
          <Pressable 
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : filteredTemplates.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="document-text-outline" size={64} color="#C7C7CC" />
          <Text style={styles.emptyText}>No templates found</Text>
          <Pressable 
            style={styles.emptyButton}
            onPress={() => router.push('/template-editor' as any)}
          >
            <Text style={styles.emptyButtonText}>Create your first template</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {filteredTemplates.map((template) => (
            <Pressable 
              key={template.id} 
              style={styles.card}
              onPress={() => router.push({ pathname: '/template-editor', params: { id: template.id } } as any)}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(template.status) + '20' }]}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(template.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(template.status) }]}>{template.status}</Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{template.category}</Text>
                </View>
              </View>

              <Text style={styles.cardName}>{template.name}</Text>
              <Text style={styles.cardContent} numberOfLines={2}>{template.content}</Text>
              
              <View style={styles.cardFooter}>
                <View style={styles.footerInfo}>
                  <Ionicons name="barcode-outline" size={14} color="#8E8E93" />
                  <Text style={styles.footerText}>{template.dltTemplateId || 'No DLT ID'}</Text>
                </View>
                <View style={styles.actions}>
                  <Pressable onPress={() => handleDelete(template.id)}>
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  title: { fontSize: 34, fontWeight: '800', color: '#1C1C1E' },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C7C7CC',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  filterChipActive: { backgroundColor: '#007AFF' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#8E8E93' },
  filterTextActive: { color: '#FFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { marginTop: 12, fontSize: 16, color: '#8E8E93', fontWeight: '500' },
  emptyButton: { marginTop: 20, padding: 12 },
  emptyButtonText: { color: '#007AFF', fontWeight: '600' },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  categoryBadge: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: { fontSize: 11, fontWeight: '600', color: '#8E8E93' },
  cardName: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginBottom: 4 },
  cardContent: { fontSize: 14, color: '#3A3A3C', lineHeight: 20, marginBottom: 12 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  footerInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 12, color: '#8E8E93', fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 16 },
});
