import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";

const imgbbApiKey = "3a3b4f7326b95706e68ed90e472dbd31"; // Your imgbb API key

const FishermanDashboard = () => {
  const [fishName, setFishName] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");
  const [freshness, setFreshness] = useState({
    eyeClarity: "",
    gillColor: "",
    smell: "",
  });
  const [photo, setPhoto] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const [myCatches, setMyCatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // For showing customer names
  const [usernames, setUsernames] = useState({});

  const handleLogout = () => {
    auth.signOut();
    window.location.reload();
  };

  const handleFreshnessChange = (e) => {
    setFreshness({ ...freshness, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!photo) {
      setError("Photo is required.");
      return;
    }

    setUploading(true);

    try {
      // Convert image to base64
      const toBase64 = file =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = error => reject(error);
        });

      const base64Image = await toBase64(photo);

      // Upload to imgbb
      const formData = new FormData();
      formData.append("key", imgbbApiKey);
      formData.append("image", base64Image);

      const response = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error("Image upload failed");
      }

      const photoURL = data.data.url;

      // Save catch details to Firestore
      await addDoc(collection(db, "catches"), {
        fishName,
        weight,
        price,
        freshness,
        photoURL,
        fishermanId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        ordered: false,
        inspected: false,
      });

      setSuccess("Catch uploaded successfully!");
      setFishName("");
      setWeight("");
      setPrice("");
      setFreshness({ eyeClarity: "", gillColor: "", smell: "" });
      setPhoto(null);
    } catch (err) {
      setError("Failed to upload catch: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Fetch all catches uploaded by this fisherman
  useEffect(() => {
    const fetchMyCatches = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, "catches"), where("fishermanId", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const catchList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMyCatches(catchList);
      } catch (err) {
        setMyCatches([]);
      }
      setLoading(false);
    };

    fetchMyCatches();
  }, []);

  // Fetch usernames for all relevant user IDs
  const fetchUsernames = async (userIds) => {
    const names = {};
    for (const uid of userIds) {
      if (!usernames[uid]) {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
          names[uid] = userDoc.data().username || uid;
        } else {
          names[uid] = uid;
        }
      }
    }
    setUsernames(prev => ({ ...prev, ...names }));
  };

  useEffect(() => {
    // After fetching catches, get all user IDs for orders and bargains
    const userIds = [];
    myCatches.forEach(catchItem => {
      if (catchItem.orderedBy) userIds.push(catchItem.orderedBy);
      if (catchItem.bargainRequest?.requestedBy) userIds.push(catchItem.bargainRequest.requestedBy);
    });
    fetchUsernames([...new Set(userIds)]);
    // eslint-disable-next-line
  }, [myCatches]);

  // Accept the bargain offer
  const handleAcceptBargain = async (catchId, bargainPrice) => {
    await updateDoc(doc(db, "catches", catchId), {
      price: bargainPrice,
      bargainRequest: null,
    });
    window.location.reload();
  };

  // Counter offer logic
  const [counterOffer, setCounterOffer] = useState({});
  const handleCounterOffer = (catchId) => {
    setCounterOffer({ ...counterOffer, [catchId]: "" });
  };
  const handleCounterOfferChange = (catchId, value) => {
    setCounterOffer({ ...counterOffer, [catchId]: value });
  };
  const submitCounterOffer = async (catchId) => {
    const price = counterOffer[catchId];
    if (!price || isNaN(price) || Number(price) <= 0) {
      alert("Enter a valid price.");
      return;
    }
    await updateDoc(doc(db, "catches", catchId), {
      counterOffer: {
        price,
        fishermanId: auth.currentUser.uid,
      },
    });
    setCounterOffer({ ...counterOffer, [catchId]: "" });
    window.location.reload();
  };

  return (
    <div>
      <h2>Welcome, Fisherman!</h2>
      <button onClick={handleLogout}>Logout</button>
      <h3>Upload a New Catch</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Fish Name"
          value={fishName}
          onChange={e => setFishName(e.target.value)}
          required
        /><br />
        <input
          type="text"
          placeholder="Weight (kg)"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          required
        /><br />
        <input
          type="text"
          placeholder="Price (₹)"
          value={price}
          onChange={e => setPrice(e.target.value)}
          required
        /><br />
        <label>
          Eye Clarity:
          <select name="eyeClarity" value={freshness.eyeClarity} onChange={handleFreshnessChange} required>
            <option value="">Select</option>
            <option value="Clear">Clear</option>
            <option value="Cloudy">Cloudy</option>
          </select>
        </label><br />
        <label>
          Gill Color:
          <select name="gillColor" value={freshness.gillColor} onChange={handleFreshnessChange} required>
            <option value="">Select</option>
            <option value="Red">Red</option>
            <option value="Pink">Pink</option>
            <option value="Brown">Brown</option>
          </select>
        </label><br />
        <label>
          Smell:
          <select name="smell" value={freshness.smell} onChange={handleFreshnessChange} required>
            <option value="">Select</option>
            <option value="Fresh">Fresh</option>
            <option value="Slight">Slight</option>
            <option value="Strong">Strong</option>
          </select>
        </label><br />
        <input
          type="file"
          accept="image/*"
          onChange={e => setPhoto(e.target.files[0])}
          required
        /><br />
        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Catch"}
        </button>
      </form>
      {success && <p style={{color: "green"}}>{success}</p>}
      {error && <p style={{color: "red"}}>{error}</p>}

      <h3>My Past Uploads</h3>
      {loading ? (
        <p>Loading...</p>
      ) : myCatches.length === 0 ? (
        <p>No uploads yet.</p>
      ) : (
        <ul>
          {myCatches.map(catchItem => (
            <li key={catchItem.id} style={{ marginBottom: "2em", border: "1px solid #ccc", padding: "1em" }}>
              <strong>Fish Name:</strong> {catchItem.fishName} <br />
              <strong>Weight:</strong> {catchItem.weight} kg<br />
              <strong>Price:</strong> ₹{catchItem.price} <br />
              <strong>Status:</strong> {
                catchItem.rejected ? "Rejected"
                : catchItem.delivered ? "Delivered"
                : catchItem.inspected ? "Inspected"
                : catchItem.ordered ? "Ordered"
                : "Available"
              }<br />
              {catchItem.photoURL && (
                <div>
                  <img src={catchItem.photoURL} alt="Fish" style={{ maxWidth: "200px", marginTop: "1em" }} />
                </div>
              )}
              {catchItem.ordered && (
                <div>
                  <strong>Ordered By:</strong> {usernames[catchItem.orderedBy] || catchItem.orderedBy}
                </div>
              )}
              {catchItem.bargainRequest && (
                <div style={{ color: "blue" }}>
                  <strong>Bargain Requested:</strong> ₹{catchItem.bargainRequest.price} <br />
                  <strong>Requested By:</strong> {usernames[catchItem.bargainRequest.requestedBy] || catchItem.bargainRequest.requestedBy}
                </div>
              )}
              {/* Counter-offer logic */}
              {catchItem.counterOffer && !catchItem.ordered && (
                <div style={{ color: "orange" }}>
                  <strong>Counter Offer Sent:</strong> ₹{catchItem.counterOffer.price}
                  <br />
                  <span>Waiting for customer response...</span>
                </div>
              )}
              {catchItem.counterOfferRejected && (
                <div style={{ color: "red" }}>
                  Customer rejected your counter-offer.
                </div>
              )}
              {catchItem.ordered && !catchItem.counterOffer && (
                <div style={{ color: "green" }}>
                  Customer accepted your offer! Order placed.
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FishermanDashboard;
