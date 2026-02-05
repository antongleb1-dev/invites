import admin from 'firebase-admin';

let firebaseAdmin: admin.app.App | null = null;

/**
 * Initialize Firebase Admin SDK
 * Uses service account key from environment variable
 */
export function getFirebaseAdmin(): admin.app.App {
  if (firebaseAdmin) {
    return firebaseAdmin;
  }

  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccountKey) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
    }

    // Parse the service account key JSON
    const serviceAccount = JSON.parse(serviceAccountKey);

    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId: serviceAccount.project_id,
    });

    console.log('[Firebase Admin] Initialized successfully');
    return firebaseAdmin;
  } catch (error) {
    console.error('[Firebase Admin] Failed to initialize:', error);
    throw error;
  }
}

/**
 * Verify Firebase ID token
 * @param idToken - Firebase ID token from client
 * @returns Decoded token with user info
 */
export async function verifyFirebaseToken(idToken: string) {
  try {
    const admin = getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('[Firebase Admin] Token verification failed:', error);
    throw new Error('Invalid Firebase token');
  }
}

/**
 * Get user by UID
 */
export async function getFirebaseUser(uid: string) {
  try {
    const admin = getFirebaseAdmin();
    const userRecord = await admin.auth().getUser(uid);
    return userRecord;
  } catch (error) {
    console.error('[Firebase Admin] Failed to get user:', error);
    return null;
  }
}

