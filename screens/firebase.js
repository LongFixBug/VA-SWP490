// firebase.js
import firebase from "firebase/app";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBom5oMU-8BGGRMAqCn0RnsQsEa45phG1w",
  authDomain: "vegetarian-assistant.firebaseapp.com",
  projectId: "vegetarian-assistant",
  storageBucket: "vegetarian-assistant.appspot.com",
  messagingSenderId: "152582940628",
  appId: "1:152582940628:web:d2a516f084403032291841",
  measurementId: "G-V6P3TSLHP5",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
