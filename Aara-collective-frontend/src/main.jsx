import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { CartProviderComponent } from "./context/CartContext";
import { ClerkProvider } from "@clerk/clerk-react";

import { Toaster } from "@/components/ui/toaster";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.error("Missing VITE_CLERK_PUBLISHABLE_KEY in frontend/.env.local");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <CartProviderComponent>
          <App />
          <Toaster />
        </CartProviderComponent>
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>,
);
