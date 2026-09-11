import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Welcome to Toonkit Playground</h1>
      <p>Try out the Toonkit parser and serializer in your browser</p>
      <Link to="/playground" style={{ display: "inline-block", marginTop: "1rem", padding: "0.5rem 1rem", background: "#0070f3", color: "white", textDecoration: "none", borderRadius: "4px" }}>Go to Playground</Link>
    </div>
  );
}