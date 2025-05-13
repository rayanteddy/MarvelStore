import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';

function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleViewProducts = () => {
    console.log("Redirect to the product page");
    navigate('/products');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div style={{
      backgroundImage: `url('/assets/homepage.webp')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "20px",
      color: "#fff"
    }}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.7)", padding: "20px", borderRadius: "10px", width: "80%", maxWidth: "400px" }}>
        <h1>Welcome to The Marvel Store</h1>
        <p>Add your products and enjoy online shopping. !</p>
        <button onClick={handleViewProducts}>Enter the shop</button>
        <p>Description:</p>
        <p>Welcome to the best online shop.</p>
        <p>We offer you many high quality products at low prices..</p>
        <p>ENJOY YOURSELF ! ! !</p>
      </div>
      
      {/* Navigation bar */}
      <header style={{ display: "flex", flexDirection: "column", backgroundColor: "#222", color: "white", padding: "10px 1px", position: "fixed", top: 0, left: 0, width: "100%", zIndex: 10 }}>
        <nav style={{ display: "flex", justifyContent: "center", gap: "20px", padding: "10px 0" }}>
          {[
                      { path: "/", icon: "mdi:home" },
                      { path: "/products", icon: "mdi:shopping" },
                      { path: "/cart", icon: "mdi:cart" },
                      { path: "/orders", icon: "mdi:package-variant-closed" },
                      { path: "/account", icon: "mdi:account" },
                      { path: "/addresses", icon: "mdi:map-marker" },
                    ].map((item) => (
                      <Link key={item.path} to={item.path} className="nav-link">
                        <Icon icon={item.icon} width="32" color={location.pathname === item.path ? "red" : "white"} />
                      </Link>
                    ))}
        </nav>
        
        {/* Barre utilisateur */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 20px" }}>
          <h1>🛍️ The Best Marker</h1>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Icon icon="mdi:account-circle" width="40" style={{ cursor: "pointer" }} />
            {user ? (
              <>
                <span style={{ marginLeft: "10px", fontSize: "16px" }}>{user.name}</span>
                <button onClick={handleLogout} style={{ marginLeft: "10px", backgroundColor: "red", color: "white", padding: "5px", borderRadius: "3px" }}>Disconnection</button>
              </>
            ) : (
              <button onClick={() => navigate("/login")} style={{ marginLeft: "10px", backgroundColor: "blue", color: "white", padding: "5px", borderRadius: "3px" }}>Login</button>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}

export default HomePage;


