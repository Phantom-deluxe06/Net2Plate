import React, { useState } from "react";
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import FishermanDashboard from "./FishermanDashboard";
import CustomerDashboard from "./CustomerDashboard";
import InspectorDashboard from "./InspectorDashboard";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setRole(userDoc.data().role);
      } else {
        setError("No user data found.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      {role === "Fisherman" && <FishermanDashboard />}
      {role === "Customer" && <CustomerDashboard />}
      {role === "Inspector" && <InspectorDashboard />}
      {!role && (
        <form onSubmit={handleLogin}>
          <h2>Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          /><br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          /><br />
          <button type="submit">Login</button>
          {error && <p style={{color: "red"}}>{error}</p>}
        </form>
      )}
    </>
  );
};

export default Login;
