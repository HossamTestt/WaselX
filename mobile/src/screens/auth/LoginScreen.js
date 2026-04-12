/**
 * WaselX — Premium Login Screen
 * Glassmorphism card · Pulse logo · First-login welcome modal
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, KeyboardAvoidingView, Platform,
  Alert, Animated, StatusBar, ImageBackground, TouchableOpacity, Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, Input } from '../../components';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import useAuthStore from '../../store/authStore';
import WelcomeModal from '../shared/WelcomeModal';

const BG = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop';

export default function LoginScreen({ navigation }) {
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showPass, setShowPass] = useState(false);

  // Animations
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const glowAnim   = useRef(new Animated.Value(0.4)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();

    // Continuous logo pulse
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 1800, useNativeDriver: true }),
          Animated.timing(glowAnim,  { toValue: 0.8,  duration: 1800, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, { toValue: 1,    duration: 1800, useNativeDriver: true }),
          Animated.timing(glowAnim,  { toValue: 0.4,  duration: 1800, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);

      // Check if first login
      const key = `waselx_welcomed_${user?.id || email}`;
      const welcomed = await AsyncStorage.getItem(key);
      if (!welcomed) {
        await AsyncStorage.setItem(key, 'true');
        setLoggedInUser(user);
        setShowWelcome(true);
      }
    } catch (e) {
      Alert.alert('Login Failed', e.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ImageBackground source={{ uri: BG }} style={styles.bg} blurRadius={Platform.OS === 'ios' ? 12 : 6}>
        <View style={styles.overlay} />

        <SafeAreaView style={styles.safe}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.kav}
          >
            <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

              {/* ── Logo ── */}
              <View style={styles.logoArea}>
                {/* Glow halo */}
                <Animated.View style={[styles.glow, { opacity: glowAnim }]} />
                <Animated.Image
                  source={require('../../../assets/logo.png')}
                  style={[styles.logo, { transform: [{ scale: pulseAnim }] }]}
                  resizeMode="contain"
                />
                <Text style={styles.tagline}>Logistics at your fingertips</Text>
              </View>

              {/* ── Form ── */}
              <View style={styles.form}>
                <Input
                  label="Email Address"
                  placeholder="you@company.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                  inputStyle={styles.inputText}
                  style={styles.inputWrap}
                />
                <Input
                  label="Password"
                  placeholder="••••••••••"
                  secureTextEntry={!showPass}
                  value={password}
                  onChangeText={setPassword}
                  inputStyle={styles.inputText}
                  style={styles.inputWrap}
                />

                <TouchableOpacity style={styles.forgotRow} onPress={() => Alert.alert('Reset Password', 'Please contact support@waselx.com to reset your password.')}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>

                <Button
                  title="Sign In"
                  onPress={handleLogin}
                  loading={loading}
                  style={styles.btnSignIn}
                />

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.divLine} />
                  <Text style={styles.divText}>OR</Text>
                  <View style={styles.divLine} />
                </View>

                {/* UAE PASS */}
                <TouchableOpacity
                  style={styles.btnUAE}
                  onPress={() => Alert.alert('UAE PASS', 'UAE PASS SSO is coming soon in the next release.')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnUAEIcon}>🇦🇪</Text>
                  <Text style={styles.btnUAEText}>Sign in with UAE PASS</Text>
                </TouchableOpacity>
              </View>

              {/* ── Footer ── */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>New to WaselX? </Text>
                <Pressable onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.footerLink}>Create account</Text>
                </Pressable>
              </View>

            </Animated.View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>

      {/* Welcome Modal */}
      <WelcomeModal
        visible={showWelcome}
        user={loggedInUser}
        onClose={() => setShowWelcome(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bg:   { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13,31,48,0.72)',
  },
  safe: { flex: 1 },
  kav:  { flex: 1, justifyContent: 'center', padding: Spacing.lg },

  card: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.40,
    shadowRadius: 40,
    elevation: 20,
  },

  // Logo
  logoArea:  { alignItems: 'center', marginBottom: Spacing.xl, position: 'relative' },
  glow: {
    position: 'absolute',
    top: -10,
    width: 160,
    height: 80,
    borderRadius: 80,
    backgroundColor: Colors.orange,
    shadowColor: Colors.orange,
    shadowRadius: 40,
    shadowOpacity: 1,
    elevation: 0,
  },
  logo:    { width: 190, height: 65 },
  tagline: { marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: '600' },

  // Inputs
  form:      { width: '100%' },
  inputWrap: { marginBottom: Spacing.sm },
  inputText: { color: Colors.white, borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.08)' },

  forgotRow: { alignItems: 'flex-end', marginBottom: Spacing.md, marginTop: -4 },
  forgotText: { fontSize: 13, color: Colors.orange, fontWeight: '600' },

  // Sign in
  btnSignIn: {
    backgroundColor: Colors.orange,
    borderRadius: BorderRadius.xl,
    height: 54,
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },

  // Divider
  divider:  { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.md },
  divLine:  { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  divText:  { marginHorizontal: 12, fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: '700', letterSpacing: 1 },

  // UAE PASS
  btnUAE: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: BorderRadius.xl,
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  btnUAEIcon: { fontSize: 20 },
  btnUAEText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '700' },

  // Footer
  footer:     { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.lg },
  footerText: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
  footerLink: { color: Colors.orange, fontWeight: '700', fontSize: 14 },
});
