import { ShoppingCart, Store, User, LogOut } from 'lucide-react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';

interface HeaderProps {
  onNavigate: (page: 'home' | 'product' | 'cart' | 'checkout' | 'profile' | 'login' | 'register') => void;
  onToggleCart: () => void;
  onOpenLogin: () => void;
}

export default function Header({ onNavigate, onToggleCart, onOpenLogin }: HeaderProps) {
  const { getCartCount } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const cartCount = getCartCount();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Store className="h-6 w-6" />
          <span className="font-semibold text-lg">ShopHub</span>
        </button>

        <nav className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-gray-600 transition-colors"
          >
            Shop
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 hover:text-gray-600 transition-colors"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:inline text-sm">{user?.name}</span>
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 hover:text-gray-600 transition-colors"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 hover:text-gray-600 transition-colors"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">Login</span>
            </button>
          )}

          <button
            onClick={onToggleCart}
            className="relative flex items-center gap-2 hover:text-gray-600 transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
