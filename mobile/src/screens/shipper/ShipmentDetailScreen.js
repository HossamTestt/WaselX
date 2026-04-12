import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, StatusBadge, Button, LoadingState, EmptyState } from '../../components';
import { Colors, Typography, Spacing } from '../../theme';
import useShipmentsStore from '../../store/shipmentsStore';
import { bidsAPI } from '../../services/api';

export default function ShipmentDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { currentShipment: shipment, fetchShipment, loading } = useShipmentsStore();
  const [bids, setBids] = useState([]);
  const [loadingBids, setLoadingBids] = useState(true);

  useEffect(() => {
    fetchShipment(id);
    bidsAPI.getForShipment(id)
      .then(r => setBids(r.data.data))
      .catch(console.error)
      .finally(() => setLoadingBids(false));
  }, [id]);

  const handleAcceptBid = async (bidId) => {
    Alert.alert('Accept Bid', 'Are you sure you want to accept this bid and assign the carrier?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accept', onPress: async () => {
        try {
          await bidsAPI.accept(bidId);
          Alert.alert('Success', 'Carrier assigned successfully!');
          fetchShipment(id);
          const r = await bidsAPI.getForShipment(id);
          setBids(r.data.data);
        } catch (e) {
          Alert.alert('Error', e.response?.data?.message || 'Failed to accept bid');
        }
      }}
    ]);
  };

  if (loading || !shipment) return <LoadingState />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: Spacing.sm }}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Shipment Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={{ marginBottom: Spacing.md }}>
          <View style={styles.rowBetween}>
            <StatusBadge status={shipment.status} />
            <Text style={styles.date}>{new Date(shipment.created_at).toLocaleDateString()}</Text>
          </View>
          
          <View style={styles.routeContainer}>
            <View style={styles.routeLine} />
            <View style={styles.routeNode}>
              <Text style={{ fontSize: 16 }}>📍</Text>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.label}>PICKUP</Text>
                <Text style={styles.routeText}>{shipment.pickup_address}</Text>
              </View>
            </View>
            <View style={[styles.routeNode, { marginTop: Spacing.lg }]}>
              <Text style={{ fontSize: 16 }}>🏁</Text>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.label}>DROP-OFF</Text>
                <Text style={styles.routeText}>{shipment.dropoff_address}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.label}>LOAD TYPE</Text>
              <Text style={styles.val}>{shipment.load_type}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.label}>WEIGHT</Text>
              <Text style={styles.val}>{shipment.weight_tonnes ? `${shipment.weight_tonnes} t` : 'N/A'}</Text>
            </View>
          </View>

          {shipment.status === 'in_transit' && (
            <Button 
              title="Tracking Map" 
              icon={<Text>📍</Text>}
              onPress={() => navigation.navigate('Tracking', { id: shipment.id })}
              style={{ marginTop: Spacing.md }} 
            />
          )}
        </Card>

        <Text style={styles.sectionTitle}>
          {shipment.status === 'open' || shipment.status === 'bidding' ? 'Received Bids' : 'Assigned Carrier'}
        </Text>

        {loadingBids ? <LoadingState message="Loading bids..." /> : (
          bids.length === 0 ? (
            <EmptyState icon="💸" title="No Bids Yet" message="Waiting for carriers to submit bids on this shipment." />
          ) : (
            bids.map(b => (
              <Card key={b.id} style={b.status === 'accepted' ? { borderColor: Colors.success, borderWidth: 2 } : {}}>
                <View style={styles.rowBetween}>
                  <Text style={styles.carrierName}>{b.carrier_name}</Text>
                  <Text style={styles.price}>AED {parseFloat(b.price).toLocaleString()}</Text>
                </View>
                <View style={styles.rowBetween}>
                  <Text style={styles.carrierInfo}>⭐ {b.rating || 'New'} | {b.vehicle_type}</Text>
                  {b.status === 'pending' && (shipment.status === 'open' || shipment.status === 'bidding') && (
                    <Button title="Accept" variant="outline" onPress={() => handleAcceptBid(b.id)} style={{ paddingVertical: 6, minHeight: 0, marginTop: 8 }} />
                  )}
                  {b.status === 'accepted' && (
                    <Text style={{ color: Colors.success, fontWeight: '700', marginTop: 8 }}>✓ Accepted</Text>
                  )}
                </View>
              </Card>
            ))
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { ...Typography.h4, color: Colors.navy },
  scroll: { padding: Spacing.md },
  
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: 13, color: Colors.textMuted },
  
  routeContainer: { position: 'relative', paddingLeft: 8, marginVertical: Spacing.lg },
  routeLine: { position: 'absolute', left: 16, top: 24, bottom: 24, width: 2, backgroundColor: Colors.border },
  routeNode: { flexDirection: 'row', alignItems: 'flex-start' },
  routeText: { ...Typography.body, color: Colors.text, marginTop: 2 },
  label: { ...Typography.caption, color: Colors.textLight },

  detailsGrid: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.md },
  detailItem: { flex: 1 },
  val: { ...Typography.body, color: Colors.text, marginTop: 2, fontWeight: '600' },

  sectionTitle: { ...Typography.h4, color: Colors.navy, marginVertical: Spacing.md },

  carrierName: { ...Typography.h4, color: Colors.text },
  price: { ...Typography.h3, color: Colors.orange },
  carrierInfo: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
});
