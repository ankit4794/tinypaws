import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ProductsPage from "@/pages/products-page";
import ProductDetailPage from "@/pages/product-detail-page";
import CartPage from "@/pages/cart-page";
import AboutPage from "@/pages/about-page";
import ContactPage from "@/pages/contact-page";
import PrivacyPage from "@/pages/privacy-policy";
import TermsPage from "@/pages/terms-page";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ProtectedRoute } from "@/lib/protected-route";

// Import admin login page
import AdminLoginPage from "./pages/admin/login-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/products/:category" component={ProductsPage} />
      <Route path="/products/:category/:subcategory" component={ProductsPage} />
      <Route path="/product/:id" component={ProductDetailPage} />
      <ProtectedRoute path="/cart" component={CartPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/privacy-policy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      
      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLoginPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Router />
        </main>
        <Footer />
      </div>
    </TooltipProvider>
  );
}

export default App;
