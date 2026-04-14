/**
 * CarrierShipmentDetailScreen — Premium Bid Submission
 * Dark-themed, full details, compelling UX for submitting offers
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Platform, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../theme';
import useShipmentsStore from '../../store/shipmentsStore';
import { bidsAPI } from '../../services/api';

const showAlert = (title, msg) => {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${msg}`);
  else Alert.alert(title, msg);
};

function InfoRow({ icon, label, value }) {
  return (
    <View style={inf.row}>
      <Text style={inf.icon}>{icon}</Text>
      <View style={inf.body}>
        <Text style={inf.label}>{label}</Text>
        <Text style={inf.value}>{value}</Text>
      </View>
    </View>
  );
}

export default function CarrierShipmentDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { fetchShipment } = useShipmentsStore();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidForm, setBidForm] = useState({ price: '', estimated_hours: '', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [myBid, setMyBid] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchShipment(id).then(data => {
      setShipment(data);
      bidsAPI.getMyBids().then((res) => {
        const existing = res.data.data.find(b => b.shipment_id === id);
        if (existing) setMyBid(existing);
      }).catch(console.error);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSubmitBid = async () => {
    setError('');
    if (!bidForm.price || isNaN(Number(bidForm.price))) {
      setError('Please enter a valid bid amount in AED.');
      return;
    }
    setSubmitting(true);
    try {
      await bidsAPI.submit({
        shipment_id: id,
        price: parseFloat(bidForm.price),
        estimated_hours: bidForm.estimated_hours ? parseFloat(bidForm.estimated_hours) : null,
        note: bidForm.note,
      });
      showAlert('Bid Submitted! 🎉', 'Your offer has been sent to the shipper. You will be notified when they respond.');
      navigation.goBack();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to submit bid. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0f1e', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.orange} size="large" />
        <Text style={{ color: 'rgba(255,255,255,0.4)', marginTop: 12 }}>Loading shipment...</Text>
      </View>
    );
  }

  if (!shipment) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0f1e', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#ef4444', fontSize: 16 }}>Could not load shipment.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: Colors.orange }}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const budget = shipment.budget_max ? `AED ${Number(shipment.budget_max).toLocaleString()}` : 'Open Budget';
  const bidStatusColors = {
    pending: { color: '#f59e0b', bg: '#2d1a00' },
    accepted: { color: '#22c55e', bg: '#052e16' },
    rejected: { color: '#ef4444', bg: '#2d0f0f' },
  };
  const bidColors = bidStatusColors[myBid?.status] || bidStatusColors.pending;

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Load Details</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Route Banner */}
          <View style={styles.routeBanner}>
            <View style={styles.cityBlock}>
              <Text style={styles.cityLabel}>PICKUP</Text>
              <Text style={styles.cityName}>{shipment.pickup_city || 'TBD'}</Text>
            </View>
            <View style={styles.routeArrow}>
              <View style={styles.routeLine} />
              <Text style={styles.routeTruck}>🚛</Text>
              <View style={styles.routeLine} />
            </View>
            <View style={[styles.cityBlock, { alignItems: 'flex-end' }]}>
              <Text style={styles.cityLabel}>DROP-OFF</Text>
              <Text style={styles.cityName}>{shipment.dropoff_city || 'TBD'}</Text>
            </View>
          </View>

          {/* Budget Highlight */}
          <View style={styles.budgetBanner}>
            <Text style={styles.budgetLabel}>Max Budget</Text>
            <Text style={styles.budgetAmount}>{budget}</Text>
            {shipment.budget_max && (
              <Text style={styles.budgetHint}>Submit your best offer at or below this amount</Text>
            )}
          </View>

          {/* Load Details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📦 Load Details</Text>
            <InfoRow icon="🏷️" label="Load Type" value={shipment.load_type || 'General Cargo'} />
            <InfoRow icon="⚖️" label="Weight" value={shipment.weight_tonnes ? `${shipment.weight_tonnes} tonnes` : 'Not specified'} />
            <InfoRow icon="📅" label="Posted" value={shipment.created_at ? new Date(shipment.created_at).toLocaleDateString() : 'Recently'} />
            {shipment.pickup_address && (
              <InfoRow icon="📍" label="Pickup Address" value={shipment.pickup_address} />
            )}
            {shipment.dropoff_address && (
              <InfoRow icon="🏠" label="Drop-off Address" value={shipment.dropoff_address} />
            )}
            {shipment.description && (
              <InfoRow icon="📝" label="Notes" value={shipment.description} />
            )}
          </View>

          {/* Bid Section */}
          {myBid ? (
            // Already bid
            <View style={styles.card}>
              <Text style={styles.cardTitle}>✅ Your Submitted Bid</Text>
              <View style={styles.myBidBox}>
                <Text style={styles.myBidAmount}>AED {Number(myBid.price).toLocaleString()}</Text>
                <View style={[styles.myBidStatus, { backgroundColor: bidColors.bg }]}>
                  <Text style={[styles.myBidStatusText, { color: bidColors.color }]}>
                    {myBid.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              {myBid.estimated_hours && (
                <Text style={styles.myBidMeta}>⏱️ Estimated time: {myBid.estimated_hours} hours</Text>
              )}
              {myBid.note && (
                <Text style={styles.myBidMeta}>💬 {myBid.note}</Text>
              )}
              {myBid.status === 'pending' && (
                <Text style={styles.waitNote}>Waiting for shipper to review your offer...</Text>
              )}
            </View>
          ) : (
            // Submit bid form
            <View style={styles.card}>
              <Text style={styles.cardTitle}>💰 Make an Offer</Text>

              <Text style={styles.fieldLabel}>Your Bid Amount (AED) *</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputPrefix}>AED</Text>
                <TextInput
                  style={styles.input}
                  value={bidForm.price}
                  onChangeText={t => setBidForm(f => ({ ...f, price: t }))}
                  placeholder="e.g. 1500"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  keyboardType="numeric"
                />
              </View>

              <Text style={styles.fieldLabel}>Estimated Delivery Time (Hours)</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputPrefix}>⏱️</Text>
                <TextInput
                  style={styles.input}
                  value={bidForm.estimated_hours}
                  onChangeText={t => setBidForm(f => ({ ...f, estimated_hours: t }))}
                  placeholder="e.g. 4"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  keyboardType="numeric"
                />
              </View>

              <Text style={styles.fieldLabel}>Message to Shipper (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bidForm.note}
                onChangeText={t => setBidForm(f => ({ ...f, note: t }))}
                placeholder="Tell the shipper why you're the best choice..."
                placeholderTextColor="rgba(255,255,255,0.2)"
                multiline
                numberOfLines={3}
              />

              {/* Commission Notice */}
              <View style={styles.commissionBadge}>
                <Text style={styles.commissionText}>
                  ℹ️  Platform commission of 5–10% applies upon successful job completion.
                </Text>
              </View>

              {!!error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                onPress={handleSubmitBid}
                disabled={submitting}
              >
                {submitting
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.submitBtnText}>🚀  Submit My Offer</Text>
                }
              </TouchableOpacity>
            </View>
          )}
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

  scroll: { padding: 16, paddingBottom: 100 },

  routeBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 20, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  cityBlock: { flex: 1 },
  cityLabel: { fontSize: 10, color: 'rgba(255,255,255,0.3)', fontWeight: '700', letterSpacing: 1 },
  cityName: { fontSize: 18, fontWeight: '900', color: '#fff', marginTop: 4 },
  routeArrow: { alignItems: 'center', paddingHorizontal: 8, gap: 4 },
  routeLine: { width: 28, height: 2, backgroundColor: 'rgba(255,165,0,0.4)' },
  routeTruck: { fontSize: 20 },

  budgetBanner: {
    backgroundColor: 'rgba(249,115,22,0.12)',
    borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(249,115,22,0.25)',
    alignItems: 'center',
  },
  budgetLabel: { fontSize: 11, color: Colors.orange, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  budgetAmount: { fontSize: 32, fontWeight: '900', color: '#fff', marginTop: 4 },
  budgetHint: { fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 },

  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 16 },

  myBidBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  myBidAmount: { fontSize: 30, fontWeight: '900', color: Colors.orange },
  myBidStatus: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  myBidStatusText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  myBidMeta: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6 },
  waitNote: { marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' },

  fieldLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.45)', marginBottom: 8, marginTop: 12 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)', marginBottom: 4,
    overflow: 'hidden',
  },
  inputPrefix: { paddingHorizontal: 14, fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: '700' },
  input: {
    flex: 1, height: 50, color: '#fff', fontSize: 16, fontWeight: '600',
    backgroundColor: 'transparent', paddingHorizontal: 4,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  textArea: {
    height: 90, textAlignVertical: 'top', padding: 14, marginBottom: 4,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    width: '100%',
  },

  commissionBadge: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderRadius: 10, padding: 12, marginTop: 12, marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)',
  },
  commissionText: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },

  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 10, padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
  },
  errorText: { color: '#ef4444', fontSize: 13, fontWeight: '600' },

  submitBtn: {
    height: 56, borderRadius: 14,
    backgroundColor: Colors.orange,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
    shadowColor: Colors.orange, shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 }, shadowRadius: 12, elevation: 8,
  },
  submitBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
});

const inf = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  icon: { fontSize: 16, marginRight: 12, marginTop: 2 },
  body: { flex: 1 },
  label: { fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: '700', letterSpacing: 0.5 },
  value: { fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: '500', marginTop: 2 },
});
