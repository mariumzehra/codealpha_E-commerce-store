import { ArrowLeft, User, Mail, MapPin, Package, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from './AuthContext';
import OrderTracking from './OrderTracking';

interface UserProfileProps {
  onBack: () => void;
}

export default function UserProfile({ onBack }: UserProfileProps) {
  const { user, getUserOrders } = useAuth();
  const orders = getUserOrders();
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={onBack} className="flex items-center gap-2 mb-6 hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-semibold">Profile</h2>
                <p className="text-sm text-gray-600">Your information</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span>{user.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-semibold">Orders</h2>
                <p className="text-sm text-gray-600">Total purchases</p>
              </div>
            </div>
            <p className="text-3xl font-bold">{orders.length}</p>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 text-green-600 rounded-full w-12 h-12 flex items-center justify-center">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-semibold">Addresses</h2>
                <p className="text-sm text-gray-600">Saved locations</p>
              </div>
            </div>
            <p className="text-3xl font-bold">{user.savedAddresses?.length || 0}</p>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Order History</h2>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No orders yet</p>
              <p className="text-sm text-gray-400">Your order history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.reverse().map((order) => {
                const isExpanded = expandedOrders.includes(order.id);
                return (
                  <div key={order.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleOrderExpand(order.id)}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold">Order #{order.id}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(order.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">${order.total.toFixed(2)}</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                            order.status === 'Delivered'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'Shipped'
                              ? 'bg-purple-100 text-purple-800'
                              : order.status === 'Processing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t bg-gray-50 p-4 space-y-4">
                        {/* Order Tracking */}
                        <OrderTracking status={order.status} orderDate={order.date} />

                        {/* Order Items */}
                        <div className="bg-white border rounded-lg p-4">
                          <p className="text-sm font-medium mb-3">Order Items ({order.items.length}):</p>
                          <div className="space-y-3">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{item.name}</p>
                                  <p className="text-xs text-gray-600">{item.category}</p>
                                  <p className="text-xs text-gray-600">Quantity: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-medium">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white border rounded-lg p-4">
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="font-medium mb-1">Shipping Address:</p>
                              <p className="text-gray-600">{order.shippingAddress.fullName}</p>
                              <p className="text-gray-600">{order.shippingAddress.address}</p>
                              <p className="text-gray-600">
                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                              </p>
                              <p className="text-gray-600 mt-1">{order.shippingAddress.phone}</p>
                            </div>
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white border rounded-lg p-4">
                          <p className="font-medium mb-2">Order Summary</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subtotal:</span>
                              <span>${(order.total / 1.1).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tax:</span>
                              <span>${(order.total - order.total / 1.1).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-medium text-base pt-2 border-t">
                              <span>Total:</span>
                              <span>${order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
