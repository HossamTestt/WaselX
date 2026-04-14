/**
 * WaselX — Premium Carrier Dashboard
 * Earnings summary · Active job card · Browse CTA · Verification badge (Arabic)
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Animated, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, StatusBadge, EmptyState } from '../../components';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../../theme';
import useAuthStore from '../../store/authStore';
import { shipmentsAPI } from '../../services/api';

export default function CarrierDashboard({ navigation }) {
  const user   = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const [activeJob, setActiveJob] = useState(null);
  const [stats, setStats]         = useState({ completed: 0, totalEarned: 0 });
  const [loading, setLoading]     = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const fetchData = async () => {
    try {
      const { data } = await shipmentsAPI.list({ limit: 50 });
      const list = data.data || [];
      const active = list.find(s => ['assigned','picked_up','in_transit'].includes(s.status));
      setActiveJob(active || null);
      setStats({
        completed:   list.filter(s => s.status === 'delivered').length,
        totalEarned: list.filter(s => s.final_price).reduce((a, s) => a + Number(s.final_price || 0), 0),
      });
    } catch (e) {
      console.error('Carrier dashboard error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const onRefresh = async () => { setLoading(true); await fetchData(); };

  const verified = user?.verification_status === 'verified';
  const isPending = user?.verification_status === 'pending_review';
  const firstName = user?.name?.split(' ')[0] || 'سائق';

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerTop}>
          <View style={styles.logoBackground}>
            <Image 
              source={require('../../../assets/logo_horizontal.png')} 
              style={styles.logo} 
              resizeMode="contain" 
            />
          </View>
        </View>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.subtitle}>هل أنت مستعد للانطلاق؟</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.name}>{firstName}</Text>
              {verified
                ? <View style={[styles.badge, { borderColor: Colors.success + '60', backgroundColor: Colors.success + '20' }]}>
                    <Text style={[styles.badgeText, { color: Colors.success }]}>✓ موثق</Text>
                  </View>
                : isPending
                ? <View style={[styles.badge, { borderColor: Colors.warning + '60', backgroundColor: Colors.warning + '20' }]}>
                    <Text style={[styles.badgeText, { color: Colors.warning }]}>⏳ قيد المراجعة</Text>
                  </View>
                : <View style={[styles.badge, { borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                    <Text style={[styles.badgeText, { color: 'rgba(255,255,255,0.5)' }]}>غير موثق</Text>
                  </View>
              }
            </View>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={{ fontSize: 20 }}>🚪</Text>
          </TouchableOpacity>
        </View>

        {/* Earnings stat row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{stats.completed}</Text>
            <Text style={styles.statLabel}>رحلة مكتملة</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{stats.totalEarned.toLocaleString()} AED</Text>
            <Text style={styles.statLabel}>إجمالي الأرباح</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* ── Body ── */}
      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={Colors.orange} />}
      >
        {/* Browse CTA */}
        <TouchableOpacity style={styles.heroBanner} onPress={() => navigation.navigate('Available')} activeOpacity={0.88}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>تصفح الشحنات المتاحة 🔍</Text>
            <Text style={styles.heroSub}>ابحث عن شحنات قريبة منك وقدم أفضل عرض سعر</Text>
          </View>
          <View style={styles.heroArrow}><Text style={{ color: Colors.white, fontSize: 20 }}>←</Text></View>
        </TouchableOpacity>

        {/* Verification notice for unverified carriers */}
        {!verified && (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeIcon}>{isPending ? '⏳' : '⚠️'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.noticeTitle}>{isPending ? 'التوثيق قيد المراجعة' : 'وثّق حسابك الآن'}</Text>
              <Text style={styles.noticeBody}>
                {isPending
                  ? 'يتم الآن مراجعة مستنداتك. يمكنك التصفح ولكن لا يمكنك تقديم عروض حتى يتم قبولك.'
                  : 'أكمل توثيق الهوية الرقمية (UAE PASS) لفتح جميع ميزات التطبيق وكسب ثقة الشاحنين.'}
              </Text>
            </View>
          </View>
        )}

        {/* Active Job */}
        <Text style={styles.sectionTitle}>الرحلة الحالية</Text>
        {activeJob ? (
          <TouchableOpacity onPress={() => navigation.navigate('ActiveJob')} activeOpacity={0.88}>
            <View style={styles.activeJobCard}>
              <View style={styles.activeJobTop}>
                <StatusBadge status={activeJob.status} />
                <Text style={styles.activeJobPrice}>{Number(activeJob.final_price).toLocaleString()} AED</Text>
              </View>
              <Text style={styles.activeJobRoute}>
                {activeJob.pickup_city}  ←  {activeJob.dropoff_city}
              </Text>
              <Text style={styles.activeJobLoad}>{activeJob.load_type} · {activeJob.weight_tonnes} طن</Text>

              {/* Progress bar */}
              {(() => {
                const steps = ['assigned','picked_up','in_transit','delivered'];
                const pct = ((steps.indexOf(activeJob.status) + 1) / steps.length) * 100;
                return (
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${pct}%` }]} />
                  </View>
                );
              })()}

              <Text style={styles.manageCta}>اضغط للتفاصيل وتحديث الحالة ←</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <EmptyState icon="🛣️" title="لا توجد رحلات نشطة" message="لا توجد لديك شحنات قيد التنفيذ حالياً. ابحث عن شحنة جديدة!" />
        )}

        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  header: {
    backgroundColor: Colors.navyDark,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: { alignItems: 'center', paddingTop: Spacing.xs, marginBottom: -Spacing.xs },
  logoBackground: { 
    backgroundColor: 'rgba(255,255,255,0.9)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12,
  },
  logo: { width: 100, height: 28 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: Spacing.xs },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: '600', marginBottom: 2, textAlign: 'right' },
  name: { fontSize: 24, fontWeight: '800', color: Colors.white, textAlign: 'right' },
  logoutBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },

  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  statsRow: { flexDirection: 'row', marginTop: Spacing.md, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: BorderRadius.md, padding: Spacing.sm },
  statItem: { flex: 1, alignItems: 'center' },
  statNum:  { fontSize: 18, fontWeight: '800', color: Colors.white },
  statLabel:{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 },

  scroll: { padding: Spacing.md },

  heroBanner: {
    backgroundColor: Colors.orange,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  heroTitle: { fontSize: 16, fontWeight: '800', color: Colors.white, marginBottom: 4, textAlign: 'right' },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', maxWidth: 200, textAlign: 'right' },
  heroArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },

  noticeCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.warningBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warning + '40',
  },
  noticeIcon: { fontSize: 24 },
  noticeTitle: { fontSize: 14, fontWeight: '700', color: Colors.warning, marginBottom: 4, textAlign: 'right' },
  noticeBody: { fontSize: 13, color: Colors.textMuted, lineHeight: 18, textAlign: 'right' },

  sectionTitle: { ...Typography.h4, color: Colors.text, marginBottom: Spacing.sm, textAlign: 'right' },

  activeJobCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.orange + '60',
    ...Shadows.md,
  },
  activeJobTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  activeJobPrice: { fontSize: 16, fontWeight: '800', color: Colors.success },
  activeJobRoute: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 4, textAlign: 'right' },
  activeJobLoad: { fontSize: 13, color: Colors.textMuted, marginBottom: Spacing.md, textAlign: 'right' },

  progressTrack: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: Spacing.sm },
  progressFill: { height: '100%', backgroundColor: Colors.orange, borderRadius: 3 },

  manageCta: { textAlign: 'center', color: Colors.orange, fontWeight: '700', fontSize: 13 },
});
