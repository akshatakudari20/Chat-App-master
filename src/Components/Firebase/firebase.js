import firebase from '@firebase/app';
require('@firebase/auth');
require('@firebase/firestore');
require('@firebase/storage');
const firebaseConfig = {
  apiKey: "AIzaSyAJVCD1MH1gjHxtTK5zgryS-q5UAJMDvmk",
  authDomain: "chat-application-21b00.firebaseapp.com",
  projectId: "chat-application-21b00",
  storageBucket: "chat-application-21b00.appspot.com",
  messagingSenderId: "1045851824092",
  appId: "1:1045851824092:web:b80dcf7a80f8c021a5f919",
  measurementId: "G-W6SHWS3N0F"
  };
  firebase.initializeApp(firebaseConfig);
  export default firebase;