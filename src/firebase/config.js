import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// ATENÇÃO: COLOQUE SUAS CREDENCIAIS AQUI PARA USAR O FIRESTORE
const firebaseConfig = {
  apiKey: "AIzaSyC4ib3Ulgdpl3fyR0Y0xeZL0FTgqricMoU",
  authDomain: "smarthub-24bf7.firebaseapp.com",
  databaseURL: "https://smarthub-24bf7-default-rtdb.firebaseio.com",
  projectId: "smarthub-24bf7",
  storageBucket: "smarthub-24bf7.appspot.com",
  messagingSenderId: "1064690170638",
  appId: "1:1064690170638:web:89c8e4982dcd1895a3355f",
  measurementId: "G-NCPJTH7HDX"
}

// Inicializa o Firebase
const app = initializeApp(firebaseConfig)

// Exporta o Firestore (Banco de Dados de Metadados)
export const db = getFirestore(app)

export const storage = getStorage(app)