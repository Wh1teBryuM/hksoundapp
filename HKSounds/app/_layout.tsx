import { Tabs } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LIME = '#C8FF00';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: '#0d0d0d',
      borderTopWidth: 1.5,
      borderTopColor: '#1f1f1f',
      paddingBottom: insets.bottom || 16,
      paddingTop: 12,
      paddingHorizontal: 15,
      gap: 8,
    }}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.title || route.name;
        const isFocused = state.index === index;

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
              color: isFocused ? '#000' : '#555',
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
      <Tabs.Screen name="index" options={{ title: 'HOME' }} />
      <Tabs.Screen name="favourites" options={{ title: 'FAVOURITES' }} />
      <Tabs.Screen name="settings" options={{ title: 'SETTINGS' }} />
    </Tabs>
  );
}