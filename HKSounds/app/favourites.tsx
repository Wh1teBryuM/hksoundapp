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
import { SOUNDS, Sound, CATEGORIES, SoundCategory } from '../constants/sounds';
import { getFavourites, saveFavourites, getSettings, Settings, DEFAULT_SETTINGS } from '../utils/storage';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export default function FavouritesScreen() {
  const [favourites, setFavourites] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<SoundCategory>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const soundRef = useRef<Audio.Sound | null>(null);

  useFocusEffect(
    useCallback(() => {
      getFavourites().then(setFavourites);
      getSettings().then(setSettings);
    }, [])
  );

  const favSounds = SOUNDS.filter(s => favourites.includes(s.id));
  const filteredSounds = activeCategory === 'all'
    ? favSounds
    : favSounds.filter(s => s.category === activeCategory);

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
    } catch {
      setPlayingId(null);
    }
  }

  async function toggleFavourite(id: string) {
    const updated = favourites.filter(f => f !== id);
    setFavourites(updated);
    await saveFavourites(updated);
  }

  function renderCard({ item, index }: { item: Sound; index: number }) {
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
        <Text style={styles.cardEmoji}>{item.emoji}</Text>
        <TouchableOpacity
          style={styles.starBtn}
          onPress={() => toggleFavourite(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.starActive}>★</Text>
        </TouchableOpacity>
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

      {/* EMPTY STATE */}
      {favSounds.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <View style={styles.emptyCircle}>
              <Text style={{ fontSize: 28 }}>☆</Text>
            </View>
            <Text style={styles.emptyTitle}>EMPTY LIST</Text>
            <Text style={styles.emptySubtitle}>
              No favourites yet! Tap the star on any sound to add it here. ✨
            </Text>
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
  headerUnderline: { height: 3, backgroundColor: LIME },
  categoryScroll: { flexGrow: 0 },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
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
    marginBottom: 24,
  },
  gridContent: { padding: 16, paddingTop: 4 },
  row: { gap: 12, marginBottom: 12 },
  card: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 14,
    minHeight: 150,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'flex-end',
  },
  cardActiveLime: { borderColor: LIME },
  cardActiveCyan: { borderColor: CYAN },
  cardEmoji: { fontSize: 44, position: 'absolute', top: 14, left: 14 },
  starBtn: { position: 'absolute', top: 12, right: 12 },
  starActive: { fontSize: 20, color: LIME },
  cardLabel: { fontSize: 18, fontWeight: '900', color: '#fff', lineHeight: 22 },
  cardLabelEn: { fontSize: 11, color: '#888', marginTop: 2 },
  audioBars: { flexDirection: 'row', gap: 2, alignItems: 'flex-end', height: 16, marginTop: 6 },
  audioBar: { width: 3, height: 10, backgroundColor: LIME, borderRadius: 2 },
});