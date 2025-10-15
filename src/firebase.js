import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB_CceuwzZV4ebD_ERjt_QSlYzfT-rMHFI",
  authDomain: "deteccion-de-movimientos.firebaseapp.com",
  projectId: "deteccion-de-movimientos",
  storageBucket: "deteccion-de-movimientos.appspot.com",
  messagingSenderId: "484873022921",
  appId: "1:484873022921:web:c671dc535ade74f4b74c18",
  measurementId: "G-9Z6SKN0HM3"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

export { firebase, auth, db};

