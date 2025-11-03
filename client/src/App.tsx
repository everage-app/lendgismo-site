import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Overview from "@/pages/Overview";
import NotFound from "@/pages/not-found";
import Privacy from "@/pages/legal/Privacy";
import Terms from "@/pages/legal/Terms";
import License from "@/pages/legal/License";
import PrivacyChoices from "@/pages/legal/PrivacyChoices";
import DMCA from "@/pages/legal/DMCA";
import DPA from "@/pages/legal/DPA";
import Cookies from "@/pages/legal/Cookies";
import DocsHome from "@/pages/DocsHome";
import DocViewer from "@/pages/DocViewer";
import IntegrationsDemo from "@/pages/IntegrationsDemo";
import DocsIntegrationsDemo from "@/pages/DocsIntegrationsDemo";

function Redirect({ to }: { to: string }) {
  const [, navigate] = useLocation();
  useEffect(() => { navigate(to); }, [to]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/overview" component={Overview} />
    <Route path="/docs" component={DocsHome} />
    <Route path="/docs/" component={DocsHome} />
    <Route path="/docs/demo/integrations" component={DocsIntegrationsDemo} />
    <Route path="/docs/:slug+" component={DocViewer} />
      <Route path="/demo/integrations" component={() => <Redirect to="/docs/demo/integrations" />} />
      <Route path="/legal/privacy" component={Privacy} />
  <Route path="/legal/privacy-choices" component={PrivacyChoices} />
      <Route path="/legal/terms" component={Terms} />
      <Route path="/legal/license" component={License} />
  <Route path="/legal/dmca" component={DMCA} />
  <Route path="/legal/dpa" component={DPA} />
  <Route path="/legal/cookies" component={Cookies} />
      <Route component={NotFound} />
    </Switch>
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
