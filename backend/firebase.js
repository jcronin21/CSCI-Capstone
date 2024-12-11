import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore';

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

export { firestore, collection, getDocs, addDoc, doc, deleteDoc };
