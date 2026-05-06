import * as DocumentPicker from 'expo-document-picker';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
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
import { STRINGS } from '../constants/strings';
import { SoundCategory, copyMp3ToStorage, saveSound } from '../utils/soundStorage';
import { DEFAULT_SETTINGS, Settings, getSettings, saveSettings } from '../utils/storage';
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
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useFocusEffect(
    useCallback(() => {
      getSettings().then(setSettings);
    }, [])
  );

  const S = STRINGS[settings.language];

  async function toggleLanguage() {
    const updated = { ...settings, language: settings.language === 'zh' ? 'en' : 'zh' } as Settings;
    setSettings(updated);
    await saveSettings(updated);
  }

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
      Alert.alert('', S.missingLabel);
      return;
    }
    if (!emoji.trim()) {
      Alert.alert('', S.missingEmoji);
      return;
    }
    if (!fileUri || !fileName) {
      Alert.alert('', S.missingFile);
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
    } catch (e) {
      Alert.alert('Error', S.errorSave);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0d0d" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.langBtn} onPress={toggleLanguage}>
          <Text style={styles.langBtnText}>{S.langToggle}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{S.appTitle}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>{S.back}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.headerUnderline} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{S.addSound}</Text>

        <Text style={styles.fieldLabel}>{S.mp3Label}</Text>
        <TouchableOpacity style={styles.filePicker} onPress={pickFile}>
          <Text style={styles.filePickerText}>
            {fileName ? fileName : S.mp3Placeholder}
          </Text>
        </TouchableOpacity>

        <Text style={styles.fieldLabel}>{S.labelZh}</Text>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder="例如：好嘢！"
          placeholderTextColor="#444"
          maxLength={20}
        />

        <Text style={styles.fieldLabel}>{S.labelEn}</Text>
        <TextInput
          style={styles.input}
          value={labelEn}
          onChangeText={setLabelEn}
          placeholder="e.g. Nice!"
          placeholderTextColor="#444"
          maxLength={30}
        />

        <Text style={styles.fieldLabel}>{S.emojiLabel}</Text>
        <TextInput
          style={styles.input}
          value={emoji}
          onChangeText={setEmoji}
          placeholder="😂"
          placeholderTextColor="#444"
          maxLength={4}
        />

        <Text style={styles.fieldLabel}>{S.categoryLabel}</Text>
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

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? S.saving : S.saveBtn}
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
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 25,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  langBtn: {
    position: 'absolute',
    right: 20,
    bottom: 25,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: LIME,
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: LIME,
  },
  backBtn: {
    position: 'absolute',
    left: 20,
    bottom: 30,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: LIME,
  },
  headerUnderline: { height: 3, backgroundColor: LIME },
  content: { padding: 20, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 20,
  },
  fieldLabel: {
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