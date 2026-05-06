import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LIME = '#C8FF00';

const TAB_LABELS = {
  zh: { index: '主頁', favourites: '我的最愛', settings: '設定', add: '新增' },
  en: { index: 'HOME', favourites: 'FAVOURITES', settings: 'SETTINGS', add: 'ADD' },
};

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');

  useEffect(() => {
    const load = async () => {
      const data = await AsyncStorage.getItem('hksounds_settings');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.language) setLanguage(parsed.language);
      }
    };
    load();
    const interval = setInterval(load, 100);
    return () => clearInterval(interval);
  }, []);

  const labels = TAB_LABELS[language];
  const visibleRoutes = state.routes;

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: '#0d0d0d',
      borderTopWidth: 1.5,
      borderTopColor: '#1f1f1f',
      paddingBottom: insets.bottom || 16,
      paddingTop: 12,
      paddingHorizontal: 8,
      gap: 8,
    }}>
      {visibleRoutes.map((route: any) => {
        const isFocused = state.index === state.routes.findIndex((r: any) => r.name === route.name);
        const label = labels[route.name as keyof typeof labels];
        if (!label) return null;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              borderRadius: 12,
              backgroundColor: isFocused ? LIME : 'transparent',
            }}
          >
            <Text style={{
              fontSize: 11,
              fontWeight: '700',
              letterSpacing: 0.5,
              color: isFocused ? '#000' : '#888',
              textTransform: 'uppercase',
            }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function RootLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: '主頁' }} />
      <Tabs.Screen name="favourites" options={{ title: '我的最愛' }} />
      <Tabs.Screen name="settings" options={{ title: '設定' }} />
      <Tabs.Screen name="add" options={{ title: '新增' }} />
    </Tabs>
  );
}