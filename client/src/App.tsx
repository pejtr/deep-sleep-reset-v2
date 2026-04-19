import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminPage from "@/pages/Admin";
import CheckoutSuccessPage from "@/pages/CheckoutSuccess";
import MembersPage from "@/pages/Members";
import NotFound from "@/pages/NotFound";
import QuizPage from "@/pages/Quiz";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/quiz"} component={QuizPage} />
      <Route path={"/members"} component={MembersPage} />
      <Route path={"/admin"} component={AdminPage} />
      <Route path={"/checkout/success"} component={CheckoutSuccessPage} />
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
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
