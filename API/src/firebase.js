import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// Real configuration parameters from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyDqRKR5jcZM22Svk_ODAYphplg-fVmeqLI",
    authDomain: "jhyaap-b5225.firebaseapp.com",
    projectId: "jhyaap-b5225",
    storageBucket: "jhyaap-b5225.firebasestorage.app",
    messagingSenderId: "973555061362",
    appId: "1:973555061362:web:5b202fbc248c55df4968eb",
    measurementId: "G-WEZ8JN4L4F"
};
// Initialize App
const app = initializeApp(firebaseConfig);
// Initialize Authentication exports
export const auth = getAuth(app);
export default app;
