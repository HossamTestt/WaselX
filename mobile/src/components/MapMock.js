import React from 'react';
import { View, Text } from 'react-native';

const MapMock = (props) => (
  <View {...props} style={[{ backgroundColor: '#e0e0e0', alignItems: 'center', justifyContent: 'center' }, props.style]}>
    <Text>Map View (Not supported on Web)</Text>
  </View>
);

export const Marker = () => null;
export const Polyline = () => null;
export default MapMock;
