import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { collection, getDocs, query, orderBy, doc, updateDoc, addDoc, serverTimestamp, onSnapshot, getDoc, where } from "firebase/firestore";
import { addNotification } from "./utils/notifications";

const CustomerDashboard = () => {
  const [catches, setCatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bargainId, setBargainId] = useState(null);
  const [bargainPrice, setBargainPrice] = useState("");
  const [reBargainPrice, setReBargainPrice] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showMyOrders, setShowMyOrders] = useState(false);

  const handleLogout = () => {
    auth.signOut();
    window.location.reload();
  };

  useEffect(() => {
    const q = query(collection(db, "catches"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const catchList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCatches(catchList);
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setNotifications(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const handleOrder = async (catchId) => {
    try {
      await updateDoc(doc(db, "catches", catchId), {
        ordered: true,
        orderedBy: auth.currentUser.uid,
      });
      await addNotification(auth.currentUser.uid, "Your order has been placed!");
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
      alert("Bargain request sent!");
    } catch (err) {
      alert("Failed to request bargain: " + err.message);
    }
  };

  const acceptCounterOffer = async (catchId, price) => {
    try {
      await updateDoc(doc(db, "catches", catchId), {
        ordered: true,
        orderedBy: auth.currentUser.uid,
        price: price,
        counterOffer: null, // clear counter-offer
      });
      alert("Counter-offer accepted! Order placed.");
      await addNotification(auth.currentUser.uid, "Your counter-offer has been accepted!");
    } catch (err) {
      alert("Failed to accept counter-offer: " + err.message);
    }
  };

  const submitReBargain = async (catchId) => {
    if (!reBargainPrice || isNaN(reBargainPrice) || Number(reBargainPrice) <= 0) {
      alert("Please enter a valid price.");
      return;
    }
    try {
      await updateDoc(doc(db, "catches", catchId), {
        bargainRequest: {
          price: reBargainPrice,
          requestedBy: auth.currentUser.uid,
        },
        counterOffer: null, // clear previous counter-offer
      });
      setReBargainPrice("");
      alert("Re-bargain request sent!");
    } catch (err) {
      alert("Failed to request re-bargain: " + err.message);
    }
  };

  function getOrderStatus(catchItem) {
    if (catchItem.rejected) return { text: "Rejected", color: "red", icon: "❌" };
    if (catchItem.delivered) return { text: "Delivered", color: "green", icon: "✅" };
    if (catchItem.inspected) return { text: "Inspected & Approved", color: "blue", icon: "🔍" };
    if (catchItem.ordered) return { text: "Ordered", color: "orange", icon: "📦" };
    return { text: "Available", color: "gray", icon: "🐟" };
  }

  const markAsRead = async (notificationId) => {
    await updateDoc(doc(db, "notifications", notificationId), { read: true });
  };

  // Filter catches based on showMyOrders state
  const filteredCatches = showMyOrders 
    ? catches.filter(catchItem => catchItem.orderedBy === auth.currentUser.uid)
    : catches;

  return (
    <div>
      <h2>Welcome, Customer!</h2>
      <button onClick={handleLogout}>Logout</button>
      
      <div style={{ marginBottom: "1em" }}>
        <button 
          onClick={() => setShowMyOrders(false)}
          style={{ 
            marginRight: "1em",
            backgroundColor: !showMyOrders ? "#007bff" : "#f8f9fa",
            color: !showMyOrders ? "white" : "black",
            padding: "0.5em 1em",
            border: "1px solid #007bff",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          All Catches
        </button>
        <button 
          onClick={() => setShowMyOrders(true)}
          style={{ 
            backgroundColor: showMyOrders ? "#007bff" : "#f8f9fa",
            color: showMyOrders ? "white" : "black",
            padding: "0.5em 1em",
            border: "1px solid #007bff",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          My Orders
        </button>
      </div>

      <h3>{showMyOrders ? "My Orders" : "Available Catches"}</h3>
      {loading ? (
        <p>Loading...</p>
      ) : filteredCatches.length === 0 ? (
        <p>{showMyOrders ? "You haven't placed any orders yet." : "No catches available."}</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filteredCatches.map(catchItem => (
            <li key={catchItem.id} style={{ 
              marginBottom: "2em", 
              border: "1px solid #ddd", 
              borderRadius: "8px",
              padding: "1.5em",
              backgroundColor: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 0.5em 0", color: "#333" }}>{catchItem.fishName}</h4>
                  <p style={{ margin: "0.25em 0", color: "#666" }}>
                    <strong>Weight:</strong> {catchItem.weight} kg
                  </p>
                  <p style={{ margin: "0.25em 0", color: "#666" }}>
                    <strong>Price:</strong> ₹{catchItem.price}
                  </p>
                  
                  <div style={{ margin: "1em 0" }}>
                    <strong>Freshness Checklist:</strong>
                    <ul style={{ margin: "0.5em 0", paddingLeft: "1.5em" }}>
                      <li>Eye Clarity: {catchItem.freshness?.eyeClarity}</li>
                      <li>Gill Color: {catchItem.freshness?.gillColor}</li>
                      <li>Smell: {catchItem.freshness?.smell}</li>
                    </ul>
                  </div>
                </div>
                
                {catchItem.photoURL && (
                  <div style={{ marginLeft: "1em" }}>
                    <img 
                      src={catchItem.photoURL} 
                      alt="Fish" 
                      style={{ 
                        maxWidth: "200px", 
                        maxHeight: "150px",
                        borderRadius: "4px",
                        objectFit: "cover"
                      }} 
                    />
                  </div>
                )}
              </div>

              {!catchItem.ordered && (
                <>
                  <button 
                    onClick={() => handleOrder(catchItem.id)} 
                    style={{ 
                      marginTop: "1em",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      padding: "0.5em 1em",
                      borderRadius: "4px",
                      cursor: "pointer",
                      marginRight: "0.5em"
                    }}
                  >
                    Order
                  </button>
                  <button 
                    onClick={() => handleBargainRequest(catchItem.id)} 
                    style={{ 
                      marginTop: "1em",
                      backgroundColor: "#ffc107",
                      color: "black",
                      border: "none",
                      padding: "0.5em 1em",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Request Bargain
                  </button>
                  
                  {bargainId === catchItem.id && (
                    <div style={{ marginTop: "1em", padding: "1em", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                      <input
                        type="number"
                        placeholder="Propose new price (₹)"
                        value={bargainPrice}
                        onChange={e => setBargainPrice(e.target.value)}
                        min="1"
                        required
                        style={{ padding: "0.5em", marginRight: "0.5em", borderRadius: "4px", border: "1px solid #ddd" }}
                      />
                      <button 
                        onClick={() => submitBargain(catchItem.id)} 
                        style={{ 
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          padding: "0.5em 1em",
                          borderRadius: "4px",
                          cursor: "pointer",
                          marginRight: "0.5em"
                        }}
                      >
                        Submit
                      </button>
                      <button 
                        onClick={() => setBargainId(null)} 
                        style={{ 
                          backgroundColor: "#6c757d",
                          color: "white",
                          border: "none",
                          padding: "0.5em 1em",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  
                  {catchItem.bargainRequest && (
                    <div style={{ color: "blue", marginTop: "0.5em", padding: "0.5em", backgroundColor: "#e3f2fd", borderRadius: "4px" }}>
                      Bargain requested: ₹{catchItem.bargainRequest.price}
                    </div>
                  )}
                  
                  {catchItem.counterOffer && (
                    <div style={{ color: "orange", marginTop: "0.5em", padding: "0.5em", backgroundColor: "#fff3e0", borderRadius: "4px" }}>
                      <strong>Fisherman counter-offer: ₹{catchItem.counterOffer.price}</strong>
                      <div style={{ marginTop: "0.5em" }}>
                        <button 
                          onClick={() => acceptCounterOffer(catchItem.id, catchItem.counterOffer.price)}
                          style={{ 
                            backgroundColor: "#28a745",
                            color: "white",
                            border: "none",
                            padding: "0.5em 1em",
                            borderRadius: "4px",
                            cursor: "pointer",
                            marginRight: "0.5em"
                          }}
                        >
                          Accept Counter-Offer
                        </button>
                        <input
                          type="number"
                          placeholder="Propose new price (₹)"
                          value={reBargainPrice}
                          onChange={e => setReBargainPrice(e.target.value)}
                          min="1"
                          style={{ 
                            padding: "0.5em", 
                            marginRight: "0.5em", 
                            borderRadius: "4px", 
                            border: "1px solid #ddd" 
                          }}
                        />
                        <button 
                          onClick={() => submitReBargain(catchItem.id)} 
                          style={{ 
                            backgroundColor: "#ffc107",
                            color: "black",
                            border: "none",
                            padding: "0.5em 1em",
                            borderRadius: "4px",
                            cursor: "pointer"
                          }}
                        >
                          Re-bargain
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <div style={{ marginTop: "1em" }}>
                {(() => {
                  const status = getOrderStatus(catchItem);
                  return (
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "0.5em",
                      padding: "0.5em",
                      backgroundColor: `${status.color}20`,
                      border: `1px solid ${status.color}`,
                      borderRadius: "4px"
                    }}>
                      <span style={{ fontSize: "1.2em" }}>{status.icon}</span>
                      <strong style={{ color: status.color }}>Status: {status.text}</strong>
                    </div>
                  );
                })()}
                
                {catchItem.rejected && (
                  <div style={{ color: "red", marginTop: "0.5em", padding: "0.5em", backgroundColor: "#ffebee", borderRadius: "4px" }}>
                    <strong>Reason:</strong> {typeof catchItem.rejected === "string" ? catchItem.rejected : "Rejected by inspector"}
                  </div>
                )}
                
                {catchItem.inspectionResults && (
                  <div style={{ marginTop: "0.5em", padding: "0.5em", backgroundColor: "#f0f8ff", borderRadius: "4px" }}>
                    <strong>Inspection Score:</strong> {catchItem.inspectionResults.averageScore}/5
                    {catchItem.inspectionResults.notes && (
                      <div style={{ marginTop: "0.25em" }}>
                        <strong>Notes:</strong> {catchItem.inspectionResults.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <h3>Notifications</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {notifications.length === 0 && <li style={{ padding: "1em", color: "#666" }}>No notifications</li>}
        {notifications.map(n => (
          <li key={n.id} style={{ 
            fontWeight: n.read ? "normal" : "bold",
            padding: "0.5em",
            marginBottom: "0.5em",
            backgroundColor: n.read ? "#f8f9fa" : "#e3f2fd",
            borderRadius: "4px",
            border: n.read ? "1px solid #dee2e6" : "1px solid #2196f3"
          }}>
            {n.message}
            {!n.read && (
              <button 
                onClick={() => markAsRead(n.id)} 
                style={{ 
                  marginLeft: "1em",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "0.25em 0.5em",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.8em"
                }}
              >
                Mark as read
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CustomerDashboard;
