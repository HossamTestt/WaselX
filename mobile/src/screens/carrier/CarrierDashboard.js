/**
 * WaselX — Premium Carrier Dashboard
 * Earnings summary · Active job card · Browse CTA · Verification badge
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Animated
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
  const firstName = user?.name?.split(' ')[0] || 'Driver';

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.subtitle}>Ready to haul?</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.name}>{firstName}</Text>
              {verified
                ? <View style={[styles.badge, { borderColor: Colors.success + '60', backgroundColor: Colors.success + '20' }]}>
                    <Text style={[styles.badgeText, { color: Colors.success }]}>✓ Certified</Text>
                  </View>
                : isPending
                ? <View style={[styles.badge, { borderColor: Colors.warning + '60', backgroundColor: Colors.warning + '20' }]}>
                    <Text style={[styles.badgeText, { color: Colors.warning }]}>⏳ Pending</Text>
                  </View>
                : <View style={[styles.badge, { borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                    <Text style={[styles.badgeText, { color: 'rgba(255,255,255,0.5)' }]}>Not Verified</Text>
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
            <Text style={styles.statLabel}>Trips Done</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>AED {stats.totalEarned.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
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
          <View>
            <Text style={styles.heroTitle}>Browse Open Loads 🔍</Text>
            <Text style={styles.heroSub}>Find shipments near you and submit your best bid</Text>
          </View>
          <View style={styles.heroArrow}><Text style={{ color: Colors.white, fontSize: 20 }}>→</Text></View>
        </TouchableOpacity>

        {/* Verification notice for unverified carriers */}
        {!verified && (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeIcon}>{isPending ? '⏳' : '⚠️'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.noticeTitle}>{isPending ? 'Verification Under Review' : 'Get Certified'}</Text>
              <Text style={styles.noticeBody}>
                {isPending
                  ? 'Your documents are being reviewed. You can browse but may not bid until approved.'
                  : 'Complete UAE PASS or passport verification to unlock full access and earn shipper trust.'}
              </Text>
            </View>
          </View>
        )}

        {/* Active Job */}
        <Text style={styles.sectionTitle}>Current Job</Text>
        {activeJob ? (
          <TouchableOpacity onPress={() => navigation.navigate('ActiveJob')} activeOpacity={0.88}>
            <View style={styles.activeJobCard}>
              <View style={styles.activeJobTop}>
                <StatusBadge status={activeJob.status} />
                <Text style={styles.activeJobPrice}>AED {Number(activeJob.final_price).toLocaleString()}</Text>
              </View>
              <Text style={styles.activeJobRoute}>
                {activeJob.pickup_city}  →  {activeJob.dropoff_city}
              </Text>
              <Text style={styles.activeJobLoad}>{activeJob.load_type} · {activeJob.weight_tonnes}t</Text>

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

              <Text style={styles.manageCta}>Tap to manage & update status →</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <EmptyState icon="🛣️" title="No Active Load" message="You aren't hauling anything right now. Go find a load!" />
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: Spacing.sm },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: '600', marginBottom: 2 },
  name: { fontSize: 24, fontWeight: '800', color: Colors.white },
  logoutBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },

  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  statsRow: { flexDirection: 'row', marginTop: Spacing.md, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: BorderRadius.md, padding: Spacing.sm },
  statItem: { flex: 1, alignItems: 'center' },
  statNum:  { fontSize: 20, fontWeight: '800', color: Colors.white },
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
  heroTitle: { fontSize: 16, fontWeight: '800', color: Colors.white, marginBottom: 4 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', maxWidth: 200 },
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
  noticeTitle: { fontSize: 14, fontWeight: '700', color: Colors.warning, marginBottom: 4 },
  noticeBody: { fontSize: 13, color: Colors.textMuted, lineHeight: 18 },

  sectionTitle: { ...Typography.h4, color: Colors.text, marginBottom: Spacing.sm },

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
  activeJobRoute: { fontSize: 17, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  activeJobLoad: { fontSize: 13, color: Colors.textMuted, marginBottom: Spacing.md },

  progressTrack: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden', marginBottom: Spacing.sm },
  progressFill: { height: '100%', backgroundColor: Colors.orange, borderRadius: 3 },

  manageCta: { textAlign: 'center', color: Colors.orange, fontWeight: '700', fontSize: 13 },
});
