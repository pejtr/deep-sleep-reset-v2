import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import QuizResult from "./pages/QuizResult";
import Order from "./pages/Order";
import Upsell1 from "./pages/Upsell1";
import Upsell2 from "./pages/Upsell2";
import Upsell3 from "./pages/Upsell3";
import ThankYou from "./pages/ThankYou";
import Admin from "./pages/Admin";
import Premium from "./pages/Premium";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/quiz" component={Quiz} />
      <Route path="/result" component={QuizResult} />
      <Route path="/order" component={Order} />
      <Route path="/upsell/1" component={Upsell1} />
      <Route path="/upsell/2" component={Upsell2} />
      <Route path="/upsell/3" component={Upsell3} />
      <Route path="/thank-you" component={ThankYou} />
      <Route path="/admin" component={Admin} />
      <Route path="/premium" component={Premium} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster richColors position="bottom-left" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
