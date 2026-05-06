import { useCallback, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { STRINGS } from '../constants/strings';
import { getSettings, saveSettings, Settings, DEFAULT_SETTINGS } from '../utils/storage';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useFocusEffect(
    useCallback(() => {
      getSettings().then(setSettings);
    }, [])
  );

  const S = STRINGS[settings.language];

  async function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveSettings(updated);
  }

  async function toggleLanguage() {
    const updated = { ...settings, language: settings.language === 'zh' ? 'en' : 'zh' } as Settings;
    setSettings(updated);
    await saveSettings(updated);
  }

  function SettingRow({
    label,
    description,
    value,
    onChange,
  }: {
    label: string;
    description: string;
    value: boolean;
    onChange: (val: boolean) => void;
  }) {
    return (
      <View style={styles.row}>
        <View style={styles.rowText}>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={styles.rowDescription}>{description}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: '#333', true: '#C8FF00' }}
          thumbColor={value ? '#000' : '#888'}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0d0d" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.langBtn} onPress={toggleLanguage}>
          <Text style={styles.langBtnText}>{S.langToggle}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{S.appTitle}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/add')}>
          <Text style={styles.addBtnText}>＋</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.headerUnderline} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{S.settingsTitle}</Text>
        <View style={styles.card}>
          <SettingRow
            label={S.showEnglishLabel}
            description={S.showEnglishLabelDesc}
            value={settings.showEnglishLabel}
            onChange={(val) => updateSetting('showEnglishLabel', val)}
          />
          <View style={styles.divider} />
          <SettingRow
            label={S.stopOnSecondTap}
            description={S.stopOnSecondTapDesc}
            value={settings.stopOnSecondTap}
            onChange={(val) => updateSetting('stopOnSecondTap', val)}
          />
        </View>
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
    left: 20,
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
  addBtn: {
    position: 'absolute',
    right: 20,
    bottom: 25,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: LIME,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { fontSize: 22, color: '#000', fontWeight: '900', lineHeight: 28 },
  headerUnderline: { height: 3, backgroundColor: LIME },
  content: { padding: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  rowText: { flex: 1, marginRight: 16 },
  rowLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  rowDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#222',
    marginHorizontal: 18,
  },
});