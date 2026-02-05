import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import CreateWedding from "./pages/CreateWedding";
import Dashboard from "./pages/Dashboard";
import WeddingPage from "./pages/WeddingPage";
import ManageWedding from "./pages/ManageWedding";
import UpgradePremium from "./pages/UpgradePremium";
import EditPremium from "./pages/EditPremium";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import EditWedding from "./pages/EditWedding";
import PremiumBlocks from "./pages/PremiumBlocks";
import RSVPDashboard from "./pages/RSVPDashboard";
import SelectTemplate from "./pages/SelectTemplate";
import BlogList from "./pages/BlogList";
import BlogPost from "./pages/BlogPost";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Features from "./pages/Features";
import OnlineInvitation from "./pages/OnlineInvitation";
import PremiumDashboard from "./pages/PremiumDashboard";
import CreateAI from "./pages/CreateAI";
import EditAI from "./pages/EditAI";
import ManageAI from "./pages/ManageAI";
import AIPaymentSuccess from "./pages/AIPaymentSuccess";
import AIPaymentFailure from "./pages/AIPaymentFailure";
import AdminPanel from "./pages/AdminPanel";
import ClassicEditor from "./pages/ClassicEditor";
import Onboarding from "./pages/Onboarding";
import JivoChat from "./components/JivoChat";

// Redirect component for old/invalid URLs
function RedirectToHome() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation("/", { replace: true });
  }, [setLocation]);
  return null;
}

// Validate slug - only allow alphanumeric, dashes, and underscores
function isValidSlug(slug: string): boolean {
  if (!slug || slug.length > 100) return false;
  // Allow only: a-z, 0-9, dash, underscore
  return /^[a-zA-Z0-9\-_]+$/.test(slug);
}

// Wrapper for WeddingPage that validates slug
function WeddingPageWrapper() {
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  const slug = location.slice(1); // Remove leading /
  const isValid = isValidSlug(slug);
  
  // Invalid slug - redirect to home
  useEffect(() => {
    if (!isValid) {
      setLocation("/", { replace: true });
    }
  }, [isValid, setLocation]);
  
  if (!isValid) {
    return null;
  }
  
  return <WeddingPage />;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      {/* Redirects for old indexed URLs from previous domain */}
      <Route path="/kk/:rest*" component={RedirectToHome} />
      <Route path="/ru/:rest*" component={RedirectToHome} />
      <Route path="/start" component={Onboarding} />
      <Route path="/create-ai" component={CreateAI} />
      <Route path="/edit-ai/:id" component={EditAI} />
      <Route path="/manage-ai/:slug" component={ManageAI} />
      <Route path="/create" component={CreateWedding} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/manage/:slug" component={ManageWedding} />
      <Route path="/edit/:id" component={EditWedding} />
      <Route path="/classic-editor/:id" component={ClassicEditor} />
      <Route path="/premium-blocks/:id" component={PremiumBlocks} />
      <Route path="/rsvp-dashboard/:id" component={RSVPDashboard} />
      <Route path="/select-template/:id" component={SelectTemplate} />
      <Route path="/blog" component={BlogList} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/features" component={Features} />
      <Route path="/online-invitation/:eventType" component={OnlineInvitation} />
      <Route path="/upgrade/:weddingId" component={UpgradePremium} />
      <Route path="/premium-dashboard/:slug" component={PremiumDashboard} />
      <Route path="/edit-premium/:slug" component={EditPremium} />
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/payment/failure" component={PaymentFailure} />
      <Route path="/payment/ai-success" component={AIPaymentSuccess} />
      <Route path="/payment/ai-topup-success" component={AIPaymentSuccess} />
      <Route path="/payment/ai-failure" component={AIPaymentFailure} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/:slug" component={WeddingPageWrapper} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider
          defaultTheme="light"
          // switchable
        >
          <TooltipProvider>
            <Toaster />
            <Router />
            <JivoChat />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
