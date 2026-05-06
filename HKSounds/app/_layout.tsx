import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';

const LIME = '#C8FF00';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={{
      width: 48,
      height: 34,
      borderRadius: 12,
      backgroundColor: focused ? LIME : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Text style={{ fontSize: 18 }}>{emoji}</Text>
    </View>
  );
}

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0d0d0d',
          borderTopColor: '#1f1f1f',
          borderTopWidth: 1.5,
          paddingTop: 8,
          paddingBottom: 12,
          height: 70,
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#555555',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔊" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          title: 'FAVOURITES',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⭐" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'SETTINGS',
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tabs>
  );
}