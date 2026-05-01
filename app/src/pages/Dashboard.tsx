import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div style={styles.app}>
      <div style={styles.topbar}>
        <h2 style={styles.logo}>Sum7 Connect</h2>

        <div style={styles.topButtons}>
          <button style={styles.btn} onClick={() => navigate("/")}>
            🏠 Home
          </button>

          <button style={styles.btn} onClick={() => navigate("/")}>
            🚪 Logout
          </button>
        </div>
      </div>

      <div style={styles.container}>
        <div style={styles.side}>
          <h3>👥 Online Users</h3>
          <div style={styles.card}>User 1</div>
          <div style={styles.card}>User 2</div>
        </div>

        <div style={styles.center}>
          <h1>🔥 Start Chat</h1>

          <button style={styles.primary}>
            🎥 Start Video Match
          </button>

          <button style={styles.secondary}>
            💬 Start Text Match
          </button>
        </div>

        <div style={styles.side}>
          <h3>📸 Feed</h3>
          <div style={styles.card}>Someone joined</div>
          <div style={styles.card}>New match</div>
        </div>
      </div>
    </div>
  );
}

const styles: any = {
  app: {
    fontFamily: "Arial",
    background: "#0f0f0f",
    color: "white",
    height: "100vh",
  },

  topbar: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px",
    background: "#1a1a1a",
  },

  logo: { color: "#00ffcc" },

  topButtons: {
    display: "flex",
    gap: "10px",
  },

  container: {
    display: "flex",
    padding: "10px",
    gap: "10px",
    height: "calc(100% - 60px)",
  },

  side: {
    width: "20%",
    background: "#1a1a1a",
    padding: "10px",
    borderRadius: "10px",
  },

  center: {
    flex: 1,
    background: "#121212",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
  },

  card: {
    background: "#2a2a2a",
    padding: "10px",
    margin: "5px 0",
    borderRadius: "6px",
  },

  btn: {
    padding: "8px",
    background: "#333",
    color: "white",
    border: "none",
    borderRadius: "6px",
  },

  primary: {
    display: "block",
    margin: "10px auto",
    padding: "15px",
    background: "#00ffcc",
    border: "none",
    borderRadius: "10px",
    width: "80%",
  },

  secondary: {
    display: "block",
    margin: "10px auto",
    padding: "15px",
    background: "#ff3366",
    border: "none",
    borderRadius: "10px",
    width: "80%",
    color: "white",
  },
};
