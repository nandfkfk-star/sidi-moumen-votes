import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBZP9Jdov0vSWttmF_vDlT64twJbfXjWog",
  authDomain: "sidi-moumen-74730.firebaseapp.com",
  databaseURL: "https://sidi-moumen-74730-default-rtdb.firebaseio.com",
  projectId: "sidi-moumen-74730",
  storageBucket: "sidi-moumen-74730.firebasestorage.app",
  messagingSenderId: "908225254735",
  appId: "1:908225254735:web:fe3983209d53ac6a68a13a",
  measurementId: "G-KS8RC33BJV",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export const INITIAL_NEIGHBORHOODS = [
  "اليقين", "جوهرة", "ضحى", "العلاء", "النخيل", "الرحامنة",
  "المشروع", "الريان", "الكوثر", "الكرام", "النهضة", "البيضة",
  "مبروكة", "السعادة", "الشراف", "الهدى", "عبير", "الكرون",
  "سيدي مومن القديم",
];
