/**
 * ActiveJobScreen — Premium dark-themed with visual route,
 * status stepper, and prominent action buttons
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius } from '../../theme';
import { shipmentsAPI, trackingAPI } from '../../services/api';

const showAlert = (title, msg) => {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${msg}`);
  else Alert.alert(title, msg);
};

const STATUS_FLOW = [
  { key: 'assigned',   label: 'Assigned',   icon: '📋', color: '#3b82f6' },
  { key: 'picked_up',  label: 'Picked Up',  icon: '📦', color: '#f59e0b' },
  { key: 'in_transit', label: 'In Transit', icon: '🚛', color: Colors.orange },
  { key: 'delivered',  label: 'Delivered',  icon: '✅', color: '#22c55e' },
];

function StatusStepper({ currentStatus }) {
  const idx = STATUS_FLOW.findIndex(s => s.key === currentStatus);
  return (
    <View style={step.row}>
      {STATUS_FLOW.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        const dotColor = done ? '#22c55e' : active ? s.color : 'rgba(255,255,255,0.12)';
        return (
          <React.Fragment key={s.key}>
            <View style={step.stepWrap}>
              <View style={[step.dot, { backgroundColor: dotColor, borderColor: active ? s.color + '50' : 'transparent', borderWidth: active ? 3 : 0 }]}>
                <Text style={{ fontSize: done || active ? 12 : 10 }}>{done ? '✓' : s.icon}</Text>
              </View>
              <Text style={[step.label, (done || active) && { color: '#fff' }]}>{s.label}</Text>
            </View>
            {i < STATUS_FLOW.length - 1 && (
              <View style={[step.connector, done && { backgroundColor: '#22c55e' }]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const step = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24 },
  stepWrap: { alignItems: 'center', width: 55 },
  dot: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  label: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.3)', textAlign: 'center' },
  connector: { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.08)', marginTop: 17 },
});

export default function ActiveJobScreen({ navigation }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const pushLocationUpdate = async (shipmentId) => {
    try {
      await trackingAPI.pushLocation({
        shipment_id: shipmentId,
        lat: 25.2048 + (Math.random() * 0.01),
        lng: 55.2708 + (Math.random() * 0.01),
      });
    } catch (e) {
      console.log('Location push failed (expected if tracking not set up)');
    }
  };

  const fetchActive = async () => {
    try {
      const { data } = await shipmentsAPI.list({ status: 'assigned' });
      const active = (data.data || []).find(s => ['assigned', 'picked_up', 'in_transit'].includes(s.status));
      setJob(active || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActive();
    const int = setInterval(() => {
      if (job) pushLocationUpdate(job.id);
    }, 15000);
    return () => clearInterval(int);
  }, [job?.id]);

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await shipmentsAPI.updateStatus(job.id, newStatus, `Driver updated status to ${newStatus}`);
      showAlert('Status Updated ✅', `Shipment is now marked as "${newStatus.replace('_', ' ')}".`);
      fetchActive();
    } catch (e) {
      showAlert('Error', e.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.root}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={Colors.orange} size="large" />
          <Text style={{ color: 'rgba(255,255,255,0.4)', marginTop: 12 }}>Loading active job...</Text>
        </View>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} edges={['top']}>
          <Text style={{ fontSize: 56, marginBottom: 16 }}>🚚</Text>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 8 }}>No Active Job</Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 24, paddingHorizontal: 40 }}>
            You are not assigned to any shipments right now.
          </Text>
          <TouchableOpacity
            style={styles.findBtn}
            onPress={() => navigation.navigate('Available')}
          >
            <Text style={styles.findBtnText}>🔍  Find Loads</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  const nextAction = {
    assigned:   { label: '📦  Mark as Picked Up',  status: 'picked_up',  color: '#f59e0b' },
    picked_up:  { label: '🚛  Start Transit',       status: 'in_transit', color: Colors.orange },
    in_transit: { label: '✅  Mark as Delivered',   status: 'delivered',  color: '#22c55e' },
  }[job.status];

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Active Job</Text>
          <View style={[styles.statusPill, { backgroundColor: (STATUS_FLOW.find(s => s.key === job.status)?.color || Colors.orange) + '22' }]}>
            <Text style={[styles.statusPillText, { color: STATUS_FLOW.find(s => s.key === job.status)?.color || Colors.orange }]}>
              {STATUS_FLOW.find(s => s.key === job.status)?.label || job.status}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status Stepper */}
        <StatusStepper currentStatus={job.status} />

        {/* Route Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Route Details</Text>

          <View style={styles.routeWrap}>
            <View style={styles.routeTimeline}>
              <View style={[styles.routeDot, { backgroundColor: '#22c55e' }]} />
              <View style={styles.routeDash} />
              <View style={[styles.routeDot, { backgroundColor: '#ef4444' }]} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.routeStop}>
                <Text style={styles.routeLabel}>PICKUP</Text>
                <Text style={styles.routeAddress}>{job.pickup_address || job.pickup_city || 'TBD'}</Text>
                {job.shipper_name && <Text style={styles.routeContact}>{job.shipper_name} • {job.shipper_phone}</Text>}
              </View>
              <View style={styles.routeStop}>
                <Text style={styles.routeLabel}>DROP-OFF</Text>
                <Text style={styles.routeAddress}>{job.dropoff_address || job.dropoff_city || 'TBD'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Job Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Job Info</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Load Type</Text>
              <Text style={styles.infoValue}>{job.load_type || 'General'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Weight</Text>
              <Text style={styles.infoValue}>{job.weight_tonnes ? `${job.weight_tonnes}t` : '—'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Payout</Text>
              <Text style={[styles.infoValue, { color: '#22c55e' }]}>AED {Number(job.final_price || 0).toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        {nextAction && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: nextAction.color }, updating && { opacity: 0.6 }]}
            onPress={() => handleUpdateStatus(nextAction.status)}
            disabled={updating}
            activeOpacity={0.85}
          >
            {updating
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.actionBtnText}>{nextAction.label}</Text>
            }
          </TouchableOpacity>
        )}

        {job.status === 'delivered' && (
          <View style={styles.deliveredBanner}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>🎉</Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#22c55e' }}>Job Complete!</Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Great work, payment is being processed.</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
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
  title: { fontSize: 20, fontWeight: '900', color: '#fff' },
  statusPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statusPillText: { fontSize: 12, fontWeight: '800' },

  scroll: { padding: 16 },

  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 16 },

  routeWrap: { flexDirection: 'row' },
  routeTimeline: { alignItems: 'center', marginRight: 14, paddingTop: 4 },
  routeDot: { width: 12, height: 12, borderRadius: 6 },
  routeDash: { width: 2, height: 40, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 4 },
  routeStop: { marginBottom: 20 },
  routeLabel: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '700', letterSpacing: 1, marginBottom: 3 },
  routeAddress: { fontSize: 15, fontWeight: '700', color: '#fff' },
  routeContact: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 },

  infoRow: { flexDirection: 'row', gap: 12 },
  infoItem: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12, padding: 12, alignItems: 'center',
  },
  infoLabel: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '700', letterSpacing: 0.5, marginBottom: 6 },
  infoValue: { fontSize: 15, fontWeight: '800', color: '#fff' },

  actionBtn: {
    height: 58, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 8, marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 }, shadowRadius: 16, elevation: 10,
  },
  actionBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },

  findBtn: {
    backgroundColor: Colors.orange, borderRadius: 14,
    paddingHorizontal: 28, paddingVertical: 14,
    shadowColor: Colors.orange, shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 8,
  },
  findBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  deliveredBanner: { alignItems: 'center', paddingVertical: 24 },
});
