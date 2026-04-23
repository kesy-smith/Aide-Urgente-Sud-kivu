import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { getInstallations, getId } from 'firebase/installations';
import { getAnalytics } from 'firebase/analytics';
import firebaseConfigLocal from '../../firebase-applet-config.json';

// 1. Extract variables with extreme cleaning and FORCE LOCAL ONLY
const cleanStrict = (val: any) => {
  if (typeof val !== 'string') return undefined;
  const cleaned = val.replace(/[^\x20-\x7E]/g, '').trim(); 
  if (cleaned === '' || cleaned === 'undefined' || cleaned === 'null' || cleaned === '[object Object]') return undefined;
  return cleaned;
};

const apiKey = cleanStrict(firebaseConfigLocal.apiKey);
const projectId = cleanStrict(firebaseConfigLocal.projectId);
const measurementId = cleanStrict(firebaseConfigLocal.measurementId);

const firebaseConfig = {
  apiKey,
  projectId,
  authDomain: cleanStrict(firebaseConfigLocal.authDomain),
  appId: cleanStrict(firebaseConfigLocal.appId),
  measurementId,
  storageBucket: cleanStrict(firebaseConfigLocal.storageBucket),
  messagingSenderId: cleanStrict(firebaseConfigLocal.messagingSenderId),
  databaseURL: cleanStrict(firebaseConfigLocal.databaseURL) // Ensure europe-west1 is routed correctly
};

// 2. Filter out null/undefined
const finalConfig = Object.fromEntries(
  Object.entries(firebaseConfig).filter(([_, v]) => v !== undefined)
);

// 3. Initialize App
const app = initializeApp(finalConfig);

if (import.meta.env.DEV) {
  console.log("%c[Firebase Debug] Initializing with:", "color: #9b59b6; font-weight: bold");
  console.log("Project ID:", projectId);
  console.log("Region Configured (via URL):", finalConfig.databaseURL ? 'europe-west1' : 'default');
}

// 4. Initialize Services - Standard initialization for maximum compatibility
export const db = initializeFirestore(app, {
  // We keep long polling as it is generally more stable in iframe/proxy environments
  experimentalForceLongPolling: true 
});

// Enable Offline Persistence for low-data/offline usage
if (typeof window !== 'undefined') {
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support all of the features required to enable persistence.');
    }
  });
}

// Root cause of many 'unavailable' errors is Installations API
const installations = getInstallations(app);
getId(installations).catch(err => {
  console.error("%c[Firebase Diagnostic] Installations API Failure", "color: #e67e22; font-weight: bold");
  console.error("Please enable 'Firebase Installations API' at: https://console.cloud.google.com/apis/library/firebaseinstallations.googleapis.com?project=" + projectId);
  console.dir(err);
});

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Safe Analytics Initialization (can be blocked in iframes)
export const analytics = (() => {
  if (typeof window !== 'undefined' && measurementId && finalConfig.appId) {
    try {
      return getAnalytics(app);
    } catch (e) {
      return null;
    }
  }
  return null;
})();

// Connection test
export const testConnection = async () => {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("%c[Firebase] Connection OK", "color: #2ecc71; font-weight: bold");
  } catch (e: any) {
    console.warn("[Firebase] Initial connection check:", e.code);
  }
};

export const getFirebaseState = async () => {
  const state = {
    installations: 'loading',
    firestore: 'loading',
    domain: window.location.hostname
  };

  try {
    const installations = getInstallations(app);
    await getId(installations);
    state.installations = 'ok';
  } catch (e: any) {
    state.installations = 'failed';
  }

  try {
    // Race between the network call and a 5-second timeout
    const fetchWithTimeout = Promise.race([
      getDocFromServer(doc(db, 'test', 'connection')),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    ]);
    
    await fetchWithTimeout;
    state.firestore = 'ok';
  } catch (e: any) {
    const msg = (e.message || '').toLowerCase();
    const code = (e.code || '').toLowerCase();
    
    // Check if the error is just because we are offline
    if (code === 'unavailable' || msg.includes('offline')) {
      state.firestore = 'offline';
    } else if (msg.includes('identitytoolkit') || code.includes('blocked') || msg.includes('getprojectconfig')) {
      state.firestore = 'api-blocked-identity';
    } else {
      state.firestore = code || 'failed';
    }
  }

  return state;
};

testConnection();

export const signIn = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    if (error.code === 'auth/unauthorized-domain') {
      console.error("%c[Firebase Auth Conflict]", "color: #e74c3c; font-weight: bold");
      console.error("The domain '" + window.location.hostname + "' is not authorized in Firebase Console.");
      console.error("Please add it to: Authentication -> Settings -> Authorized domains");
    }
    throw error;
  }
};
export const signOut = () => auth.signOut();
