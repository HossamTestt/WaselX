/**
 * WaselX — Premium Shipper Dashboard
 * Time-aware greeting · Stats bar · Floating menu · Active shipment timeline (Arabic)
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, Animated, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, StatusBadge, Button, EmptyState } from '../../components';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../../theme';
import useAuthStore from '../../store/authStore';
import { shipmentsAPI } from '../../services/api';

const GREETING = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'صباح الخير', icon: '☀️' };
  if (h < 17) return { text: 'مساء الخير', icon: '🌤' };
  return { text: 'مساء الخير', icon: '🌙' };
};

const STATUS_STEPS = ['open', 'bidding', 'assigned', 'picked_up', 'in_transit', 'delivered'];

function ProgressTimeline({ status }) {
  const idx = STATUS_STEPS.indexOf(status);
  return (
    <View style={tl.root}>
      {STATUS_STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <View style={[tl.dot, i <= idx ? tl.dotDone : null]}>
            {i < idx && <Text style={{ fontSize: 8, color: '#fff' }}>✓</Text>}
            {i === idx && <View style={tl.dotActive} />}
          </View>
          {i < STATUS_STEPS.length - 1 && (
            <View style={[tl.bar, i < idx ? tl.barDone : null]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

const tl = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: Colors.success },
  dotActive: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.orange },
  bar: { flex: 1, height: 2, backgroundColor: Colors.border },
  barDone: { backgroundColor: Colors.success },
});

export default function ShipperDashboard({ navigation }) {
  const user    = useAuthStore(s => s.user);
  const logout  = useAuthStore(s => s.logout);
  const [shipments, setShipments] = useState([]);
  const [stats, setStats]         = useState({ active: 0, delivered: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const greeting = GREETING();

  const fetchShipments = async () => {
    try {
      const { data } = await shipmentsAPI.list({ limit: 10 });
      const list = data.data || [];
      setShipments(list);
      setStats({
        active:    list.filter(s => !['delivered','cancelled'].includes(s.status)).length,
        delivered: list.filter(s => s.status === 'delivered').length,
      });
    } catch (e) {
      console.error('Shipper dashboard fetch failed', e);
    }
  };

  useEffect(() => {
    fetchShipments();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const onRefresh = async () => { setRefreshing(true); await fetchShipments(); setRefreshing(false); };

  const verified = user?.verification_status === 'verified';

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
            <Text style={styles.greetSubtitle}>{greeting.text} {greeting.icon}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.greetName}>{user?.name?.split(' ')[0]}</Text>
              {verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ موثق</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={{ fontSize: 20 }}>🚪</Text>
          </TouchableOpacity>
        </View>

        {/* Stats bar */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{stats.active}</Text>
            <Text style={styles.statLabel}>نشط</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{stats.delivered}</Text>
            <Text style={styles.statLabel}>تم التوصيل</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{shipments.length}</Text>
            <Text style={styles.statLabel}>الإجمالي</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* ── Scrollable Body ── */}
      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.orange} />}
      >
        {/* Hero CTA */}
        <View style={styles.heroBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>تريد شحن شيء ما؟</Text>
            <Text style={styles.heroSubtitle}>احصل على عروض من ناقلين معتمدين في دقائق</Text>
          </View>
          <TouchableOpacity
            style={styles.heroBtn}
            onPress={() => navigation.navigate('Create')}
            activeOpacity={0.85}
          >
            <Text style={styles.heroBtnText}>＋  جديد</Text>
          </TouchableOpacity>
        </View>

        {/* Shipments list */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>شحناتك</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.seeAll}>عرض الكل ←</Text>
          </TouchableOpacity>
        </View>

        {shipments.length === 0 ? (
          <EmptyState
            icon="📦"
            title="لا توجد شحنات بعد"
            message="أنشئ شحنتك الأولى وشاهد العروض تصلك."
            action={
              <Button
                title="إنشاء شحنة"
                onPress={() => navigation.navigate('Create')}
                style={{ marginTop: 16, paddingHorizontal: 32 }}
              />
            }
          />
        ) : (
          shipments.map(s => (
            <TouchableOpacity key={s.id} onPress={() => navigation.navigate('ShipmentDetail', { id: s.id })} activeOpacity={0.88}>
              <View style={styles.shipCard}>
                {/* Top row */}
                <View style={styles.shipTop}>
                  <StatusBadge status={s.status} />
                  <Text style={styles.shipDate}>{new Date(s.created_at).toLocaleDateString('ar-AE', { day: '2-digit', month: 'short' })}</Text>
                </View>

                {/* Route */}
                <View style={styles.routeRow}>
                  <View style={styles.routePin}>
                    <Text style={{ fontSize: 16 }}>📍</Text>
                    <Text style={styles.routeCity} numberOfLines={1}>{s.pickup_city}</Text>
                  </View>
                  <View style={styles.routeArrow}><Text style={styles.routeArrowText}>──→</Text></View>
                  <View style={styles.routePin}>
                    <Text style={{ fontSize: 16 }}>🏁</Text>
                    <Text style={styles.routeCity} numberOfLines={1}>{s.dropoff_city}</Text>
                  </View>
                </View>

                {/* Timeline */}
                {s.status !== 'cancelled' && <ProgressTimeline status={s.status} />}

                {/* Footer */}
                <View style={styles.shipFooter}>
                  <Text style={styles.loadType}>{s.load_type} · {s.weight_tonnes} طن</Text>
                  {s.final_price ? (
                    <Text style={styles.priceTag}>{Number(s.final_price).toLocaleString()} AED</Text>
                  ) : (
                    <View style={styles.bidsBadge}>
                      <Text style={styles.bidsText}>{s.bid_count || 0} عروض</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Bottom padding for floating tab bar */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  // Header
  header: { backgroundColor: Colors.navy, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  headerTop: { alignItems: 'center', paddingTop: Spacing.xs, marginBottom: -Spacing.xs },
  logoBackground: { 
    backgroundColor: 'rgba(255,255,255,0.92)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12,
  },
  logo: { width: 100, height: 28 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing.xs },
  greetSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: '600', marginBottom: 2, textAlign: 'right' },
  greetName: { fontSize: 24, fontWeight: '800', color: Colors.white, textAlign: 'right' },
  logoutBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },

  verifiedBadge: { backgroundColor: Colors.success + '30', paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.success + '50' },
  verifiedText: { fontSize: 11, color: Colors.success, fontWeight: '700' },

  statsRow: { flexDirection: 'row', marginTop: Spacing.md, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: BorderRadius.md, padding: Spacing.sm },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800', color: Colors.white },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 },

  scroll: { padding: Spacing.md },

  // Hero
  heroBanner: {
    backgroundColor: Colors.orange,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  heroTitle: { fontSize: 16, fontWeight: '800', color: Colors.white, marginBottom: 4, textAlign: 'right' },
  heroSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.75)', maxWidth: 160, textAlign: 'right' },
  heroBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: BorderRadius.xl, paddingHorizontal: 16, paddingVertical: 10 },
  heroBtnText: { color: Colors.white, fontWeight: '800', fontSize: 14 },

  // Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  sectionTitle: { ...Typography.h4, color: Colors.text, textAlign: 'right' },
  seeAll: { fontSize: 13, color: Colors.blue, fontWeight: '700' },

  // Shipment card
  shipCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  shipTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  shipDate: { fontSize: 12, color: Colors.textLight, fontWeight: '600' },

  routeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  routePin: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 6 },
  routeCity: { fontSize: 14, fontWeight: '700', color: Colors.text, flex: 1, textAlign: 'right' },
  routeArrow: { paddingHorizontal: 8 },
  routeArrowText: { color: Colors.textLight, fontSize: 12 },

  shipFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border },
  loadType: { fontSize: 12, color: Colors.textMuted, fontWeight: '600', textAlign: 'right' },
  priceTag: { fontSize: 14, fontWeight: '800', color: Colors.success },
  bidsBadge: { backgroundColor: Colors.warningBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.full },
  bidsText: { fontSize: 12, fontWeight: '700', color: Colors.warning },
});
