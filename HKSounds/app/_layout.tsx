import { Tabs } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LIME = '#C8FF00';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const visibleRoutes = state.routes.filter((route: any) => route.name !== 'something-that-doesnt-exist');

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
        const { options } = descriptors[route.key];
        const label = options.title || route.name;
        const isFocused = state.index === state.routes.findIndex((r: any) => r.name === route.name);

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