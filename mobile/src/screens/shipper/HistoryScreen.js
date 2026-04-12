import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, StatusBadge, EmptyState } from '../../components';
import { Colors, Typography, Spacing } from '../../theme';
import { shipmentsAPI } from '../../services/api';

export default function HistoryScreen({ navigation }) {
  const [shipments, setShipments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, completed

  const fetchHistory = async () => {
    try {
      const { data } = await shipmentsAPI.list({ limit: 50 });
      setShipments(data.data);
    } catch (e) {
      console.error(e);
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Shipment History</Text>
      </View>

      <View style={styles.tabs}>
        {['all', 'active', 'completed'].map(f => (
          <TouchableOpacity key={f} style={[styles.tab, filter === f && styles.activeTab]} onPress={() => setFilter(f)}>
            <Text style={[styles.tabText, filter === f && styles.activeTabText]}>{f.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filtered.length === 0 ? (
          <EmptyState icon="📋" title="No Shipments" message={`You have no ${filter === 'all' ? '' : filter} shipments.`} />
        ) : (
          filtered.map(s => (
            <TouchableOpacity key={s.id} onPress={() => navigation.navigate('ShipmentDetail', { id: s.id })}>
              <Card style={{ marginBottom: Spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontWeight: '700', color: Colors.navy, flex: 1 }} numberOfLines={1}>
                    {s.pickup_city || s.pickup_address} → {s.dropoff_city || s.dropoff_address}
                  </Text>
                  <StatusBadge status={s.status} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: Colors.textMuted }}>{new Date(s.created_at).toLocaleDateString()}</Text>
                  {s.final_price && <Text style={{ fontWeight: '700', color: Colors.success }}>AED {s.final_price}</Text>}
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { ...Typography.h3, color: Colors.navy },
  tabs: { flexDirection: 'row', backgroundColor: Colors.surface, paddingHorizontal: Spacing.md },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: Colors.blue },
  tabText: { ...Typography.caption, color: Colors.textMuted },
  activeTabText: { color: Colors.blue, fontWeight: '700' },
  scroll: { padding: Spacing.md },
});
