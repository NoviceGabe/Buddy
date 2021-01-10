const firebaseConfig = {
	apiKey: "AIzaSyCJLXZVc3YmsWmvp-XeptIGG9sRYvufhhs",
	authDomain: "chat-3db56.firebaseapp.com",
	projectId: "chat-3db56",
	storageBucket: "chat-3db56.appspot.com",
	messagingSenderId: "863153149044",
	appId: "1:863153149044:web:29e37770fccabc27b66d21",
    measurementId: "G-55X3KZXCHP"
	};

firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();
const auth = firebase.auth();