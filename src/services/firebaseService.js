// Firebase service for Election Camp Management System
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    onSnapshot,
    collection,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase.js';

const COLLECTION_NAME = 'election-camp-data';
const DOCUMENT_ID = 'regions-data';

// Simple cache to avoid redundant Firebase calls
let firebaseCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 30000; // 30 seconds

// Load initial data from local regions.json file
async function loadInitialRegionsData() {
    try {
        const response = await fetch('/regions.json');
        if (!response.ok) {
            throw new Error('Failed to fetch initial data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading initial data:', error);
        return [];
    }
}

// Initialize Firebase with local data if empty
export async function initializeFirebaseData() {
    try {
        const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            // No data in Firebase, load initial data and save it
            console.log('Initializing Firebase with local data...');
            const initialData = await loadInitialRegionsData();

            await setDoc(docRef, {
                regions: initialData,
                lastUpdated: serverTimestamp(),
                version: '1.0'
            });

            console.log('Firebase initialized with initial data');
            return initialData;
        } else {
            // Data exists in Firebase
            const data = docSnap.data();
            console.log('Firebase data loaded successfully');
            return data.regions || [];
        }
    } catch (error) {
        console.error('Error initializing Firebase data:', error);

        // Fallback to local data if Firebase fails
        console.log('Falling back to local data...');
        return await loadInitialRegionsData();
    }
}

// Load data from Firebase (OPTIMIZED with caching)
export async function loadFirebaseData() {
    try {
        // Check cache first
        if (firebaseCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
            console.log('Returning cached Firebase data');
            return firebaseCache;
        }

        const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);

        // Set a timeout to prevent long waits
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Firebase timeout')), 3000)
        );

        const dataPromise = getDoc(docRef);

        // Race between data loading and timeout
        const docSnap = await Promise.race([dataPromise, timeoutPromise]);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const regions = data.regions || [];

            // Update cache
            firebaseCache = regions;
            cacheTimestamp = Date.now();

            console.log('Firebase data loaded and cached successfully');
            return regions;
        } else {
            // Document doesn't exist, initialize with local data (background)
            console.log('No Firebase document found, initializing...');
            return await initializeFirebaseDataFast();
        }
    } catch (error) {
        if (error.message === 'Firebase timeout') {
            console.log('Firebase loading timed out, using fallback');
        } else {
            console.error('Error loading Firebase data:', error);
        }

        // Quick fallback to local data
        return await loadInitialRegionsData();
    }
}

// Fast initialization that doesn't block the UI
async function initializeFirebaseDataFast() {
    try {
        const initialData = await loadInitialRegionsData();

        // Initialize Firebase in background (don't await)
        const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
        setDoc(docRef, {
            regions: initialData,
            lastUpdated: serverTimestamp(),
            version: '1.0'
        }).then(() => {
            console.log('Firebase initialized in background');
        }).catch(error => {
            console.error('Background Firebase initialization failed:', error);
        });

        // Return data immediately
        return initialData;
    } catch (error) {
        console.error('Error in fast initialization:', error);
        return [];
    }
}

// Save data to Firebase (OPTIMIZED with cache invalidation)
export async function saveFirebaseData(regionsData) {
    try {
        const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);

        await updateDoc(docRef, {
            regions: regionsData,
            lastUpdated: serverTimestamp(),
        });

        // Invalidate cache after successful save
        firebaseCache = regionsData;
        cacheTimestamp = Date.now();

        console.log('Data saved to Firebase successfully and cache updated');
        return true;
    } catch (error) {
        // If document doesn't exist, create it
        if (error.code === 'not-found') {
            try {
                await setDoc(docRef, {
                    regions: regionsData,
                    lastUpdated: serverTimestamp(),
                    version: '1.0'
                });

                // Update cache after successful creation
                firebaseCache = regionsData;
                cacheTimestamp = Date.now();

                console.log('New Firebase document created and data saved');
                return true;
            } catch (createError) {
                console.error('Error creating Firebase document:', createError);
                return false;
            }
        }

        console.error('Error saving to Firebase:', error);
        return false;
    }
}

// Subscribe to real-time updates
export function subscribeToFirebaseData(callback) {
    const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('Real-time update received from Firebase');
            callback(data.regions || []);
        } else {
            console.log('No Firebase document found');
            // Initialize data if document doesn't exist
            initializeFirebaseData().then(initialData => {
                callback(initialData);
            });
        }
    }, (error) => {
        console.error('Error in Firebase subscription:', error);
        // Fallback to loading local data
        loadInitialRegionsData().then(fallbackData => {
            callback(fallbackData);
        });
    });

    return unsubscribe;
}

// Reset Firebase data to initial state
export async function resetFirebaseData() {
    try {
        const initialData = await loadInitialRegionsData();
        const success = await saveFirebaseData(initialData);

        if (success) {
            console.log('Firebase data reset to initial state');
            return initialData;
        } else {
            throw new Error('Failed to save reset data');
        }
    } catch (error) {
        console.error('Error resetting Firebase data:', error);
        return await loadInitialRegionsData();
    }
}

// Clear Firebase data
export async function clearFirebaseData() {
    try {
        const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);

        await updateDoc(docRef, {
            regions: [],
            lastUpdated: serverTimestamp(),
        });

        console.log('Firebase data cleared successfully');
        return true;
    } catch (error) {
        console.error('Error clearing Firebase data:', error);
        return false;
    }
}

// Check Firebase connection status
export async function checkFirebaseConnection() {
    try {
        const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
        await getDoc(docRef);
        return true;
    } catch (error) {
        console.error('Firebase connection check failed:', error);
        return false;
    }
}