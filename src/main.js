import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from "./store";
import { Quasar } from 'quasar'
import quasarUserOptions from './quasar-user-options'
import * as firebase from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAr1mPuh4Ciozs-AOyXPra55zLBJ8bcyJM",
    authDomain: "whitelist-adc1e.firebaseapp.com",
    databaseURL: "https://whitelist-adc1e-default-rtdb.firebaseio.com",
    projectId: "whitelist-adc1e",
    storageBucket: "whitelist-adc1e.appspot.com",
    messagingSenderId: "472954762622",
    appId: "1:472954762622:web:0897f46e39fdacee2e6f2f"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

createApp(App)
    .use(Quasar, quasarUserOptions)
    .use(router)
    .use(store)
    .mount('#app')
