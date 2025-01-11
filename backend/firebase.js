import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';
import 'firebase/auth';
import { getAuth } from "firebase/auth";
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA4fZ1EnGrIlQhi04uh25BYWFWoj_ZsK4I",
  authDomain: "tune-n.firebaseapp.com",
  databaseURL: "https://tune-n-default-rtdb.firebaseio.com",
  projectId: "tune-n",
  storageBucket: "tune-n.firebasestorage.app",
  messagingSenderId: "77133926440",
  appId: "1:77133926440:web:5ea341af42b4455063e51d"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);
const db = getFirestore(app); 
export { db };
export { firestore, auth,collection, getDocs, addDoc, doc, deleteDoc };
