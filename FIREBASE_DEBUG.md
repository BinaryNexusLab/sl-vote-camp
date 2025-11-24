# 🔥 Firebase Debug Guide

## 🐛 **Issue: Changes not saving to Firebase**

### **📊 Debugging Steps:**

#### **1. Check Browser Console**

1. Open your app: `http://192.168.10.156:3000/`
2. Press **F12** → **Console** tab
3. **Add a ward** and look for these messages:
   - ✅ `🔥 Starting Firebase save operation...`
   - ✅ `✅ Data saved to Firebase successfully`
   - ❌ `❌ Error saving to Firebase:` (if there's an error)

#### **2. Check Firebase Security Rules**

Your Firestore might be blocking writes. Go to:

1. **Firebase Console**: https://console.firebase.google.com/project/sl-vote-camp
2. **Firestore Database** → **Rules** tab
3. **Current rules should be**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // Allow all for development
    }
  }
}
```

#### **3. Manual Test**

Open browser console and run:

```javascript
// Test Firebase connection
console.log("Testing Firebase...");
```

#### **4. Check Network Tab**

1. **F12** → **Network** tab
2. **Add a ward**
3. **Look for Firebase requests** - should see calls to `firestore.googleapis.com`

### **🔧 Common Issues:**

#### **❌ Firestore Security Rules**

- **Problem**: Rules block anonymous writes
- **Solution**: Set rules to allow all for development

#### **❌ Project Not Initialized**

- **Problem**: Firestore database not created
- **Solution**: Go to Firebase Console → Create Firestore Database

#### **❌ Wrong Project ID**

- **Problem**: Connecting to wrong/non-existent project
- **Solution**: Verify `.env` project ID matches Firebase Console

### **🎯 Quick Fix:**

If nothing works, temporarily change Firestore rules to:

```
allow read, write: if true;
```

This allows all operations for debugging (change back later for security).

---

**Expected Console Output:**

```
🔥 Starting Firebase save operation... 3 regions
✅ Data saved to Firebase successfully and cache updated
```
