import { useState } from 'react';
import { CartProvider } from './components/CartContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import Header from './components/Header';
import ProductListing from './components/ProductListing';
import ProductDetails from './components/ProductDetails';
import CartPage from './components/CartPage';
import LoginPage from './components/LoginPage';
import Register from './components/Register';
import MultiStepCheckout from './components/MultiStepCheckout';
import UserProfile from './components/UserProfile';
import { Product } from './components/CartContext';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<'home' | 'product' | 'cart' | 'checkout' | 'profile' | 'login' | 'register'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setSelectedProduct(null);
  };

  const handleGoToCheckout = () => {
    if (!isAuthenticated) {
      setCurrentPage('login');
    } else {
      setCurrentPage('checkout');
    }
  };

  const handleNavigation = (page: 'home' | 'product' | 'cart' | 'checkout' | 'profile' | 'login' | 'register') => {
    // Protected routes check
    if ((page === 'checkout' || page === 'profile') && !isAuthenticated) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage(page);
  };

  const handleLoginSuccess = () => {
    setCurrentPage('home');
  };

  const handleRegisterSuccess = () => {
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onNavigate={handleNavigation}
        onToggleCart={() => setCurrentPage('cart')}
        onOpenLogin={() => setCurrentPage('login')}
      />

      <main>
        {currentPage === 'home' && (
          <ProductListing onViewProduct={handleViewProduct} />
        )}
        {currentPage === 'product' && selectedProduct && (
          <ProductDetails product={selectedProduct} onBack={handleBackToHome} />
        )}
        {currentPage === 'cart' && (
          <CartPage
            onBack={handleBackToHome}
            onCheckout={handleGoToCheckout}
            onOpenLogin={() => setCurrentPage('login')}
          />
        )}
        {currentPage === 'checkout' && isAuthenticated && (
          <MultiStepCheckout onBack={handleBackToHome} />
        )}
        {currentPage === 'profile' && isAuthenticated && (
          <UserProfile onBack={handleBackToHome} />
        )}
        {currentPage === 'login' && (
          <LoginPage
            onBack={handleBackToHome}
            onSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setCurrentPage('register')}
          />
        )}
        {currentPage === 'register' && (
          <Register
            onBack={handleBackToHome}
            onSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setCurrentPage('login')}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}