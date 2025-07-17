import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import SignUp from "./SignUp";
import Login from "./Login";
import CustomerDashboard from "./CustomerDashboard";
import FishermanDashboard from "./FishermanDashboard";
import InspectorDashboard from "./InspectorDashboard";
import { doc, getDoc } from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        } else {
          setRole(null);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div style={{textAlign: "center", marginTop: "3em"}}>Loading...</div>;

  if (!user) {
    return (
      <div>
        <SignUp />
        <Login />
      </div>
    );
  }

  if (role === "Customer") return <CustomerDashboard />;
  if (role === "Fisherman") return <FishermanDashboard />;
  if (role === "Inspector") return <InspectorDashboard />;
  return <div>Loading dashboard...</div>;
}

export default App;
