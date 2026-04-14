/**
 * Notification Service
 * Handles sending push notifications via Firebase Cloud Messaging (FCM)
 */
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

// Path to the Firebase Service Account Key
const SERVICE_ACCOUNT_PATH = path.join(__dirname, '../../firebase-service-account.json');

let initialized = false;

try {
  if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    const serviceAccount = require(SERVICE_ACCOUNT_PATH);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
    console.log('✅ Firebase Admin SDK initialized successfully.');
  } else {
    console.warn('⚠️  firebase-service-account.json not found. Push notifications will be logged to console only.');
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
}

/**
 * Send a push notification to a specific user
 * @param {string} userId - ID of the user to notify
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional data payload
 */
async function sendPushNotification(userId, title, body, data = {}) {
  try {
    // 1. Fetch user's FCM token from DB
    const [user] = await sequelize.query(
      'SELECT fcm_token FROM users WHERE id = :userId',
      { replacements: { userId }, type: QueryTypes.SELECT }
    );

    if (!user || !user.fcm_token) {
      console.log(`ℹ️  No FCM token found for user ${userId}. Skipping push.`);
      return;
    }

    const message = {
      notification: { title, body },
      data: {
        ...data,
        click_action: 'FLUTTER_NOTIFICATION_CLICK', // Common for cross-platform
      },
      token: user.fcm_token,
    };

    if (initialized) {
      const response = await admin.messaging().send(message);
      console.log(`🚀 Push notification sent to user ${userId}:`, response);
    } else {
      console.log('📝 [MOCK PUSH] to User:', userId);
      console.log('   Title:', title);
      console.log('   Body:', body);
      console.log('   Data:', JSON.stringify(data));
    }
  } catch (error) {
    console.error(`❌ Failed to send push to user ${userId}:`, error.message);
  }
}

module.exports = {
  sendPushNotification,
};
