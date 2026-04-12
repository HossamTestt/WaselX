import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, StatusBadge, EmptyState } from '../../components';
import { Colors, Typography, Spacing } from '../../theme';
import { shipmentsAPI, trackingAPI } from '../../services/api';

export default function ActiveJobScreen({ navigation }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // In a real app, you would use expo-location to track and push GPS coordinates
  // This is a placeholder for the MVP
  const pushLocationUpdate = async (shipmentId) => {
    try {
      await trackingAPI.pushLocation({
        shipment_id: shipmentId,
        lat: 25.2048 + (Math.random() * 0.01), // mock movement
        lng: 55.2708 + (Math.random() * 0.01),
      });
    } catch (e) {
      console.log('Location push failed (expected if tracking not set up)');
    }
  };

  const fetchActive = async () => {
    try {
      const { data } = await shipmentsAPI.list({ status: 'assigned' });
      const active = data.data.find(s => ['assigned', 'picked_up', 'in_transit'].includes(s.status));
      setJob(active || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchActive(); 
    // Start interval to push location if we have an active job
    const int = setInterval(() => {
      if (job) pushLocationUpdate(job.id);
    }, 15000);
    return () => clearInterval(int);
  }, [job?.id]);

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await shipmentsAPI.updateStatus(job.id, newStatus, `Driver updated status to ${newStatus}`);
      Alert.alert('Status Updated', `Shipment is now marked as ${newStatus.replace('_', ' ')}`);
      fetchActive();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return null;

  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState 
          icon="🚚" 
          title="No Active Job" 
          message="You are not assigned to any shipments right now." 
          action={<Button title="Find Loads" onPress={() => navigation.navigate('Available')} style={{ marginTop: 16 }} />}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Job</Text>
        <StatusBadge status={job.status} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.jobCard}>
          <Text style={{ ...Typography.h3, color: Colors.navy, marginBottom: Spacing.md }}>Route Details</Text>
          
          <View style={styles.routeContainer}>
            <View style={styles.routeLine} />
            <View style={styles.routeNode}>
              <Text style={{ fontSize: 20 }}>📍</Text>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.label}>PICKUP</Text>
                <Text style={styles.routeText}>{job.pickup_address}</Text>
                <Text style={{ color: Colors.textMuted, fontSize: 13 }}>{job.shipper_name} • {job.shipper_phone}</Text>
              </View>
            </View>
            <View style={[styles.routeNode, { marginTop: Spacing.xl }]}>
              <Text style={{ fontSize: 20 }}>🏁</Text>
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.label}>DROP-OFF</Text>
                <Text style={styles.routeText}>{job.dropoff_address}</Text>
              </View>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={{ ...Typography.h3, color: Colors.navy, marginBottom: Spacing.md }}>Status Updates</Text>
          
          {job.status === 'assigned' && (
            <Button 
              title="Mark as Picked Up" 
              onPress={() => handleUpdateStatus('picked_up')} 
              loading={updating} 
              style={styles.statusBtn} 
            />
          )}

          {job.status === 'picked_up' && (
            <Button 
              title="Start Transit" 
              onPress={() => handleUpdateStatus('in_transit')} 
              loading={updating} 
              style={styles.statusBtn} 
            />
          )}

          {job.status === 'in_transit' && (
            <Button 
              title="Mark as Delivered" 
              onPress={() => handleUpdateStatus('delivered')} 
              loading={updating} 
              variant="secondary"
              style={styles.statusBtn} 
            />
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { ...Typography.h3, color: Colors.navy },
  scroll: { padding: Spacing.md },
  
  jobCard: { paddingBottom: Spacing.lg },
  routeContainer: { position: 'relative', paddingLeft: 8 },
  routeLine: { position: 'absolute', left: 18, top: 28, bottom: 28, width: 2, backgroundColor: Colors.border },
  routeNode: { flexDirection: 'row', alignItems: 'flex-start' },
  routeText: { ...Typography.h4, color: Colors.text, marginTop: 2, marginBottom: 4 },
  label: { ...Typography.label, color: Colors.orange },
  
  statusBtn: { height: 56 },
});
