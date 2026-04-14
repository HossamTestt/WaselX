/**
 * ShipmentDetailScreen (Shipper View) — Premium Dark Theme
 * Detailed shipment overview, status timeline, and competitive bid management
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, Alert, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../theme';
import useShipmentsStore from '../../store/shipmentsStore';
import { bidsAPI } from '../../services/api';

const showAlert = (title, msg) => {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${msg}`);
  else Alert.alert(title, msg);
};

const STATUS_FLOW = [
  { key: 'open',       label: 'Open',       icon: '🌐', color: '#3b82f6' },
  { key: 'bidding',    label: 'Bidding',    icon: '💸', color: '#f59e0b' },
  { key: 'assigned',   label: 'Assigned',   icon: '📋', color: '#8b5cf6' },
  { key: 'picked_up',  label: 'Picked Up',  icon: '📦', color: '#10b981' },
  { key: 'in_transit', label: 'In Transit', icon: '🚛', color: Colors.orange },
  { key: 'delivered',  label: 'Delivered',  icon: '✅', color: '#22c55e' },
];

function StatusStepper({ currentStatus }) {
  const activeIdx = STATUS_FLOW.findIndex(s => s.key === currentStatus);
  return (
    <View style={step.row}>
      {STATUS_FLOW.map((s, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx;
        const color = done ? '#22c55e' : active ? s.color : 'rgba(255,255,255,0.1)';
        return (
          <React.Fragment key={s.key}>
            <View style={step.item}>
              <View style={[step.dot, { backgroundColor: color, borderColor: active ? s.color + '50' : 'transparent', borderWidth: active ? 3 : 0 }]}>
                {done ? <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text> : <Text style={{ fontSize: 12 }}>{s.icon}</Text>}
              </View>
              <Text style={[step.label, (done || active) && { color: '#fff' }]}>{s.label}</Text>
            </View>
            {i < STATUS_FLOW.length - 1 && (
              <View style={[step.line, done && { backgroundColor: '#22c55e' }]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const step = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24, paddingHorizontal: 10 },
  item: { alignItems: 'center', width: 45 },
  dot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  label: { fontSize: 8, fontWeight: '700', color: 'rgba(255,255,255,0.3)', textAlign: 'center' },
  line: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 15 },
});

export default function ShipmentDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { currentShipment: shipment, fetchShipment, loading } = useShipmentsStore();
  const [bids, setBids] = useState([]);
  const [loadingBids, setLoadingBids] = useState(true);
  const [actingBid, setActingBid] = useState(null);

  useEffect(() => {
    fetchShipment(id);
    bidsAPI.getForShipment(id)
      .then(r => setBids(r.data.data))
      .catch(console.error)
      .finally(() => setLoadingBids(false));
  }, [id]);

  const handleAcceptBid = async (bidId) => {
    const confirm = Platform.OS === 'web' 
      ? window.confirm('Are you sure you want to accept this bid and assign this carrier?')
      : true; // native uses the alert options

    if (confirm) {
      setActingBid(bidId);
      try {
        await bidsAPI.accept(bidId);
        showAlert('Success 🎉', 'Carrier assigned successfully!');
        fetchShipment(id);
        const r = await bidsAPI.getForShipment(id);
        setBids(r.data.data);
      } catch (e) {
        showAlert('Error', e.response?.data?.message || 'Failed to accept bid');
      } finally {
        setActingBid(null);
      }
    }
  };

  if (loading || !shipment) {
    return (
      <View style={styles.root}>
        <ActivityIndicator color={Colors.orange} size="large" style={{ marginTop: 100 }} />
      </View>
    );
  }

  const hasAssigned = ['assigned', 'picked_up', 'in_transit', 'delivered'].includes(shipment.status);
  const acceptedBid = bids.find(b => b.status === 'accepted');

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shipment Details</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Status Stepper */}
          <StatusStepper currentStatus={shipment.status} />

          {/* Route Info */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>📍 Route Details</Text>
              <Text style={styles.dateText}>{new Date(shipment.created_at).toLocaleDateString()}</Text>
            </View>

            <View style={styles.routeBox}>
              <View style={styles.timeline}>
                <View style={[styles.dot, { backgroundColor: '#22c55e' }]} />
                <View style={styles.dash} />
                <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.stop}>
                  <Text style={styles.stopLabel}>COLLECTION</Text>
                  <Text style={styles.stopAddress}>{shipment.pickup_address}</Text>
                  <Text style={styles.stopCity}>{shipment.pickup_city}</Text>
                </View>
                <View style={styles.stop}>
                  <Text style={styles.stopLabel}>DELIVERY</Text>
                  <Text style={styles.stopAddress}>{shipment.dropoff_address}</Text>
                  <Text style={styles.stopCity}>{shipment.dropoff_city}</Text>
                </View>
              </View>
            </View>

            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Load Type</Text>
                <Text style={styles.gridVal}>{shipment.load_type}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Weight</Text>
                <Text style={styles.gridVal}>{shipment.weight_tonnes ? `${shipment.weight_tonnes} t` : '—'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Max Budget</Text>
                <Text style={[styles.gridVal, { color: Colors.orange }]}>AED {Number(shipment.budget_max || 0).toLocaleString()}</Text>
              </View>
            </View>

            {shipment.status === 'in_transit' && (
              <TouchableOpacity 
                style={styles.trackBtn}
                onPress={() => navigation.navigate('Tracking', { id: shipment.id })}
              >
                <Text style={styles.trackBtnText}>📍 Live Tracking</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Bids / Assigned Carrier Section */}
          <Text style={styles.sectionTitle}>
            {hasAssigned ? '🤝 Assigned Carrier' : `💰 Received Bids (${bids.length})`}
          </Text>

          {loadingBids ? (
            <ActivityIndicator color={Colors.orange} style={{ marginVertical: 40 }} />
          ) : bids.length === 0 ? (
            <View style={styles.emptyBids}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>💸</Text>
              <Text style={styles.emptyTitle}>No bids yet</Text>
              <Text style={styles.emptyMsg}>We've notified certified carriers near your pickup location. Bids will appear here as they come in.</Text>
            </View>
          ) : (
            bids.map(b => {
              const assigned = b.status === 'accepted';
              if (hasAssigned && !assigned) return null;

              return (
                <View key={b.id} style={[styles.bidCard, assigned && styles.bidCardAssigned]}>
                  <View style={styles.bidHeader}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{b.carrier_name?.[0] || 'D'}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.carrierName}>{b.carrier_name}</Text>
                      <Text style={styles.carrierMeta}>⭐ {b.rating || '5.0'} · {b.vehicle_type || 'Truck'}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.bidPrice}>AED {parseFloat(b.price).toLocaleString()}</Text>
                      {b.estimated_hours && <Text style={styles.estimate}>⏱️ {b.estimated_hours}h</Text>}
                    </View>
                  </View>

                  {!!b.note && (
                    <View style={styles.bidNote}>
                      <Text style={styles.bidNoteText}>💬 "{b.note}"</Text>
                    </View>
                  )}

                  {!hasAssigned && (
                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={() => handleAcceptBid(b.id)}
                      disabled={actingBid !== null}
                    >
                      {actingBid === b.id ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.acceptBtnText}>Accept Bid & Assign</Text>
                      )}
                    </TouchableOpacity>
                  )}

                  {assigned && (
                    <View style={styles.assignedLabel}>
                      <Text style={styles.assignedLabelText}>✓ CARRIER ASSIGNED</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0f1e' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  backBtn: { padding: 4 },
  backText: { color: Colors.orange, fontSize: 14, fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },

  scroll: { padding: 16 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 16, marginBottom: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  cardTitle: { fontSize: 13, fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.5 },
  dateText: { fontSize: 12, color: 'rgba(255,255,255,0.2)' },

  routeBox: { flexDirection: 'row', marginBottom: 24 },
  timeline: { alignItems: 'center', marginRight: 14, paddingTop: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dash: { width: 2, height: 40, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 },
  stop: { marginBottom: 16 },
  stopLabel: { fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: '800', letterSpacing: 1, marginBottom: 3 },
  stopAddress: { fontSize: 15, color: '#fff', fontWeight: '700' },
  stopCity: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },

  grid: { flexDirection: 'row', gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  gridItem: { flex: 1 },
  gridLabel: { fontSize: 9, color: 'rgba(255,255,255,0.3)', fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  gridVal: { fontSize: 14, color: '#fff', fontWeight: '700' },

  trackBtn: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 20,
    borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)',
  },
  trackBtnText: { color: '#3b82f6', fontWeight: '800', fontSize: 14 },

  sectionTitle: { fontSize: 17, fontWeight: '900', color: '#fff', marginBottom: 16 },

  emptyBids: { alignItems: 'center', paddingVertical: 40, opacity: 0.8 },
  emptyTitle: { fontSize: 18, color: '#fff', fontWeight: '800', marginBottom: 8 },
  emptyMsg: { fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', paddingHorizontal: 30, lineHeight: 20 },

  bidCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  bidCardAssigned: { borderColor: '#22c55e', borderWidth: 1.5, backgroundColor: 'rgba(34,197,94,0.04)' },
  bidHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.orange, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  carrierName: { fontSize: 15, fontWeight: '800', color: '#fff' },
  carrierMeta: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  bidPrice: { fontSize: 18, fontWeight: '900', color: '#fff' },
  estimate: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },

  bidNote: { backgroundColor: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 10, marginBottom: 16 },
  bidNoteText: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' },

  acceptBtn: {
    backgroundColor: Colors.orange, borderRadius: 12, paddingVertical: 12, alignItems: 'center',
    shadowColor: Colors.orange, shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 6,
  },
  acceptBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  assignedLabel: { alignItems: 'center', paddingTop: 8 },
  assignedLabelText: { color: '#22c55e', fontWeight: '900', fontSize: 12, letterSpacing: 0.5 },
});
