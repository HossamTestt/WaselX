/**
 * WaselX — Premium Onboarding Screen
 * Web-compatible: uses state-based slide transitions (no horizontal ScrollView paging)
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Dimensions,
  TouchableOpacity, StatusBar, Animated, Platform, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { t } from '../../i18n';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: 'move',
    headline: 'انقل شحنتك،',
    headlineAccent: 'بكل سلاسة.',
    body: 'انشر طلب شحن في ٦٠ ثانية واستلم عروضاً تنافسية من ناقلينا المعتمدين في الإمارات فوراً.',
    icon: '🚚',
    accentColor: Colors.orange,
    bgTop: '#0D1F30',
    bgBottom: '#142F48',
  },
  {
    id: 'track',
    headline: 'تتبع كل',
    headlineAccent: 'ميل. مباشرة.',
    body: 'تحديثات حية لموقع الشحنة، تنبيهات الحالة، وشفافية كاملة في التوصيل — في جيبك تماماً.',
    icon: '📍',
    accentColor: '#00C2FF',
    bgTop: '#0A1628',
    bgBottom: '#1A3A5C',
  },
  {
    id: 'trust',
    headline: 'ناقلين معتمدين.',
    headlineAccent: 'توصيل آمن.',
    body: 'كل ناقل في واصل إكس موثق عبر الهوية الرقمية (UAE PASS). شحنتك في أيدٍ أمينة دائماً.',
    icon: '🛡️',
    accentColor: '#22C55E',
    bgTop: '#0F1E13',
    bgBottom: '#1A3A25',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(1)).current;
  const dotWidths = useRef(SLIDES.map((_, i) => new Animated.Value(i === 0 ? 28 : 8))).current;

  const animateIn = (nextIndex) => {
    // Fade out
    Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setActiveIndex(nextIndex);

      // Reset slide position
      slideAnim.setValue(40);
      iconScale.setValue(0.75);

      // Update dot widths
      SLIDES.forEach((_, i) => {
        Animated.timing(dotWidths[i], {
          toValue: i === nextIndex ? 28 : 8,
          duration: 300,
          useNativeDriver: false,
        }).start();
      });

      // Fade + slide in
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
        Animated.spring(iconScale, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }),
      ]).start();
    });
  };

  useEffect(() => { animateIn(0); }, []);

  const goNext = async () => {
    if (activeIndex < SLIDES.length - 1) {
      animateIn(activeIndex + 1);
    } else {
      await AsyncStorage.setItem('waselx_onboarding_done', 'true');
      navigation.replace('Login');
    }
  };

  const goBack = () => {
    if (activeIndex > 0) animateIn(activeIndex - 1);
  };

  const skip = async () => {
    await AsyncStorage.setItem('waselx_onboarding_done', 'true');
    navigation.replace('Login');
  };

  const slide = SLIDES[activeIndex];

  return (
    <View style={[styles.root, { backgroundColor: slide.bgBottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <SafeAreaView style={styles.safe}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          {activeIndex > 0 ? (
            <TouchableOpacity onPress={goBack} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={styles.backText}>← رجوع</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 60 }} />
          )}
          <TouchableOpacity onPress={skip} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.skipText}>تخطي</Text>
          </TouchableOpacity>
        </View>

        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoBackground}>
            <Image
              source={require('../../../assets/logo_horizontal.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Animated Content */}
        <Animated.View style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          {/* Icon Orb */}
          <Animated.View style={[
            styles.orb,
            { borderColor: slide.accentColor + '40', transform: [{ scale: iconScale }] }
          ]}>
            <View style={[styles.orbInner, { backgroundColor: slide.accentColor + '22' }]}>
              <Text style={styles.icon}>{slide.icon}</Text>
            </View>
          </Animated.View>

          {/* Text */}
          <View style={styles.textBlock}>
            <Text style={styles.headline}>{slide.headline}</Text>
            <Text style={[styles.headlineAccent, { color: slide.accentColor }]}>{slide.headlineAccent}</Text>
            <Text style={styles.body}>{slide.body}</Text>
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Progress Dots */}
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => animateIn(i)}>
                <Animated.View
                  style={[
                    styles.dot,
                    {
                      width: dotWidths[i],
                      backgroundColor: i === activeIndex ? slide.accentColor : 'rgba(255,255,255,0.25)',
                    }
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={[styles.cta, { backgroundColor: slide.accentColor }]}
            onPress={goNext}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>
              {activeIndex === SLIDES.length - 1 ? '🚀  ' + t('getStarted') : 'التالي  ←'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.stepText}>{activeIndex + 1} من {SLIDES.length}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    height: 50,
  },
  backBtn: { paddingHorizontal: 4 },
  backText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' },
  skipText: { color: 'rgba(255,255,255,0.45)', fontSize: 14, fontWeight: '600', letterSpacing: 0.3 },

  logoWrap: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  logo: {
    width: 160,
    height: 60,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },

  orb: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  orbInner: {
    width: 148,
    height: 148,
    borderRadius: 74,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 64 },

  textBlock: { alignItems: 'center' },
  headline: {
    fontSize: 28,
    fontWeight: '800',
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
  dot: { height: 8, borderRadius: 4 },

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
