import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';

function TabIcon({ focused, label, symbol }: { focused: boolean; label: string; symbol: string }) {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.symbol, focused && styles.symbolActive]}>{symbol}</Text>
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.tabBarBackground,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Dashboard" symbol="💰" />
          ),
        }}
      />
      <Tabs.Screen
        name="rendas"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Rendas" symbol="💼" />
          ),
        }}
      />
      <Tabs.Screen
        name="conversor"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Conversor" symbol="⏱" />
          ),
        }}
      />
      <Tabs.Screen
        name="configuracoes"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Config" symbol="⚙️" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  symbol: {
    fontSize: 20,
    opacity: 0.5,
  },
  symbolActive: {
    opacity: 1,
  },
  label: {
    fontSize: 9,
    color: Colors.tabBarInactive,
    marginTop: 2,
  },
  labelActive: {
    color: Colors.tabBarActive,
  },
});
