import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext.jsx";
import ClerkErrorBoundary from "./components/ClerkErrorBoundary.jsx";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

// Import your Publishable Keys
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Validate Clerk key format
if (!CLERK_PUBLISHABLE_KEY) {
  console.error("Missing Clerk Publishable Key. Please check your .env file.");
} else if (!CLERK_PUBLISHABLE_KEY.startsWith('pk_test_') && !CLERK_PUBLISHABLE_KEY.startsWith('pk_live_')) {
  console.warn("Clerk Publishable Key format may be incorrect. Should start with 'pk_test_' or 'pk_live_'");
  console.warn("Current key starts with:", CLERK_PUBLISHABLE_KEY.substring(0, 10));
}

// Initialize Stripe
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

createRoot(document.getElementById("root")).render(
  <ClerkErrorBoundary publishableKey={CLERK_PUBLISHABLE_KEY || ''}>
    <Elements stripe={stripePromise}>
    <BrowserRouter>
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </BrowserRouter>
    </Elements>
  </ClerkErrorBoundary>
);
