import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Input, LoadingState } from '../../components';
import { Colors, Typography, Spacing } from '../../theme';
import useShipmentsStore from '../../store/shipmentsStore';
import { bidsAPI } from '../../services/api';

export default function CarrierShipmentDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { fetchShipment } = useShipmentsStore();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [bidForm, setBidForm] = useState({ price: '', estimated_hours: '', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [myBid, setMyBid] = useState(null);

  useEffect(() => {
    fetchShipment(id).then(data => {
      setShipment(data);
      // Check if carrier already bid
      bidsAPI.getMyBids().then((res) => {
        const existing = res.data.data.find(b => b.shipment_id === id);
        if (existing) setMyBid(existing);
      }).catch(console.error);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSubmitBid = async () => {
    if (!bidForm.price) {
      Alert.alert('Error', 'Please enter a bid price');
      return;
    }
    setSubmitting(true);
    try {
      await bidsAPI.submit({ 
        shipment_id: id, 
        price: parseFloat(bidForm.price),
        estimated_hours: bidForm.estimated_hours ? parseFloat(bidForm.estimated_hours) : null,
        note: bidForm.note
      });
      Alert.alert('Success', 'Bid submitted successfully');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to submit bid');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !shipment) return <LoadingState />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: Spacing.sm }}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Submit Bid</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.sectionTitle}>Load Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Route:</Text>
            <Text style={styles.val}>{shipment.pickup_city} → {shipment.dropoff_city}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Type:</Text>
            <Text style={styles.val}>{shipment.load_type}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Weight:</Text>
            <Text style={styles.val}>{shipment.weight_tonnes ? `${shipment.weight_tonnes} t` : 'N/A'}</Text>
          </View>
          {shipment.description && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.label}>Description:</Text>
              <Text style={{ color: Colors.text, marginTop: 4 }}>{shipment.description}</Text>
            </View>
          )}
        </Card>

        {myBid ? (
          <Card style={{ borderColor: Colors.blue, borderWidth: 2 }}>
            <Text style={styles.sectionTitle}>Your Submitted Bid</Text>
            <Text style={{ fontSize: 32, fontWeight: '800', color: Colors.blue, marginVertical: 8 }}>AED {myBid.price}</Text>
            <Text style={{ color: Colors.textMuted }}>Status: {myBid.status.toUpperCase()}</Text>
          </Card>
        ) : (
          <Card>
            <Text style={styles.sectionTitle}>Your Offer</Text>
            <Input 
              label="Bid Amount (AED)" 
              placeholder="e.g. 1500" 
              keyboardType="numeric"
              value={bidForm.price}
              onChangeText={t => setBidForm(f => ({...f, price: t}))}
            />
            <Input 
              label="Estimated Time (Hours)" 
              placeholder="e.g. 4" 
              keyboardType="numeric"
              value={bidForm.estimated_hours}
              onChangeText={t => setBidForm(f => ({...f, estimated_hours: t}))}
            />
            <Input 
              label="Note to Shipper (Optional)" 
              placeholder="I can pick this up immediately..." 
              value={bidForm.note}
              onChangeText={t => setBidForm(f => ({...f, note: t}))}
            />
            
            <View style={{ backgroundColor: Colors.orangeLight, padding: 12, borderRadius: 8, marginBottom: Spacing.md }}>
              <Text style={{ fontSize: 12, color: Colors.orange, fontWeight: '600' }}>
                Note: A platform commission will be deducted from this amount if accepted.
              </Text>
            </View>

            <Button title="Submit Bid" onPress={handleSubmitBid} loading={submitting} />
          </Card>
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
  
  sectionTitle: { ...Typography.h4, color: Colors.navy, marginBottom: Spacing.md },
  row: { flexDirection: 'row', marginBottom: 8 },
  label: { width: 80, color: Colors.textMuted, fontWeight: '600', fontSize: 13 },
  val: { flex: 1, color: Colors.text, fontWeight: '500' },
});
