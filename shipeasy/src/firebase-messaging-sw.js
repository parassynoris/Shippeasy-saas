importScripts('https://www.gstatic.com/firebasejs/7.20.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.20.0/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyAW2dHz0SvjchyEHLeExTuFwAMn95tvhzE",
  authDomain: "diabos-fc49f.firebaseapp.com",
  projectId: "diabos-fc49f",
  storageBucket: "diabos-fc49f.appspot.com",
  messagingSenderId: "198648109724",
  appId: "1:198648109724:web:ad300def453336e5026b59",
  measurementId: "G-B1Q5PLSV9Q"
});

const messaging = firebase.messaging();

