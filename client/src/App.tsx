import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import MetaPixel from "@/components/MetaPixel";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Upsell1 from "./pages/Upsell1";
import Upsell2 from "./pages/Upsell2";
import ThankYou from "./pages/ThankYou";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/upsell-1"} component={Upsell1} />
      <Route path={"/upsell-2"} component={Upsell2} />
      <Route path={"/thank-you"} component={ThankYou} />
      <Route path={"/privacy"} component={PrivacyPolicy} />
      <Route path={"/terms"} component={Terms} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <MetaPixel />
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
