import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import { authAPI } from './api';

// Configure the notification handler for foreground notifications
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Register the device for push notifications and save the token to the backend
 */
export async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    // Get the FCM token
    token = (await Notifications.getDevicePushTokenAsync()).data;
    console.log('FCM Token:', token);

    // Save token to backend
    try {
      await authAPI.updateFcmToken(token);
      console.log('FCM Token saved to backend successfully.');
    } catch (error) {
      console.error('Error saving FCM Token to backend:', error.message);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

/**
 * Common notification handler for both listeners
 */
export function handleNotificationResponse(response) {
  const { type, shipmentId, bidId } = response.notification.request.content.data;
  
  console.log('Notification Response data:', { type, shipmentId, bidId });

  // Navigation logic will be handled in the component where the listener is attached
  return { type, shipmentId, bidId };
}
