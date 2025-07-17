import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const InspectorDashboard = () => {
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    auth.signOut();
    window.location.reload();
  };

  useEffect(() => {
    const fetchUninspectedCatches = async () => {
      setLoading(true);
      try {
        // Only show catches that have not been inspected yet
        const q = query(collection(db, "catches"), where("inspected", "==", false));
        const querySnapshot = await getDocs(q);
        const catchList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCatches(catchList);
      } catch (err) {
        setCatches([]);
      }
      setLoading(false);
    };

    fetchUninspectedCatches();
  }, []);

  return (
    <div>
      <h2>Welcome, Inspector!</h2>
      <button onClick={handleLogout}>Logout</button>
      <h3>Catches Needing Inspection</h3>
      {loading ? (
        <p>Loading...</p>
      ) : catches.length === 0 ? (
        <p>No catches need inspection.</p>
      ) : (
        <ul>
          {catches.map(catchItem => (
            <li key={catchItem.id} style={{ marginBottom: "2em", border: "1px solid #ccc", padding: "1em" }}>
              <strong>Fish Type:</strong> {catchItem.fishType} <br />
              <strong>Catch Time:</strong> {catchItem.catchTime} <br />
              <strong>Location:</strong> {catchItem.location} <br />
              {catchItem.photoURL && (
                <div>
                  <img src={catchItem.photoURL} alt="Fish" style={{ maxWidth: "300px", marginTop: "1em" }} />
                </div>
              )}
              {/* Next step: Add an "Inspect" button here */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InspectorDashboard;
