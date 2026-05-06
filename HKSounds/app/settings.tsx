import { useCallback, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getSettings, saveSettings, Settings, DEFAULT_SETTINGS } from '../utils/storage';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useFocusEffect(
    useCallback(() => {
      getSettings().then(setSettings);
    }, [])
  );

  async function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    const updated = { ...settings, [key]: value };
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

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>☰</Text>
        <Text style={styles.headerTitle}>HK SOUNDS</Text>
        <Text style={styles.headerIcon}>⚙</Text>
      </View>
      <View style={styles.headerUnderline} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>SETTINGS</Text>

        <View style={styles.card}>
            <SettingRow
                label="Show English Labels"
                description="Display English translation below Chinese label"
                value={settings.showEnglishLabel}
                onChange={(val) => updateSetting('showEnglishLabel', val)}
            />
            <View style={styles.divider} />
            <SettingRow
                label="Stop on Second Tap"
                description="Tap a playing sound again to stop it"
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 12,
  },
  headerIcon: { fontSize: 22, color: '#fff' },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
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