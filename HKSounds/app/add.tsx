import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SoundCategory, copyMp3ToStorage, saveSound } from '../utils/soundStorage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const CATEGORIES: { key: SoundCategory; label: string }[] = [
  { key: 'cantonese', label: '粵語 (CANTO)' },
  { key: 'meme', label: 'MEME' },
  { key: 'reaction', label: 'REACTION' },
  { key: 'movie', label: '電影 (MOVIE)' },
  { key: 'situation', label: '情景 (SITUATION)' },
];

export default function AddSoundScreen() {
  const [label, setLabel] = useState('');
  const [labelEn, setLabelEn] = useState('');
  const [emoji, setEmoji] = useState('');
  const [category, setCategory] = useState<SoundCategory>('cantonese');
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileUri, setFileUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function pickFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/mpeg',
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        setFileName(asset.name);
        setFileUri(asset.uri);
      }
    } catch {
      Alert.alert('Error', 'Could not pick file.');
    }
  }

  async function handleSave() {
    if (!label.trim()) {
      Alert.alert('Missing', 'Please enter a label.');
      return;
    }
    if (!emoji.trim()) {
      Alert.alert('Missing', 'Please enter an emoji.');
      return;
    }
    if (!fileUri || !fileName) {
      Alert.alert('Missing', 'Please select an MP3 file.');
      return;
    }

    try {
      setSaving(true);
      const id = uuidv4();
      const safeFileName = id + '.mp3';
      const filePath = await copyMp3ToStorage(fileUri, safeFileName);
      await saveSound({
        id,
        label: label.trim(),
        labelEn: labelEn.trim(),
        emoji: emoji.trim(),
        category,
        filePath,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Could not save sound.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0d0d" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>新增聲音</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={styles.headerUnderline} />

      <ScrollView contentContainerStyle={styles.content}>

        {/* FILE PICKER */}
        <Text style={styles.sectionLabel}>MP3 檔案</Text>
        <TouchableOpacity style={styles.filePicker} onPress={pickFile}>
          <Text style={styles.filePickerText}>
            {fileName ? fileName : '撳此選擇 MP3 檔案'}
          </Text>
        </TouchableOpacity>

        {/* LABEL */}
        <Text style={styles.sectionLabel}>標籤（中文）</Text>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder="例如：好嘢！"
          placeholderTextColor="#444"
          maxLength={20}
        />

        {/* ENGLISH LABEL */}
        <Text style={styles.sectionLabel}>標籤（英文，可選）</Text>
        <TextInput
          style={styles.input}
          value={labelEn}
          onChangeText={setLabelEn}
          placeholder="e.g. Nice!"
          placeholderTextColor="#444"
          maxLength={30}
        />

        {/* EMOJI */}
        <Text style={styles.sectionLabel}>Emoji</Text>
        <TextInput
          style={styles.input}
          value={emoji}
          onChangeText={setEmoji}
          placeholder="例如：😂"
          placeholderTextColor="#444"
          maxLength={4}
        />

        {/* CATEGORY */}
        <Text style={styles.sectionLabel}>類別</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.catPill, category === cat.key && styles.catPillActive]}
              onPress={() => setCategory(cat.key)}
            >
              <Text style={[styles.catPillText, category === cat.key && styles.catPillTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SAVE */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? '儲存中...' : '儲存聲音'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const LIME = '#C8FF00';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 12,
  },
  backBtn: { width: 60 },
  backText: { color: LIME, fontSize: 14, fontWeight: '700' },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  headerUnderline: { height: 3, backgroundColor: LIME },
  content: { padding: 20, gap: 8 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#555',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 6,
  },
  filePicker: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#333',
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
  },
  filePickerText: { color: '#aaa', fontSize: 14 },
  input: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#333',
    padding: 14,
    color: '#fff',
    fontSize: 15,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#333',
  },
  catPillActive: { backgroundColor: LIME, borderColor: LIME },
  catPillText: { fontSize: 13, fontWeight: '700', color: '#aaa' },
  catPillTextActive: { color: '#000' },
  saveBtn: {
    backgroundColor: LIME,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: 16, fontWeight: '900', color: '#000' },
});