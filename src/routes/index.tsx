import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "../logo.svg";
import "../App.css";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/routes/index.tsx</code> and save to reload.
        </p>
        <Link to="/algorithms">Algorithms</Link>
      </header>
    </div>
  );
}
