import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, Tag, Truck, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';

interface CartPageProps {
  onBack: () => void;
  onCheckout: () => void;
  onOpenLogin: () => void;
}

export default function CartPage({ onBack, onCheckout, onOpenLogin }: CartPageProps) {
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState('');

  const subtotal = getCartTotal();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const discount = appliedPromo ? subtotal * appliedPromo.discount : 0;
  const tax = (subtotal - discount) * 0.1;
  const total = subtotal - discount + shipping + tax;

  const validPromoCodes = {
    'SAVE10': 0.1,
    'SAVE20': 0.2,
    'WELCOME15': 0.15,
  };

  const handleApplyPromo = () => {
    setPromoError('');
    const upperCode = promoCode.toUpperCase();

    if (validPromoCodes[upperCode as keyof typeof validPromoCodes]) {
      setAppliedPromo({
        code: upperCode,
        discount: validPromoCodes[upperCode as keyof typeof validPromoCodes],
      });
      setPromoCode('');
    } else {
      setPromoError('Invalid promo code');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError('');
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      onOpenLogin();
    } else {
      onCheckout();
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gray-100 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-16 w-16 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added anything to your cart yet.
            Start shopping to fill it up!
          </p>
          <button
            onClick={onBack}
            className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={onBack} className="flex items-center gap-2 mb-6 hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Continue Shopping
      </button>

      <h1 className="text-3xl font-bold mb-8">Shopping Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-6">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-32 h-32 object-cover rounded-lg"
                />

                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.category}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">Quantity:</span>
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-6 py-2 border-x font-medium min-w-[60px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      {item.quantity >= item.stock && (
                        <span className="text-sm text-orange-600">Max stock reached</span>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600">Price</p>
                      <p className="text-2xl font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                      )}
                    </div>
                  </div>

                  {item.stock < 10 && (
                    <div className="mt-3 bg-orange-50 border border-orange-200 rounded px-3 py-2 text-sm text-orange-700">
                      Only {item.stock} left in stock!
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 text-sm hover:underline"
          >
            Clear entire cart
          </button>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

            {/* Promo Code Section */}
            <div className="mb-6 pb-6 border-b">
              <label className="block text-sm font-medium mb-2">Promo Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  disabled={!!appliedPromo}
                />
                <button
                  onClick={handleApplyPromo}
                  disabled={!promoCode || !!appliedPromo}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Apply
                </button>
              </div>
              {promoError && (
                <p className="text-red-600 text-xs mt-1">{promoError}</p>
              )}
              {appliedPromo && (
                <div className="mt-2 flex items-center justify-between bg-green-50 border border-green-200 rounded px-3 py-2">
                  <div className="flex items-center gap-2 text-green-700 text-sm">
                    <Tag className="h-4 w-4" />
                    <span className="font-medium">{appliedPromo.code}</span>
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    className="text-green-700 hover:text-green-800 text-xs underline"
                  >
                    Remove
                  </button>
                </div>
              )}
              <div className="mt-3 text-xs text-gray-600">
                <p className="font-medium mb-1">Available codes:</p>
                <p>• SAVE10 - 10% off</p>
                <p>• SAVE20 - 20% off</p>
                <p>• WELCOME15 - 15% off</p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal ({cart.length} items)</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>

              {appliedPromo && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({appliedPromo.code})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Truck className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Shipping</span>
                </div>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>

              {subtotal < 100 && subtotal > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-xs text-blue-700">
                  Add ${(100 - subtotal).toFixed(2)} more to get FREE shipping!
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>

              <div className="border-t pt-3 flex justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-black text-white py-4 rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2 mb-3"
            >
              {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
              <ArrowRight className="h-5 w-5" />
            </button>

            <button
              onClick={onBack}
              className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Continue Shopping
            </button>

            {/* Security Badges */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Secure Checkout</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                  </svg>
                  <span>Free Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
