import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore";

const CustomerDashboard = () => {
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bargainId, setBargainId] = useState(null);
  const [bargainPrice, setBargainPrice] = useState("");

  const handleLogout = () => {
    auth.signOut();
    window.location.reload();
  };

  const fetchCatches = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "catches"), orderBy("createdAt", "desc"));
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

  useEffect(() => {
    fetchCatches();
    // eslint-disable-next-line
  }, []);

  const handleOrder = async (catchId) => {
    try {
      await updateDoc(doc(db, "catches", catchId), {
        ordered: true,
        orderedBy: auth.currentUser.uid,
      });
      fetchCatches(); // Refresh the list
    } catch (err) {
      alert("Failed to order: " + err.message);
    }
  };

  const handleBargainRequest = (catchId) => {
    setBargainId(catchId);
    setBargainPrice("");
  };

  const submitBargain = async (catchId) => {
    if (!bargainPrice || isNaN(bargainPrice) || Number(bargainPrice) <= 0) {
      alert("Please enter a valid price.");
      return;
    }
    try {
      await updateDoc(doc(db, "catches", catchId), {
        bargainRequest: {
          price: bargainPrice,
          requestedBy: auth.currentUser.uid,
        },
      });
      setBargainId(null);
      setBargainPrice("");
      fetchCatches();
      alert("Bargain request sent!");
    } catch (err) {
      alert("Failed to request bargain: " + err.message);
    }
  };

  return (
    <div>
      <h2>Welcome, Customer!</h2>
      <button onClick={handleLogout}>Logout</button>
      <h3>Available Catches</h3>
      {loading ? (
        <p>Loading...</p>
      ) : catches.length === 0 ? (
        <p>No catches available.</p>
      ) : (
        <ul>
          {catches.map(catchItem => (
            <li key={catchItem.id} style={{ marginBottom: "2em", border: "1px solid #ccc", padding: "1em" }}>
              <strong>Fish Name:</strong> {catchItem.fishName} <br />
              <strong>Weight:</strong> {catchItem.weight} kg<br />
              <strong>Price:</strong> ₹{catchItem.price} <br />
              <strong>Freshness Checklist:</strong>
              <ul>
                <li>Eye Clarity: {catchItem.freshness?.eyeClarity}</li>
                <li>Gill Color: {catchItem.freshness?.gillColor}</li>
                <li>Smell: {catchItem.freshness?.smell}</li>
              </ul>
              {catchItem.photoURL && (
                <div>
                  <img src={catchItem.photoURL} alt="Fish" style={{ maxWidth: "300px", marginTop: "1em" }} />
                </div>
              )}
              {!catchItem.ordered && (
                <>
                  <button onClick={() => handleOrder(catchItem.id)} style={{ marginTop: "1em" }}>
                    Order
                  </button>
                  <button onClick={() => handleBargainRequest(catchItem.id)} style={{ marginTop: "1em", marginLeft: "1em" }}>
                    Request Bargain
                  </button>
                  {bargainId === catchItem.id && (
                    <div style={{ marginTop: "1em" }}>
                      <input
                        type="number"
                        placeholder="Propose new price (₹)"
                        value={bargainPrice}
                        onChange={e => setBargainPrice(e.target.value)}
                        min="1"
                        required
                      />
                      <button onClick={() => submitBargain(catchItem.id)} style={{ marginLeft: "0.5em" }}>
                        Submit
                      </button>
                      <button onClick={() => setBargainId(null)} style={{ marginLeft: "0.5em" }}>
                        Cancel
                      </button>
                    </div>
                  )}
                  {catchItem.bargainRequest && (
                    <div style={{ color: "blue", marginTop: "0.5em" }}>
                      Bargain requested: ₹{catchItem.bargainRequest.price}
                    </div>
                  )}
                </>
              )}
              {catchItem.ordered && (
                <span style={{ color: "green", marginLeft: "1em" }}>Ordered</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomerDashboard;
