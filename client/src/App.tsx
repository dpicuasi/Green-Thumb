import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";

import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import Garden from "@/pages/Garden";
import Dashboard from "@/pages/Dashboard";
import PlantDetail from "@/pages/PlantDetail";
import Subscription from "@/pages/Subscription";
import AIAdvisor from "@/pages/AIAdvisor";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <Navigation />
      <main className="flex-1 px-4 py-8 lg:p-10 lg:ml-64 overflow-x-hidden">
        <Switch>
          <Route path="/" component={Garden} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/plants/:id" component={PlantDetail} />
          <Route path="/subscription" component={Subscription} />
          <Route path="/ai-advisor" component={AIAdvisor} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
