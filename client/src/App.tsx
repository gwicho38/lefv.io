import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Layout from "@/components/layout/Layout";
import Landing from "@/pages/Landing";
import Writing from "@/pages/Writing";
import Arcade from "@/pages/Arcade";
import About from "@/pages/About";
import BlogPostPage from "@/pages/BlogPostPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/writing" component={Writing} />
        {/* Kept so existing links to the old index still land somewhere. */}
        <Route path="/blog" component={Writing} />
        <Route path="/arcade" component={Arcade} />
        <Route path="/about" component={About} />
        <Route path="/blog/:slug" component={BlogPostPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
