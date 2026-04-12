/**
 * WaselX — First-Login Welcome Modal
 * Shows once per user session after login, welcoming them by name
 */
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  Animated, Dimensions, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

const { height } = Dimensions.get('window');

const ROLE_CONFIG = {
  shipper: {
    emoji: '📦',
    headline: 'Ready to move cargo?',
    body: "Post your first shipment and get competing bids from verified UAE carriers — all in under 60 seconds.",
    cta: "Let's Ship",
    accent: Colors.blue,
  },
  carrier: {
    emoji: '🚚',
    headline: 'Ready to haul?',
    body: "Browse open loads near you, submit your best bid, and start earning today.",
    cta: "Browse Loads",
    accent: Colors.orange,
  },
  admin: {
    emoji: '⚡',
    headline: 'Platform Control Center',
    body: "Monitor live activity, manage users, oversee the marketplace — all from your admin dashboard.",
    cta: "Go to Dashboard",
    accent: Colors.navy,
  },
};

export default function WelcomeModal({ visible, user, onClose }) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: height, duration: 250, useNativeDriver: true }),
    ]).start(onClose);
  };

  const cfg = ROLE_CONFIG[user?.role] || ROLE_CONFIG.shipper;
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleClose} activeOpacity={1} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>

          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Emoji orb */}
          <View style={[styles.emojiOrb, { backgroundColor: cfg.accent + '15' }]}>
            <Text style={styles.emoji}>{cfg.emoji}</Text>
          </View>

          {/* Greeting */}
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={[styles.name, { color: cfg.accent }]}>{firstName}! 👋</Text>
          <Text style={styles.headline}>{cfg.headline}</Text>
          <Text style={styles.body}>{cfg.body}</Text>

          {/* CTA button */}
          <TouchableOpacity
            style={[styles.cta, { backgroundColor: cfg.accent }]}
            onPress={handleClose}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>{cfg.cta}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.dismiss}>Maybe later</Text>
          </TouchableOpacity>

        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    alignItems: 'center',
  },
  handle: {
    width: 40, height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  emojiOrb: {
    width: 80, height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emoji: { fontSize: 40 },
  welcome: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  headline: {
    ...Typography.h4,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  body: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
    maxWidth: 300,
  },
  cta: {
    width: '100%',
    height: 54,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  dismiss: {
    fontSize: 14,
    color: Colors.textLight,
    fontWeight: '600',
  },
});
