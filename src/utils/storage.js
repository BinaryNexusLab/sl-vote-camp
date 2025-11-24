// Storage wrapper for election camp data - now using Firebase!
import {
    loadFirebaseData,
    saveFirebaseData,
    subscribeToFirebaseData,
    resetFirebaseData,
    clearFirebaseData,
    initializeFirebaseData,
    checkFirebaseConnection
} from '../services/firebaseService.js';

const STORAGE_KEY = 'election-camp-data';
const INITIAL_DATA_URL = '/regions.json';

// Load initial data from regions.json (fallback)
export async function loadInitialData() {
    try {
        const response = await fetch(INITIAL_DATA_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch initial data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading initial data:', error);
        return [];
    }
}

// Load data from Firebase with localStorage fallback (OPTIMIZED)
export async function loadData() {
    try {
        // First, immediately load from localStorage if available for instant UI
        const localData = loadFromLocalStorageSync();

        // If we have local data, return it immediately while Firebase loads in background
        if (localData && localData.length > 0) {
            console.log('Instantly loaded data from localStorage cache');

            // Start Firebase sync in background (don't await)
            loadFirebaseData().then(firebaseData => {
                if (firebaseData && firebaseData.length > 0) {
                    // Update localStorage with latest Firebase data
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(firebaseData));
                    console.log('Background sync: localStorage updated with Firebase data');
                }
            }).catch(error => {
                console.log('Background sync failed, keeping localStorage data:', error.message);
            });

            return localData;
        }

        // No local data available, must wait for Firebase
        console.log('No local cache, loading from Firebase...');
        const firebaseData = await loadFirebaseData();

        // Cache the Firebase data locally
        if (firebaseData && firebaseData.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(firebaseData));
        }

        return firebaseData;

    } catch (error) {
        console.error('Error loading data, using fallback:', error);
        return await loadDataFromLocalStorage();
    }
}

// Synchronous localStorage read for instant loading
function loadFromLocalStorageSync() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error('Error reading localStorage:', error);
        return null;
    }
}

// Fallback: Load data from localStorage
async function loadDataFromLocalStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            console.log('Data loaded from localStorage');
            return JSON.parse(stored);
        }

        // If no stored data, load initial data and save to localStorage
        const initialData = await loadInitialData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
        console.log('Initial data loaded and saved to localStorage');
        return initialData;
    } catch (error) {
        console.error('Error loading data from localStorage:', error);
        return await loadInitialData();
    }
}

// Save data to Firebase with localStorage backup
export async function saveData(data) {
    try {
        // Always save to localStorage as backup
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

        // Try to save to Firebase
        const isFirebaseConnected = await checkFirebaseConnection();

        if (isFirebaseConnected) {
            const firebaseSuccess = await saveFirebaseData(data);
            if (firebaseSuccess) {
                console.log('Data saved to both Firebase and localStorage');
                return true;
            } else {
                console.log('Firebase save failed, but localStorage backup successful');
                return true;
            }
        } else {
            console.log('Firebase unavailable, data saved to localStorage only');
            return true;
        }
    } catch (error) {
        console.error('Error saving data:', error);
        return false;
    }
}

// Subscribe to real-time Firebase updates
export function subscribeToData(callback) {
    try {
        console.log('Setting up real-time data subscription...');
        return subscribeToFirebaseData(callback);
    } catch (error) {
        console.error('Error setting up Firebase subscription:', error);
        // Fallback: load data once and call callback
        loadData().then(data => callback(data));
        return () => { }; // Return empty unsubscribe function
    }
}

// Reset data to initial state
export async function resetToInitial() {
    try {
        const isFirebaseConnected = await checkFirebaseConnection();

        if (isFirebaseConnected) {
            console.log('Resetting Firebase data to initial state...');
            return await resetFirebaseData();
        } else {
            console.log('Firebase unavailable, resetting localStorage...');
            const initialData = await loadInitialData();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
            return initialData;
        }
    } catch (error) {
        console.error('Error resetting data:', error);
        const initialData = await loadInitialData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
        return initialData;
    }
}

// Clear all data
export async function clearData() {
    try {
        // Clear localStorage
        localStorage.removeItem(STORAGE_KEY);

        // Clear Firebase
        const isFirebaseConnected = await checkFirebaseConnection();

        if (isFirebaseConnected) {
            await clearFirebaseData();
            console.log('Data cleared from both Firebase and localStorage');
        } else {
            console.log('Firebase unavailable, localStorage cleared only');
        }

        return true;
    } catch (error) {
        console.error('Error clearing data:', error);
        return false;
    }
}