/**
 * HistoryScreen — Premium Dark Theme
 * Filtered shipment history for shippers with trip cards
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBadge, EmptyState } from '../../components';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { shipmentsAPI } from '../../services/api';

export default function HistoryScreen({ navigation }) {
  const [shipments, setShipments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed

  const fetchHistory = async () => {
    try {
      const { data } = await shipmentsAPI.list({ limit: 50 });
      setShipments(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const filtered = shipments.filter(s => {
    if (filter === 'active') return ['open', 'bidding', 'assigned', 'picked_up', 'in_transit'].includes(s.status);
    if (filter === 'completed') return ['delivered', 'cancelled'].includes(s.status);
    return true;
  });

  return (
    <View style={styles.root}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Trip History</Text>
          <Text style={styles.headerSubtitle}>{filtered.length} shipments found</Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.tabs}>
          {['all', 'active', 'completed'].map(f => (
            <TouchableOpacity 
              key={f} 
              style={[styles.tab, filter === f && styles.activeTab]} 
              onPress={() => setFilter(f)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, filter === f && styles.activeTabText]}>{f.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator color={Colors.orange} size="large" />
          </View>
        ) : (
          <ScrollView 
            contentContainerStyle={styles.scroll}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.orange} />}
            showsVerticalScrollIndicator={false}
          >
            {filtered.length === 0 ? (
              <View style={{ marginTop: 60 }}>
                <EmptyState 
                  icon="📦" 
                  title="No Shipments" 
                  message={`You have no ${filter === 'all' ? '' : filter} shipments in your records.`} 
                />
              </View>
            ) : (
              filtered.map(s => (
                <TouchableOpacity 
                  key={s.id} 
                  onPress={() => navigation.navigate('ShipmentDetail', { id: s.id })}
                  activeOpacity={0.8}
                >
                  <View style={styles.card}>
                    <View style={styles.cardRow}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.routeRow}>
                          <Text style={styles.cityName}>{s.pickup_city || 'TBD'}</Text>
                          <Text style={styles.arrow}> → </Text>
                          <Text style={styles.cityName}>{s.dropoff_city || 'TBD'}</Text>
                        </View>
                        <Text style={styles.dateText}>
                          {new Date(s.created_at).toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </Text>
                      </View>
                      <StatusBadge status={s.status} />
                    </View>
                    
                    <View style={styles.cardFooter}>
                      <Text style={styles.loadText}>📦 {s.load_type} · {s.weight_tonnes ? `${s.weight_tonnes}t` : 'Weight TBD'}</Text>
                      {s.final_price && (
                        <Text style={styles.priceText}>AED {Number(s.final_price).toLocaleString()}</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
            <View style={{ height: 100 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0f1e' },
  header: { 
    paddingHorizontal: 20, paddingVertical: 16, 
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' 
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#fff' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },

  tabs: { 
    flexDirection: 'row', 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)'
  },
  tab: { 
    flex: 1, paddingVertical: 14, alignItems: 'center', 
    borderBottomWidth: 2, borderBottomColor: 'transparent' 
  },
  activeTab: { borderBottomColor: Colors.orange },
  tabText: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.3)', letterSpacing: 1 },
  activeTabText: { color: Colors.orange },

  scroll: { padding: 16 },
  
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  routeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  cityName: { fontSize: 15, fontWeight: '800', color: '#fff' },
  arrow: { fontSize: 14, color: Colors.orange, fontWeight: '900' },
  dateText: { fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: '600' },

  cardFooter: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' 
  },
  loadText: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  priceText: { fontSize: 15, fontWeight: '900', color: '#22c55e' },
});
