import { Switch, Route, useLocation } from "wouter";
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
import AdminHeader from "@/components/layout/AdminHeader";
import AdminFooter from "@/components/layout/AdminFooter";
import { ProtectedRoute } from "@/lib/protected-route";
import { AdminProtectedRoute } from "@/lib/admin-protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { AdminAuthProvider } from "@/hooks/use-admin-auth";

// Import admin pages
import AdminLoginPage from "./pages/admin/login";
import AdminDashboard from "./pages/admin/index";
import AdminDashboardPage from "./pages/admin/dashboard";
import HelpdeskPage from "./pages/admin/helpdesk/index"; // Using folder-based implementation
import PincodesPage from "./pages/admin/pincodes";
import ReviewsPage from "./pages/admin/reviews/index"; // Using folder-based implementation
import ProductsManagement from "./pages/admin/products";
import OrdersManagement from "./pages/admin/orders";
import CustomersManagement from "./pages/admin/customers";
import CategoriesManagement from "./pages/admin/categories";
import BrandsManagement from "./pages/admin/brands";
import CmsPages from "./pages/admin/cms";
import CreateCmsPage from "./pages/admin/cms/create";
import EditCmsPage from "./pages/admin/cms/edit/[id]";
import NewsletterPage from "./pages/admin/newsletter";
import ContactMessagesPage from "./pages/admin/contact-messages";
import PromotionsPage from "./pages/admin/promotions";
import SettingsPage from "./pages/admin/settings";
import CreatePromotionPage from "./pages/admin/promotions/create";
import EditPromotionPage from "./pages/admin/promotions/edit/[id]";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/products/:category" component={ProductsPage} />
      <Route path="/products/:category/:subcategory" component={ProductsPage} />
      <Route path="/product/slug/:slug" component={ProductDetailPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/privacy-policy" component={PrivacyPage} />
      <Route path="/terms" component={TermsPage} />
      
      {/* Admin routes */}
      <Route path="/admin/login" component={AdminLoginPage} />
      <AdminProtectedRoute path="/admin" component={AdminDashboard} />
      <AdminProtectedRoute path="/admin/dashboard" component={AdminDashboardPage} />
      <AdminProtectedRoute path="/admin/helpdesk" component={HelpdeskPage} /> {/* Using folder-based implementation */}
      <AdminProtectedRoute path="/admin/pincodes" component={PincodesPage} />
      <AdminProtectedRoute path="/admin/reviews" component={ReviewsPage} /> {/* Using folder-based implementation */}
      <AdminProtectedRoute path="/admin/products" component={ProductsManagement} />
      <AdminProtectedRoute path="/admin/orders" component={OrdersManagement} />
      <AdminProtectedRoute path="/admin/customers" component={CustomersManagement} />
      <AdminProtectedRoute path="/admin/categories" component={CategoriesManagement} />
      <AdminProtectedRoute path="/admin/brands" component={BrandsManagement} />
      <AdminProtectedRoute path="/admin/cms" component={CmsPages} />
      <AdminProtectedRoute path="/admin/cms/create" component={CreateCmsPage} />
      <AdminProtectedRoute path="/admin/cms/edit/:id" component={EditCmsPage} />
      <AdminProtectedRoute path="/admin/newsletter" component={NewsletterPage} />
      <AdminProtectedRoute path="/admin/settings" component={SettingsPage} />
      <AdminProtectedRoute path="/admin/contact-messages" component={ContactMessagesPage} />
      <AdminProtectedRoute path="/admin/promotions" component={PromotionsPage} />
      <AdminProtectedRoute path="/admin/promotions/create" component={CreatePromotionPage} />
      <AdminProtectedRoute path="/admin/promotions/edit/:id" component={EditPromotionPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  
  // Check if the current path is an admin route
  const isAdminRoute = location.startsWith('/admin');
  
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <TooltipProvider>
          <Toaster />
          <div className="flex flex-col min-h-screen">
            {/* Only add header/footer for non-admin pages, as admin pages use AdminLayout */}
            {!isAdminRoute && <Header />}
            <main className={`flex-grow ${!isAdminRoute ? '' : 'w-full'}`}>
              <Router />
            </main>
            {!isAdminRoute && <Footer />}
          </div>
        </TooltipProvider>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

export default App;
