/**
 * WaselX Root Navigation
 * ─ First-launch → Onboarding gate (AsyncStorage)
 * ─ Auth flow → Login / Register
 * ─ Shipper / Carrier deep stacks with premium floating tab bar
 */
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  View, Text, ActivityIndicator, TouchableOpacity,
  StyleSheet, Platform, Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import useAuthStore from '../store/authStore';
import { Colors, Shadows, BorderRadius } from '../theme';

// Auth
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen      from '../screens/auth/LoginScreen';
import RegisterScreen   from '../screens/auth/RegisterScreen';

// Shipper
import ShipperDashboard      from '../screens/shipper/ShipperDashboard';
import CreateShipmentScreen  from '../screens/shipper/CreateShipmentScreen';
import ShipmentDetailScreen  from '../screens/shipper/ShipmentDetailScreen';
import TrackingScreen        from '../screens/shipper/TrackingScreen';
import HistoryScreen         from '../screens/shipper/HistoryScreen';

// Carrier
import CarrierDashboard           from '../screens/carrier/CarrierDashboard';
import AvailableShipmentsScreen   from '../screens/carrier/AvailableShipmentsScreen';
import CarrierShipmentDetailScreen from '../screens/carrier/CarrierShipmentDetailScreen';
import ActiveJobScreen            from '../screens/carrier/ActiveJobScreen';
import CarrierProfileScreen       from '../screens/carrier/CarrierProfileScreen';

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

// ─── Premium Floating Tab Bar ──────────────────────────────────────────────────
function TabBar({ state, descriptors, navigation }) {
  return (
    <View style={tabStyles.wrapper}>
      <View style={tabStyles.pill}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.8}
              style={[tabStyles.tab, isFocused && tabStyles.tabActive]}
            >
              <Text style={[tabStyles.icon, isFocused && tabStyles.iconActive]}>
                {options.tabBarIcon?.({ focused: isFocused }) ?? '●'}
              </Text>
              {isFocused && (
                <Text style={tabStyles.label}>{options.tabBarLabel ?? route.name}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: Colors.navyDark,
    borderRadius: 40,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 4,
    ...Shadows.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 30,
    flexDirection: 'row',
    gap: 6,
  },
  tabActive: {
    backgroundColor: Colors.orange,
  },
  icon: { fontSize: 20, opacity: 0.45 },
  iconActive: { opacity: 1 },
  label: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});

// ─── Shipper Tabs ──────────────────────────────────────────────────────────────
function ShipperTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Dashboard"
        component={ShipperDashboard}
        options={{ tabBarIcon: ({ focused }) => focused ? '🏠' : '🏠', tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Create"
        component={CreateShipmentScreen}
        options={{ tabBarIcon: ({ focused }) => '📦', tabBarLabel: 'New' }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ tabBarIcon: ({ focused }) => '📋', tabBarLabel: 'History' }}
      />
    </Tab.Navigator>
  );
}

// ─── Carrier Tabs ──────────────────────────────────────────────────────────────
function CarrierTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="CarrierHome"
        component={CarrierDashboard}
        options={{ tabBarIcon: () => '🏠', tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Available"
        component={AvailableShipmentsScreen}
        options={{ tabBarIcon: () => '🔍', tabBarLabel: 'Browse' }}
      />
      <Tab.Screen
        name="ActiveJob"
        component={ActiveJobScreen}
        options={{ tabBarIcon: () => '🚚', tabBarLabel: 'Active Job' }}
      />
      <Tab.Screen
        name="CarrierProfile"
        component={CarrierProfileScreen}
        options={{ tabBarIcon: () => '👤', tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// ─── Splash Loader ─────────────────────────────────────────────────────────────
function SplashScreen() {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={splashStyles.root}>
      <Animated.Text style={[splashStyles.brand, { transform: [{ scale: pulseAnim }] }]}>
        Wasel<Text style={splashStyles.x}>X</Text>
      </Animated.Text>
      <Text style={splashStyles.tagline}>Connecting Cargo. Powering UAE.</Text>
      <ActivityIndicator color={Colors.orange} style={{ marginTop: 40 }} />
    </View>
  );
}

const splashStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.navy, alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 52, fontWeight: '900', color: Colors.white, letterSpacing: -1 },
  x: { color: Colors.orange },
  tagline: { marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, textTransform: 'uppercase' },
});

// ─── Root Navigator ────────────────────────────────────────────────────────────
export default function RootNavigator() {
  const { isAuthenticated, isLoading, initialize, user } = useAuthStore();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('waselx_onboarding_done').then((val) => {
      setOnboardingDone(!!val);
      setCheckingOnboarding(false);
    });
  }, []);

  if (isLoading || checkingOnboarding) return <SplashScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: Colors.navy } }}>
        {!isAuthenticated ? (
          // ─ Auth flow ─
          <>
            {!onboardingDone && (
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            )}
            <Stack.Screen name="Login"    component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : user?.role === 'shipper' ? (
          // ─ Shipper flow ─
          <>
            <Stack.Screen name="ShipperTabs"    component={ShipperTabs} />
            <Stack.Screen name="ShipmentDetail" component={ShipmentDetailScreen} />
            <Stack.Screen name="Tracking"       component={TrackingScreen} />
          </>
        ) : (
          // ─ Carrier flow ─
          <>
            <Stack.Screen name="CarrierTabs"          component={CarrierTabs} />
            <Stack.Screen name="CarrierShipmentDetail" component={CarrierShipmentDetailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
