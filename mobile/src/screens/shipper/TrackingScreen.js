import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { trackingAPI } from '../../services/api';
import useShipmentsStore from '../../store/shipmentsStore';
import { Colors, Typography, Spacing } from '../../theme';
import { LoadingState } from '../../components';

const { width, height } = Dimensions.get('window');

export default function TrackingScreen({ route, navigation }) {
  const { id } = route.params;
  const { currentShipment: shipment } = useShipmentsStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const res = await trackingAPI.getLog(id);
        setData(res.data.data);
      } catch (e) {
        console.error('Tracking fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTracking();
    const interval = setInterval(fetchTracking, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [id]);

  if (loading || !shipment) return <LoadingState message="Loading map..." />;

  const pLat = parseFloat(shipment.pickup_lat);
  const pLng = parseFloat(shipment.pickup_lng);
  const dLat = parseFloat(shipment.dropoff_lat);
  const dLng = parseFloat(shipment.dropoff_lng);
  
  const cLat = data?.currentLocation ? parseFloat(data.currentLocation.lat) : null;
  const cLng = data?.currentLocation ? parseFloat(data.currentLocation.lng) : null;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: Spacing.sm }}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Live Tracking</Text>
        <View style={{ width: 36 }} />
      </SafeAreaView>

      <MapView 
        style={styles.map}
        initialRegion={{
          latitude: pLat || 25.2048,
          longitude: pLng || 55.2708,
          latitudeDelta: 1.5,
          longitudeDelta: 1.5,
        }}
      >
        {pLat && pLng && <Marker coordinate={{ latitude: pLat, longitude: pLng }} title="Pickup" pinColor={Colors.blue} />}
        {dLat && dLng && <Marker coordinate={{ latitude: dLat, longitude: dLng }} title="Drop-off" pinColor={Colors.success} />}
        {cLat && cLng && <Marker coordinate={{ latitude: cLat, longitude: cLng }} title="Carrier" pinColor={Colors.orange} />}
        
        {pLat && dLat && (
          <Polyline 
            coordinates={[{ latitude: pLat, longitude: pLng }, { latitude: dLat, longitude: dLng }]} 
            strokeColor={Colors.navy} 
            strokeWidth={3} 
            lineDashPattern={[5, 5]}
          />
        )}
      </MapView>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Status: {shipment.status.replace('_', ' ').toUpperCase()}</Text>
        <Text style={styles.infoSub}>Last updated: {data?.currentLocation ? new Date(data.currentLocation.timestamp).toLocaleTimeString() : 'Unknown'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, zIndex: 1, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { ...Typography.h4, color: Colors.navy },
  map: { width, height: height - 100 },
  infoCard: { position: 'absolute', bottom: 40, left: 20, right: 20, backgroundColor: Colors.surface, padding: Spacing.lg, borderRadius: 16, elevation: 5, shadowColor: '#000', shadowOffset: { height: 4, width: 0 }, shadowOpacity: 0.1, shadowRadius: 10 },
  infoTitle: { ...Typography.h4, color: Colors.navy },
  infoSub: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 4 },
});
