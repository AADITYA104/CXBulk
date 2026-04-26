import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Pressable, 
  TextInput, 
  StyleSheet, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTemplates, DLTTemplate } from '../context/templates';
import { DLT_RULES, DLTCategory, SMS_LIMITS } from '../constants/dlt-rules';

export default function TemplateEditorScreen() {
  const { id } = useLocalSearchParams();
  const { templates, addTemplate, updateTemplate, submitForApproval } = useTemplates();
  const router = useRouter();

  const existingTemplate = useMemo(() => 
    id ? templates.find((t: DLTTemplate) => t.id === id) : null
  , [id, templates]);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<DLTCategory>('Service Implicit');
  const [content, setContent] = useState('');
  const [dltTemplateId, setDltTemplateId] = useState('');
  const [senderId, setSenderId] = useState('');
  const [type, setType] = useState<DLTTemplate['type']>('Text');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingTemplate) {
      setName(existingTemplate.name);
      setCategory(existingTemplate.category);
      setContent(existingTemplate.content);
      setDltTemplateId(existingTemplate.dltTemplateId);
      setSenderId(existingTemplate.senderId);
      setType(existingTemplate.type);
    }
  }, [existingTemplate]);

  const charCount = content.length;
  const isUnicode = /[^\u0000-\u007F]/.test(content);
  const limit = isUnicode ? SMS_LIMITS.UNICODE_CHAR_LIMIT : SMS_LIMITS.TEXT_CHAR_LIMIT;
  const smsCount = Math.ceil(charCount / limit) || 1;

  const handleSave = async (submit = false) => {
    if (!name.trim() || !content.trim()) {
      Alert.alert("Missing Fields", "Please provide a name and content for the template.");
      return;
    }

    setSaving(true);
    try {
      const templateData = {
        name,
        category,
        content,
        dltTemplateId,
        senderId,
        type,
      };

      let templateId = id as string;
      if (id) {
        await updateTemplate(id as string, templateData);
      } else {
        templateId = await addTemplate(templateData);
      }

      if (submit) {
        await submitForApproval(templateId);
        Alert.alert("Success", "Template saved and submitted for DLT approval.");
      } else {
        Alert.alert("Success", "Template saved as draft.");
      }
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  const insertVariable = (v: string) => {
    setContent(prev => prev + v);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </Pressable>
        <Text style={styles.title}>{id ? 'Edit Template' : 'New Template'}</Text>
        <Pressable onPress={() => handleSave(false)} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color="#007AFF" /> : <Text style={styles.saveText}>Save</Text>}
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.label}>TEMPLATE NAME</Text>
          <TextInput 
            style={styles.input}
            placeholder="e.g. Order Confirmation"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>DLT CATEGORY</Text>
          <View style={styles.categoryGrid}>
            {Object.keys(DLT_RULES).map((cat) => (
              <Pressable 
                key={cat}
                style={[
                  styles.categoryCard,
                  category === cat && styles.categoryCardActive
                ]}
                onPress={() => setCategory(cat as DLTCategory)}
              >
                <Text style={[
                  styles.categoryName,
                  category === cat && styles.categoryNameActive
                ]}>{cat}</Text>
                <Text style={[
                  styles.categorySuffix,
                  category === cat && styles.categorySuffixActive
                ]}>{DLT_RULES[cat as DLTCategory].suffix}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.helperText}>{DLT_RULES[category].description}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>MESSAGE CONTENT</Text>
            <Text style={[styles.charCount, charCount > limit && { color: '#FF3B30' }]}>
              {charCount} / {limit} ({smsCount} SMS) {isUnicode ? 'Unicode' : ''}
            </Text>
          </View>
          <View style={styles.editorContainer}>
            <TextInput 
              multiline
              style={styles.editor}
              placeholder="Type your message... Use {#var#} for dynamic variables."
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
            />
            <View style={styles.variableRow}>
              <Text style={styles.variableLabel}>Quick Variables:</Text>
              <Pressable style={styles.varChip} onPress={() => insertVariable('{#var#}')}>
                <Text style={styles.varChipText}>+ Variable</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>DLT DETAILS (OPTIONAL FOR DRAFT)</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.subLabel}>DLT Template ID</Text>
            <TextInput 
              style={styles.input}
              placeholder="12071234567890..."
              keyboardType="number-pad"
              value={dltTemplateId}
              onChangeText={setDltTemplateId}
            />
          </View>
          <View style={[styles.inputGroup, { marginTop: 12 }]}>
            <Text style={styles.subLabel}>Header / Sender ID</Text>
            <TextInput 
              style={styles.input}
              placeholder={DLT_RULES[category].senderIdType === 'Numeric' ? '6-digit number' : '6-character ID'}
              maxLength={6}
              value={senderId}
              onChangeText={setSenderId}
            />
          </View>
        </View>

        <Pressable 
          style={styles.submitButton}
          onPress={() => handleSave(true)}
          disabled={saving}
        >
          <Ionicons name="cloud-upload-outline" size={20} color="#FFF" />
          <Text style={styles.submitButtonText}>Submit for DLT Approval</Text>
        </Pressable>
        
        <View style={styles.spacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C7C7CC',
  },
  title: { fontSize: 17, fontWeight: '700', color: '#1C1C1E' },
  saveText: { fontSize: 17, color: '#007AFF', fontWeight: '600' },
  scrollContent: { padding: 16 },
  section: { marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '700', color: '#8E8E93', letterSpacing: 1, marginBottom: 8 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    alignItems: 'center',
  },
  categoryCardActive: { borderColor: '#007AFF', backgroundColor: '#E5F2FF' },
  categoryName: { fontSize: 13, fontWeight: '700', color: '#8E8E93' },
  categoryNameActive: { color: '#007AFF' },
  categorySuffix: { fontSize: 11, color: '#C7C7CC', marginTop: 2 },
  categorySuffixActive: { color: '#007AFF' },
  helperText: { fontSize: 12, color: '#8E8E93', marginTop: 8, lineHeight: 18 },
  editorContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
  },
  editor: {
    padding: 14,
    fontSize: 16,
    color: '#1C1C1E',
    minHeight: 150,
    lineHeight: 22,
  },
  variableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#F9F9FB',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 10,
  },
  variableLabel: { fontSize: 12, color: '#8E8E93', fontWeight: '600' },
  varChip: {
    backgroundColor: '#007AFF10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF30',
  },
  varChipText: { color: '#007AFF', fontWeight: '700', fontSize: 12 },
  charCount: { fontSize: 11, color: '#8E8E93', fontWeight: '600' },
  inputGroup: {},
  subLabel: { fontSize: 11, fontWeight: '600', color: '#8E8E93', marginBottom: 4, marginLeft: 4 },
  submitButton: {
    backgroundColor: '#34C759',
    flexDirection: 'row',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 10,
  },
  submitButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  spacer: { height: 100 },
});
