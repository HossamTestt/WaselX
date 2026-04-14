/**
 * AvailableShipmentsScreen — Dark-themed with prominent "Make Offer" CTA
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, TextInput, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { shipmentsAPI } from '../../services/api';

const LOAD_TYPE_ICONS = {
  'General Cargo': '📦',
  'Furniture': '🛋️',
  'Construction': '🧱',
  'Food & Perishables': '🧊',
  'Electronics': '💻',
  'Heavy Equipment': '⚙️',
};

export default function AvailableShipmentsScreen({ navigation }) {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const { data } = await shipmentsAPI.list({ status: 'open' });
      setShipments((data.data || []).filter(s => s.status === 'open' || s.status === 'bidding'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShipments(); }, []);

  const filtered = shipments.filter(s =>
    (s.pickup_city || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.dropoff_city || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.load_type || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Available Loads</Text>
            <Text style={styles.subtitle}>{filtered.length} open near you</Text>
          </View>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by city or load type..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={search}
            onChangeText={setSearch}
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18, paddingHorizontal: 8 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      {loading && shipments.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.orange} size="large" />
          <Text style={styles.loadingText}>Finding loads near you...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchShipments} tintColor={Colors.orange} />}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <View style={styles.centered}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
              <Text style={styles.emptyTitle}>No loads found</Text>
              <Text style={styles.emptyMsg}>Pull down to refresh or adjust your search</Text>
            </View>
          ) : (
            filtered.map(s => {
              const icon = LOAD_TYPE_ICONS[s.load_type] || '📦';
              const bidCount = s.bid_count || 0;
              return (
                <View key={s.id} style={styles.card}>
                  {/* Route */}
                  <View style={styles.routeRow}>
                    <View style={styles.cityBlock}>
                      <Text style={styles.cityMeta}>FROM</Text>
                      <Text style={styles.cityName}>{s.pickup_city || 'TBD'}</Text>
                    </View>
                    <View style={styles.arrowBlock}>
                      <View style={styles.arrowLine} />
                      <Text style={styles.arrowTruck}>🚛</Text>
                      <View style={styles.arrowLine} />
                    </View>
                    <View style={[styles.cityBlock, { alignItems: 'flex-end' }]}>
                      <Text style={styles.cityMeta}>TO</Text>
                      <Text style={styles.cityName}>{s.dropoff_city || 'TBD'}</Text>
                    </View>
                  </View>

                  {/* Tags row */}
                  <View style={styles.tagsRow}>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{icon} {s.load_type}</Text>
                    </View>
                    {s.weight_tonnes && (
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>⚖️ {s.weight_tonnes}t</Text>
                      </View>
                    )}
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>📅 {new Date(s.created_at).toLocaleDateString('en-AE', { day: '2-digit', month: 'short' })}</Text>
                    </View>
                  </View>

                  {/* Budget + Bids */}
                  <View style={styles.cardFooter}>
                    <View>
                      {s.budget_max ? (
                        <>
                          <Text style={styles.budgetLabel}>MAX BUDGET</Text>
                          <Text style={styles.budgetAmount}>AED {Number(s.budget_max).toLocaleString()}</Text>
                        </>
                      ) : (
                        <Text style={styles.budgetAmount}>Open Budget</Text>
                      )}
                      <Text style={styles.bidsCount}>{bidCount} {bidCount === 1 ? 'bid' : 'bids'} submitted</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.bidBtn}
                      onPress={() => navigation.navigate('CarrierShipmentDetail', { id: s.id })}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.bidBtnText}>Make Offer →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0f1e' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
  },
  title: { fontSize: 22, fontWeight: '900', color: '#fff' },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(34,197,94,0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22c55e' },
  liveText: { fontSize: 10, color: '#22c55e', fontWeight: '800', letterSpacing: 1 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12, height: 46,
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: {
    flex: 1, color: '#fff', fontSize: 14,
    ...(typeof window !== 'undefined' ? { outlineStyle: 'none' } : {}),
  },

  scroll: { padding: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  loadingText: { color: 'rgba(255,255,255,0.4)', marginTop: 12, fontSize: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  emptyMsg: { fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginTop: 6 },

  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cityBlock: { flex: 1 },
  cityMeta: { fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: '700', letterSpacing: 1, marginBottom: 3 },
  cityName: { fontSize: 17, fontWeight: '900', color: '#fff' },
  arrowBlock: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6 },
  arrowLine: { width: 20, height: 2, backgroundColor: 'rgba(255,165,0,0.3)' },
  arrowTruck: { fontSize: 18, marginHorizontal: 2 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  tagText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },

  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  budgetLabel: { fontSize: 9, color: Colors.orange, fontWeight: '700', letterSpacing: 1 },
  budgetAmount: { fontSize: 20, fontWeight: '900', color: '#fff' },
  bidsCount: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 },

  bidBtn: {
    backgroundColor: Colors.orange, borderRadius: 12,
    paddingHorizontal: 18, paddingVertical: 12,
    shadowColor: Colors.orange, shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 6,
  },
  bidBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});
