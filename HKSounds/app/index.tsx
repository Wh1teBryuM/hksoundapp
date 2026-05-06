import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CATEGORIES, SOUNDS, Sound, SoundCategory } from '../constants/sounds';
import { getFavourites, getSettings, saveFavourites, Settings, DEFAULT_SETTINGS } from '../utils/storage';

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState<SoundCategory>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    getFavourites().then(setFavourites);
    getSettings().then(setSettings);
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  }, []);

  const filteredSounds = activeCategory === 'all'
    ? SOUNDS
    : SOUNDS.filter(s => s.category === activeCategory);

  async function playSound(sound: Sound) {
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
      const { sound: av } = await Audio.Sound.createAsync(sound.file);
      soundRef.current = av;
      await av.playAsync();
      av.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingId(null);
          soundRef.current = null;
        }
      });
    } catch (e) {
      setPlayingId(null);
    }
  }

  async function toggleFavourite(id: string) {
    const updated = favourites.includes(id)
      ? favourites.filter(f => f !== id)
      : [...favourites, id];
    setFavourites(updated);
    await saveFavourites(updated);
  }

  function renderCard({ item, index }: { item: Sound; index: number }) {
    const isPlaying = playingId === item.id;
    const isFav = favourites.includes(item.id);
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
          <Text style={[styles.starIcon, isFav && styles.starActive]}>
            {isFav ? '★' : '☆'}
          </Text>
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d0d0d" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HK SOUNDS</Text>
        </View>
      <View style={styles.headerUnderline} />

      {/* CATEGORY TABS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.catPill, activeCategory === cat.key && styles.catPillActive]}
            onPress={() => setActiveCategory(cat.key)}
          >
            <Text style={[styles.catPillText, activeCategory === cat.key && styles.catPillTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* SOUND GRID */}
      <FlatList
        data={filteredSounds}
        keyExtractor={item => item.id}
        renderItem={renderCard}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const LIME = '#C8FF00';
const CYAN = '#00E5FF';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' },
    header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 20,
    },
  headerIcon: { fontSize: 22, color: '#fff' },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  headerUnderline: {
    height: 3,
    backgroundColor: LIME,
  },
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
  catPillActive: {
    backgroundColor: LIME,
    borderColor: LIME,
  },
  catPillText: { fontSize: 13, fontWeight: '700', color: '#aaa' },
  catPillTextActive: { color: '#000' },
  gridContent: { padding: 12, paddingTop: 4 },
  row: { gap: 10, marginBottom: 10 },
  card: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    borderRadius: 18,
    padding: 12,
    aspectRatio: 1,
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
  starIcon: { fontSize: 20, color: '#444' },
  starActive: { color: LIME },
  cardBottom: {},
  cardLabel: { fontSize: 20, fontWeight: '900', color: '#fff', lineHeight: 24 },
  cardLabelEn: { fontSize: 11, color: '#666', marginTop: 2 },
  audioBars: { flexDirection: 'row', gap: 2, alignItems: 'flex-end', height: 14, marginTop: 5 },
  audioBar: { width: 3, height: 10, backgroundColor: LIME, borderRadius: 2 },
});