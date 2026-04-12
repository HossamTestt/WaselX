/**
 * WaselX — Premium Onboarding Screen
 * 3-slide animated swiper with spring motion, progress dots and glassmorphism CTA
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions,
  TouchableOpacity, StatusBar, Animated, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: 'move',
    headline: 'Move Cargo,',
    headlineAccent: 'Not Mountains.',
    body: 'Post your shipment in 60 seconds and receive competitive bids from verified UAE carriers instantly.',
    icon: '🚚',
    bg: ['#0D1F30', '#142F48'],
    accent: Colors.orange,
  },
  {
    id: 'track',
    headline: 'Track Every',
    headlineAccent: 'Mile. Live.',
    body: 'Real-time GPS updates, status notifications, and full delivery transparency — right in your pocket.',
    icon: '📍',
    bg: ['#0A1628', '#1A3A5C'],
    accent: '#00C2FF',
  },
  {
    id: 'trust',
    headline: 'Verified Carriers.',
    headlineAccent: 'Safe Deliveries.',
    body: 'Every carrier on WaselX is UAE PASS certified and background-checked. Your cargo is in trusted hands.',
    icon: '🛡️',
    bg: ['#0F1E13', '#1A3A25'],
    accent: Colors.success,
  },
];

export default function OnboardingScreen({ navigation }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const iconScale = useRef(new Animated.Value(0.8)).current;
  const dotWidths = SLIDES.map(() => useRef(new Animated.Value(8)).current);

  const animateIn = (index) => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    iconScale.setValue(0.8);

    SLIDES.forEach((_, i) => {
      Animated.timing(dotWidths[i], {
        toValue: i === index ? 28 : 8,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
      Animated.spring(iconScale, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => { animateIn(0); }, []);

  const handleScroll = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== activeIndex) {
      setActiveIndex(index);
      animateIn(index);
    }
  };

  const goNext = async () => {
    if (activeIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (activeIndex + 1) * width, animated: true });
    } else {
      await AsyncStorage.setItem('waselx_onboarding_done', 'true');
      navigation.replace('Login');
    }
  };

  const skip = async () => {
    await AsyncStorage.setItem('waselx_onboarding_done', 'true');
    navigation.replace('Login');
  };

  const slide = SLIDES[activeIndex];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background */}
      <View style={[styles.bg, { backgroundColor: slide.bg[1] }]} />

      <SafeAreaView style={styles.safe}>
        {/* Skip */}
        <View style={styles.topBar}>
          <View />
          <TouchableOpacity onPress={skip} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Slides */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
        >
          {SLIDES.map((s, i) => (
            <View key={s.id} style={styles.slide}>
              {/* Icon orb */}
              <Animated.View style={[
                styles.orb,
                { borderColor: s.accent + '40', opacity: activeIndex === i ? fadeAnim : 0 }
              ]}>
                <Animated.View style={[
                  styles.orbInner,
                  { backgroundColor: s.accent + '20', transform: [{ scale: activeIndex === i ? iconScale : 0.8 }] }
                ]}>
                  <Text style={styles.icon}>{s.icon}</Text>
                </Animated.View>
              </Animated.View>

              {/* Text */}
              <Animated.View style={[
                styles.textBlock,
                activeIndex === i ? { opacity: fadeAnim, transform: [{ translateY: slideAnim }] } : { opacity: 0 }
              ]}>
                <Text style={styles.headline}>{s.headline}</Text>
                <Text style={[styles.headlineAccent, { color: s.accent }]}>{s.headlineAccent}</Text>
                <Text style={styles.body}>{s.body}</Text>
              </Animated.View>
            </View>
          ))}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Progress dots */}
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: dotWidths[i],
                    backgroundColor: i === activeIndex ? slide.accent : 'rgba(255,255,255,0.25)',
                  }
                ]}
              />
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.cta, { backgroundColor: slide.accent }]}
            onPress={goNext}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>
              {activeIndex === SLIDES.length - 1 ? '🚀  Get Started' : 'Next  →'}
            </Text>
          </TouchableOpacity>

          {/* Step counter */}
          <Text style={styles.stepText}>{activeIndex + 1} of {SLIDES.length}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D1F30' },
  bg: { ...StyleSheet.absoluteFillObject },
  safe: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    height: 50,
  },
  skipText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 100,
  },

  orb: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  orbInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 72 },

  textBlock: { alignItems: 'center' },
  headline: {
    ...Typography.h1,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 36,
  },
  headlineAccent: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: Spacing.md,
  },
  body: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 300,
  },

  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 12 : Spacing.lg,
    alignItems: 'center',
    gap: 16,
  },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dot: { height: 8, borderRadius: BorderRadius.full },

  cta: {
    width: '100%',
    height: 56,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaText: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },

  stepText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
