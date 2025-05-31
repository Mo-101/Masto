"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAnalytics } from "firebase/analytics"
import firebaseConfig from "../firebase-config"

// Create context
interface FirebaseContextType {
  firestore: any
  storage: any
  analytics: any
  initialized: boolean
}

const FirebaseContext = createContext<FirebaseContextType | null>(null)

// Provider component
export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [firebase, setFirebase] = useState<FirebaseContextType | null>(null)

  useEffect(() => {
    try {
      // Initialize Firebase
      const app = initializeApp(firebaseConfig)
      const firestore = getFirestore(app)
      const storage = getStorage(app)

      // Initialize analytics only in browser environment
      let analytics = null
      if (typeof window !== "undefined") {
        analytics = getAnalytics(app)
      }

      setFirebase({
        firestore,
        storage,
        analytics,
        initialized: true,
      })

      console.log("✅ Firebase client initialized successfully")
    } catch (error) {
      console.error("❌ Firebase initialization error:", error)
    }
  }, [])

  return <FirebaseContext.Provider value={firebase}>{children}</FirebaseContext.Provider>
}

// Custom hook to use the Firebase context
export function useFirebase() {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider")
  }
  return context
}
