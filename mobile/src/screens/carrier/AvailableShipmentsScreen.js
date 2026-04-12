import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, EmptyState, Input } from '../../components';
import { Colors, Typography, Spacing } from '../../theme';
import { shipmentsAPI } from '../../services/api';

export default function AvailableShipmentsScreen({ navigation }) {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const { data } = await shipmentsAPI.list({ status: 'open' }); // or 'bidding'
      // Carriers API handles returning open/bidding shipments
      setShipments(data.data.filter(s => s.status === 'open' || s.status === 'bidding'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShipments(); }, []);

  const filtered = shipments.filter(s => 
    (s.pickup_city||'').toLowerCase().includes(search.toLowerCase()) || 
    (s.dropoff_city||'').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Available Loads</Text>
      </View>

      <View style={{ paddingHorizontal: Spacing.md, paddingTop: Spacing.md }}>
        <Input 
          placeholder="Search by city..." 
          value={search} 
          onChangeText={setSearch} 
          style={{ marginBottom: 0 }}
        />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchShipments} />}
      >
        {filtered.length === 0 ? (
          <EmptyState icon="🔍" title="No loads found" message="There are no open shipments matching your search right now." />
        ) : (
          filtered.map(s => (
            <TouchableOpacity key={s.id} onPress={() => navigation.navigate('CarrierShipmentDetail', { id: s.id })}>
              <Card style={styles.card}>
                <View style={styles.routeHeader}>
                  <Text style={styles.city}>{s.pickup_city || 'Warehouse'}</Text>
                  <Text style={styles.arrow}>→</Text>
                  <Text style={styles.city}>{s.dropoff_city || 'Destination'}</Text>
                </View>
                
                <View style={styles.detailsRow}>
                  <Text style={styles.detail}>{s.load_type}</Text>
                  <Text style={styles.detail}>•</Text>
                  <Text style={styles.detail}>{s.weight_tonnes ? `${s.weight_tonnes} t` : 'Unknown Weight'}</Text>
                  <Text style={styles.detail}>•</Text>
                  <Text style={styles.detail}>{new Date(s.created_at).toLocaleDateString()}</Text>
                </View>

                {s.budget_max && (
                  <Text style={styles.budget}>Max Budget: AED {s.budget_max}</Text>
                )}
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
  scroll: { padding: Spacing.md },
  
  card: { padding: Spacing.lg },
  routeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  city: { ...Typography.h4, color: Colors.navy, flex: 1 },
  arrow: { color: Colors.orange, marginHorizontal: 8, fontWeight: '700' },
  
  detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detail: { fontSize: 13, color: Colors.textMuted },
  
  budget: { marginTop: 12, fontSize: 14, fontWeight: '700', color: Colors.success },
});
