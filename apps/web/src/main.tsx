import { createRoot } from "react-dom/client";
import App from "./App.js";
import "./index.css";

console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL);

createRoot(document.getElementById("root")!).render(<App />);
