import { Audio } from 'expo-av';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CATEGORIES } from '../constants/sounds';
import { STRINGS } from '../constants/strings';
import { DynamicSound, SoundCategory, loadSounds } from '../utils/soundStorage';
import { DEFAULT_SETTINGS, Settings, getFavourites, getSettings, saveFavourites, saveSettings } from '../utils/storage';

export default function FavouritesScreen() {
  const [favourites, setFavourites] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<SoundCategory | 'all'>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [sounds, setSounds] = useState<DynamicSound[]>([]);
  const soundRef = useRef<Audio.Sound | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadSounds().then(setSounds);
      getFavourites().then(setFavourites);
      getSettings().then(setSettings);
    }, [])
  );

  const S = STRINGS[settings.language];

  const favSounds = sounds.filter(s => favourites.includes(s.id));
  const filteredSounds = activeCategory === 'all'
    ? favSounds
    : favSounds.filter(s => s.category === activeCategory);

  async function toggleLanguage() {
    const updated = { ...settings, language: settings.language === 'zh' ? 'en' : 'zh' } as Settings;
    setSettings(updated);
    await saveSettings(updated);
  }

  async function playSound(sound: DynamicSound) {
    try {
      if (playingId === sound.id) {
        if (settings.stopOnSecondTap) {
          await soundRef.current?.stopAsync();
          await soundRef.current?.unloadAsync();
          soundRef.current = null;
          setPlayingId(null);
        }
        return;
      }
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setPlayingId(sound.id);
      const { sound: av } = await Audio.Sound.createAsync({ uri: sound.filePath });
      soundRef.current = av;
      await av.playAsync();
      av.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingId(null);
          soundRef.current = null;
        }
      });
    } catch {
      setPlayingId(null);
    }
  }

  async function toggleFavourite(id: string) {
    const updated = favourites.filter(f => f !== id);
    setFavourites(updated);
    await saveFavourites(updated);
  }

  function renderCard({ item, index }: { item: DynamicSound; index: number }) {
    const isPlaying = playingId === item.id;
    const useCyan = index % 4 === 2 || index % 4 === 3;

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isPlaying && (useCyan ? styles.cardActiveCyan : styles.cardActiveLime),
        ]}
        onPress={() => playSound(item)}
        activeOpacity={0.85}
      >
        <View style={styles.cardTop}>
          <Text style={styles.cardEmoji}>{item.emoji}</Text>
          <TouchableOpacity
            style={styles.starBtn}
            onPress={() => toggleFavourite(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.starActive}>★</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.cardBottom}>
          <Text style={styles.cardLabel}>{item.label}</Text>
          {settings.showEnglishLabel && item.labelEn ? (
            <Text style={styles.cardLabelEn}>{item.labelEn}</Text>
          ) : null}
          {isPlaying && (
            <View style={styles.audioBars}>
              {[1, 2, 3, 4].map(i => (
                <View key={i} style={styles.audioBar} />
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  const categories = [
    { key: 'all', label: S.all },
    ...CATEGORIES.filter(c => c.key !== 'all'),
  ];

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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.catPill, activeCategory === cat.key && styles.catPillActive]}
            onPress={() => setActiveCategory(cat.key as SoundCategory | 'all')}
          >
            <Text style={[styles.catPillText, activeCategory === cat.key && styles.catPillTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {favSounds.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <View style={styles.emptyCircle}>
              <Text style={{ fontSize: 28 }}>☆</Text>
            </View>
            <Text style={styles.emptyTitle}>{S.emptyFav}</Text>
            <Text style={styles.emptySubtitle}>{S.emptyFavSub}</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredSounds}
          keyExtractor={item => item.id}
          renderItem={renderCard}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const LIME = '#C8FF00';
const CYAN = '#00E5FF';

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
  categoryScroll: { flexGrow: 0 },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#333',
    marginRight: 8,
  },
  catPillActive: { backgroundColor: LIME, borderColor: LIME },
  catPillText: { fontSize: 13, fontWeight: '700', color: '#aaa' },
  catPillTextActive: { color: '#000' },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: CYAN,
    padding: 40,
    alignItems: 'center',
    width: '100%',
  },
  emptyCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#222',
    borderWidth: 3,
    borderColor: LIME,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
  gridContent: { padding: 12, paddingTop: 4 },
  row: { gap: 10, marginBottom: 10 },
  card: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    borderRadius: 18,
    padding: 12,
    height: 160,
    maxWidth: '50%',
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'space-between',
  },
  cardActiveLime: { borderColor: LIME },
  cardActiveCyan: { borderColor: CYAN },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardEmoji: { fontSize: 48 },
  starBtn: { padding: 4 },
  starActive: { fontSize: 20, color: LIME },
  cardBottom: {},
  cardLabel: { fontSize: 20, fontWeight: '900', color: '#fff', lineHeight: 24 },
  cardLabelEn: { fontSize: 11, color: '#666', marginTop: 2 },
  audioBars: { flexDirection: 'row', gap: 2, alignItems: 'flex-end', height: 14, marginTop: 5 },
  audioBar: { width: 3, height: 10, backgroundColor: LIME, borderRadius: 2 },
});