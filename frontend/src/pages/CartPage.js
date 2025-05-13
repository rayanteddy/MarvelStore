import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import axios from "axios";

const CartPage = () => {
  const [cart, setCart] = useState(() => {
    const local = JSON.parse(localStorage.getItem("cart"));
    return local ? { products: local } : { products: [] };
  });  
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
  const [address, setAddress] = useState("");
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paypalEmail, setPaypalEmail] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const loadPayPalScript = () => {
    return new Promise((resolve, reject) => {
      if (document.getElementById("paypal-sdk")) return resolve();
  
      const script = document.createElement("script");
      script.src = "https://www.paypal.com/sdk/js?client-id=Aa1Ocb6Gn5RgWkO5LbrJ-HhoB5oMQ_JorMEiJ8XfU60xY3L8BcHbTGPaXoy4O4N5lEeuTai7n_Wap1WN&currency=EUR";
      script.id = "paypal-sdk";
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);
      document.body.appendChild(script);
    });
  };  

  useEffect(() => {
    if (!user) return;
  
    // Load cart
    axios.get(`http://localhost:5000/api/cart/${user._id}`)
      .then(res => {
        const products = res.data?.products || [];
        setCart({ products });
        localStorage.setItem("cart", JSON.stringify(products));
      })
      .catch(err => console.error("Error cart :", err));
  
    // Load address
    axios.get(`http://localhost:5000/api/addresses`, { params: { userId: user._id } })
      .then(res => setSavedAddresses(res.data))
      .catch(err => console.error("Error address :", err));
  }, [user]);
  
  useEffect(() => {
    const loadPayPalScript = () => {
      return new Promise((resolve, reject) => {
        if (document.getElementById("paypal-sdk")) return resolve();
  
        const script = document.createElement("script");
        script.src = "https://www.paypal.com/sdk/js?client-id=Aa1Ocb6Gn5RgWkO5LbrJ-HhoB5oMQ_JorMEiJ8XfU60xY3L8BcHbTGPaXoy4O4N5lEeuTai7n_Wap1WN&currency=EUR";
        script.id = "paypal-sdk";
        script.onload = () => resolve();
        script.onerror = (err) => reject(err);
        document.body.appendChild(script);
      });
    };
  
    if (paymentMethod === "paypal") {
      loadPayPalScript()
        .then(() => {
          if (window.paypal) {
            window.paypal.Buttons({
              createOrder: (data, actions) => {
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: getTotalPrice()
                    }
                  }]
                });
              },
              onApprove: (data, actions) => {
                return actions.order.capture().then((details) => {
                  alert("PayPal payment confirmed by " + details.payer.name.given_name);
                  handlePaypalSuccess();
                });
              }              
            }).render("#paypal-button-container");
          }
        })
        .catch(err => console.error("Error load to PayPal :", err));
    }
  }, [paymentMethod, cart]);
  
  const handlePaypalSuccess = async () => {
    try {
      // 1. Update stock
      await axios.post("http://localhost:5000/api/cart/updateStock", { cart });
  
      // 2. Create an order
      await axios.post("http://localhost:5000/api/orders/create", {
        userId: user._id,
        cart,
        address,
        paymentMethod: "paypal",
        total: getTotalPrice(),
      });
  
      // 3. Empty the cart on the backend side.
      await axios.post("http://localhost:5000/api/cart/clear", { userId: user._id });
  
      // 4. Empty the cart on the frontend side.
      setCart({ products: [] });
      localStorage.removeItem("cart");

      localStorage.setItem("checkoutAddress", address);
      localStorage.setItem("paymentMethod", "paypal");
      localStorage.setItem("userId", user._id);

  
      // 5. Redirect or inform
      alert("✅ PayPal payment successful and order created. !");
      navigate("/orders");
    } catch (err) {
      console.error("Error after PayPal payment :", err);
      alert("❌ An error occurred after payment..");
    }
  };  

  const removeFromCart = async (product) => {
    try {
      await axios.post("http://localhost:5000/api/cart/remove", {
        userId: user._id,
        productId: product.productId._id || product.productId,
        color: product.color,
        size: product.size
      });
  
      const newCart = cart.products.filter(
        (item) =>
          !(
            item.productId._id === product.productId._id &&
            item.color === product.color &&
            item.size === product.size
          )
      );
  
      setCart({ products: newCart });
      localStorage.setItem("cart", JSON.stringify(newCart));
    } catch (error) {
      console.error("Deletion error :", error);
      alert("Error deleting product.");
    }
  };  

  // Function to calculate the total
  const getTotalPrice = () => {
    if (!Array.isArray(cart.products)) return 0;
  
    return cart.products.reduce((total, item) => {
      const price = item?.productId?.price || 0;
      const quantity = item?.quantity || 0;
      return total + price * quantity;
    }, 0).toFixed(2);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const getDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  };

  const handlePayment = async () => {
    if (!address) return alert("Select an address.");
  
    // 👉 Stock checkout info
    localStorage.setItem("checkoutAddress", address);
    localStorage.setItem("paymentMethod", paymentMethod);
    localStorage.setItem("userId", user._id);
  
    if (paymentMethod === "paypal") {
      window.location.href = "https://www.paypal.me/marvelstore1010";
      return;
    }
  
    console.log("🎯 Data sent to Stripe :", {
      cart,
      userEmail: user.email,
    });
  
    try {
      const response = await axios.post("http://localhost:5000/api/stripe/create-checkout-session", {
        cart,
        userEmail: user.email,
      });
  
      window.location.href = response.data.url;
    } catch (err) {
      console.error("Payment error :", err);
      alert("Error during payment.");
    }
  };  
  
  return (
    <div>
      {/* Navigation bar */}
      <header style={{ backgroundColor: "#222", color: "white", padding: "10px 1px", position: "fixed", top: 0, left: 0, width: "100%", zIndex: 10 }}>
        <nav style={{ display: "flex", justifyContent: "center", gap: "20px", padding: "10px 0" }}>
          {["/", "/products", "/cart", "/orders", "/account", "/addresses"].map((path, idx) => (
            <Link key={path} to={path}>
              <Icon icon={`mdi:${["home", "shopping", "cart", "package-variant-closed", "account", "map-marker"][idx]}`} width="32" color={location.pathname === path ? "red" : "white"} />
            </Link>
          ))}
        </nav>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 20px", alignItems: "center" }}>
          <h1>🛒 My Cart</h1>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Icon icon="mdi:account-circle" width="40" />
            {user ? (
              <>
                <span style={{ marginLeft: "10px" }}>{user.name}</span>
                <button onClick={handleLogout} style={{ marginLeft: "10px", backgroundColor: "red", color: "white" }}>Disconnection</button>
              </>
            ) : (
              <button onClick={() => navigate("/login")} style={{ marginLeft: "10px", backgroundColor: "blue", color: "white" }}>Login</button>
            )}
          </div>
        </div>
      </header>

      <main style={{ marginTop: "120px", padding: "20px", backgroundColor: "#111", minHeight: "100vh", color: "white" }}>
        {cart.products.length === 0 ? (
          <h2>Your basket is empty.</h2>
        ) : (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
              {cart.products.map((product, i) => (
                <div key={i} style={{ backgroundColor: "#222", margin: 10, padding: 10 }}>
                  <img src={`http://localhost:5000${product.productId?.image}`} alt={product.productId?.name} style={{ width: "180px", height: "150px" }} />
                  <h3>{product.productId?.name}</h3>
                  <p>Price : {product.productId?.price}€</p>
                  <p>color : {product.color}</p>
                  <p>size : {product.size}</p>
                  <p>Quantity : {product.quantity}</p>
                  <button onClick={() => removeFromCart(product)} style={{ backgroundColor: "red", color: "white" }}>Supprimer</button>
                </div>
              ))}
            </div>
            
            <div style={{ fontWeight: "bold", fontSize: "18px", marginTop: "20px" }}>
              Total : {getTotalPrice()} €
            </div>


            {/* Paiement */}
            <div style={{ backgroundColor: "#111", padding: 20, marginTop: 30, borderRadius: 10 }}>
              <h3>💳 Payment</h3>

              {/* Adresse */}
              <label>Address save :</label>
              <select value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: "60%", marginBottom: 20 }}>
                <option value="">-- Select address --</option>
                {savedAddresses.map((addr, i) => (
                  <option key={i} value={`${addr.fullName}, ${addr.address}, ${addr.city}`}>
                    {addr.fullName}, {addr.address}, {addr.city}
                  </option>
                ))}
              </select>

              {/* Payment */}
              <label>Payment mode :</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: "30%", marginBottom: 20 }}>
                <option value="">-- Select paymentmethod --</option>
                <option value="card">Card</option>
                <option value="paypal">PayPal</option>
              </select>

              {paymentMethod === "paypal" && (
                <div id="paypal-button-container" style={{ marginTop: 10 }}></div>
              )}

              <p>📦 Expected delivery : {getDeliveryDate()}</p>
              <button onClick={handlePayment} style={{ backgroundColor: "green", color: "white" }}>Pay</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default CartPage;
