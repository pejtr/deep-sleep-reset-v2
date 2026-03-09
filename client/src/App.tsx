import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import MetaPixel from "@/components/MetaPixel";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import SocialProofToast from "@/components/SocialProofToast";
import StarField from "@/components/StarField";
import SalesChatbot from "@/components/SalesChatbot";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import Upsell1 from "./pages/Upsell1";
import Upsell2 from "./pages/Upsell2";
import ThankYou from "./pages/ThankYou";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Affiliates from "./pages/Affiliates";
import OrderBump from "./pages/OrderBump";
import Admin from "./pages/Admin";

function Router() {
  // make sure to consider if you need authentication for certain routes
  // English routes (default)
  // Spanish routes use /es prefix
  return (
    <Switch>
      {/* English routes */}
      <Route path={"/"} component={Home} />
      <Route path={"/order"} component={OrderBump} />
      <Route path={"/upsell-1"} component={Upsell1} />
      <Route path={"/upsell-2"} component={Upsell2} />
      <Route path={"/thank-you"} component={ThankYou} />
      <Route path={"/privacy"} component={PrivacyPolicy} />
      <Route path={"/terms"} component={Terms} />
      <Route path={"/affiliates"} component={Affiliates} />

      {/* Spanish routes — same components, language detected from URL */}
      <Route path={"/es"} component={Home} />
      <Route path={"/es/upsell-1"} component={Upsell1} />
      <Route path={"/es/upsell-2"} component={Upsell2} />
      <Route path={"/es/thank-you"} component={ThankYou} />
      <Route path={"/es/privacy"} component={PrivacyPolicy} />
      <Route path={"/es/terms"} component={Terms} />
      <Route path={"/es/affiliates"} component={Affiliates} />

      <Route path={"/admin"} component={Admin} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <LanguageProvider>
          <TooltipProvider>
            <StarField count={50} />
            <MetaPixel />
            <ExitIntentPopup />
            <StickyMobileCTA />
            <SocialProofToast />
            <SalesChatbot />
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
