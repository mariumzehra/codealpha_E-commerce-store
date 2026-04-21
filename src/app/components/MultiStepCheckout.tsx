import { useState } from 'react';
import { ArrowLeft, ArrowRight, ShoppingCart, MapPin, CreditCard, FileText, CheckCircle, Package, Plus, Minus, AlertCircle } from 'lucide-react';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import OrderProcessing from './OrderProcessing';

interface MultiStepCheckoutProps {
  onBack: () => void;
}

export default function MultiStepCheckout({ onBack }: MultiStepCheckoutProps) {
  const { cart, getCartTotal, clearCart, updateQuantity } = useCart();
  const { user, addOrder } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [orderId, setOrderId] = useState('');
  const [showProcessing, setShowProcessing] = useState(false);
  const [processingError, setProcessingError] = useState('');

  const [shippingData, setShippingData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});
  const [shippingTouched, setShippingTouched] = useState<Record<string, boolean>>({});

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});
  const [paymentTouched, setPaymentTouched] = useState<Record<string, boolean>>({});

  const steps = [
    { number: 1, title: 'Cart Review', icon: ShoppingCart },
    { number: 2, title: 'Shipping', icon: MapPin },
    { number: 3, title: 'Payment', icon: CreditCard },
    { number: 4, title: 'Review', icon: FileText },
    { number: 5, title: 'Confirmation', icon: CheckCircle },
  ];

  const subtotal = getCartTotal();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const validateShipping = () => {
    const errors: Record<string, string> = {};

    if (!shippingData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (shippingData.fullName.trim().length < 2) {
      errors.fullName = 'Name must be at least 2 characters';
    }

    if (!shippingData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!shippingData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]{10,}$/.test(shippingData.phone)) {
      errors.phone = 'Invalid phone number';
    }

    if (!shippingData.address.trim()) {
      errors.address = 'Street address is required';
    }

    if (!shippingData.city.trim()) {
      errors.city = 'City is required';
    }

    if (!shippingData.state.trim()) {
      errors.state = 'State is required';
    }

    if (!shippingData.zipCode) {
      errors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(shippingData.zipCode)) {
      errors.zipCode = 'Invalid ZIP code format';
    }

    return errors;
  };

  const validatePayment = () => {
    const errors: Record<string, string> = {};

    if (!paymentData.cardNumber) {
      errors.cardNumber = 'Card number is required';
    } else if (!/^\d{13,19}$/.test(paymentData.cardNumber.replace(/\s/g, ''))) {
      errors.cardNumber = 'Invalid card number';
    }

    if (!paymentData.cardName.trim()) {
      errors.cardName = 'Cardholder name is required';
    }

    if (!paymentData.expiryDate) {
      errors.expiryDate = 'Expiry date is required';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentData.expiryDate)) {
      errors.expiryDate = 'Invalid format (MM/YY)';
    } else {
      const [month, year] = paymentData.expiryDate.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      if (expiry < new Date()) {
        errors.expiryDate = 'Card has expired';
      }
    }

    if (!paymentData.cvv) {
      errors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(paymentData.cvv)) {
      errors.cvv = 'Invalid CVV';
    }

    return errors;
  };

  const handleNextStep = () => {
    if (currentStep === 2) {
      const errors = validateShipping();
      setShippingErrors(errors);
      setShippingTouched({
        fullName: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
      });
      if (Object.keys(errors).length > 0) return;
    }

    if (currentStep === 3) {
      const errors = validatePayment();
      setPaymentErrors(errors);
      setPaymentTouched({
        cardNumber: true,
        cardName: true,
        expiryDate: true,
        cvv: true,
      });
      if (Object.keys(errors).length > 0) return;
    }

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlaceOrder = () => {
    setShowProcessing(true);
  };

  const handleProcessingSuccess = (newOrderId: string) => {
    setOrderId(newOrderId);

    // For demo purposes, randomly assign different statuses to show tracking
    const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    const order = {
      id: newOrderId,
      date: new Date().toISOString(),
      items: cart,
      shippingAddress: shippingData,
      total: total,
      status: randomStatus,
    };

    addOrder(order);
    setShowProcessing(false);
    setCurrentStep(5);

    setTimeout(() => {
      clearCart();
    }, 1000);
  };

  const handleProcessingFailure = (error: string) => {
    setProcessingError(error);
    setShowProcessing(false);
  };

  const handleRetryOrder = () => {
    setProcessingError('');
    setShowProcessing(true);
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step.number
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {currentStep > step.number ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span className="text-xs mt-2 hidden sm:block">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-1 flex-1 mx-2 ${
                  currentStep > step.number ? 'bg-black' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderCartReview = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Review Your Cart</h2>
      <p className="text-gray-600 mb-6">Review your items and adjust quantities before proceeding.</p>
      <div className="space-y-4 mb-6">
        {cart.map((item) => (
          <div key={item.id} className="flex gap-4 bg-gray-50 border rounded-lg p-4">
            <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded" />
            <div className="flex-1">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{item.category}</p>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Qty:</span>
                <div className="flex items-center border rounded-lg bg-white">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 hover:bg-gray-100 rounded-l-lg"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-1 border-x min-w-[50px] text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 hover:bg-gray-100 rounded-r-lg"
                    disabled={item.quantity >= item.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm font-medium">${item.price.toFixed(2)} each</span>
              </div>
            </div>
            <div className="font-semibold text-lg">${(item.price * item.quantity).toFixed(2)}</div>
          </div>
        ))}
      </div>
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping:</span>
          <span className={shipping === 0 ? 'text-green-600' : ''}>
            {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
          </span>
        </div>
        {shipping === 0 && <p className="text-sm text-green-600">Free shipping on orders over $100!</p>}
      </div>
      <button
        onClick={handleNextStep}
        className="w-full mt-6 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
      >
        Continue to Shipping
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );

  const handleShippingBlur = (field: string) => {
    setShippingTouched({ ...shippingTouched, [field]: true });
    const errors = validateShipping();
    setShippingErrors(errors);
  };

  const handleShippingChange = (field: string, value: string) => {
    setShippingData({ ...shippingData, [field]: value });
    if (shippingTouched[field]) {
      const errors = validateShipping();
      setShippingErrors(errors);
    }
  };

  const renderShippingForm = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
      <p className="text-gray-600 mb-6">Please enter your delivery address details.</p>
      <form className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name *</label>
            <input
              type="text"
              value={shippingData.fullName}
              onChange={(e) => handleShippingChange('fullName', e.target.value)}
              onBlur={() => handleShippingBlur('fullName')}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                shippingErrors.fullName && shippingTouched.fullName
                  ? 'border-red-500 focus:ring-red-500'
                  : 'focus:ring-black'
              }`}
              placeholder="John Doe"
            />
            {shippingErrors.fullName && shippingTouched.fullName && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {shippingErrors.fullName}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              value={shippingData.email}
              onChange={(e) => handleShippingChange('email', e.target.value)}
              onBlur={() => handleShippingBlur('email')}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                shippingErrors.email && shippingTouched.email
                  ? 'border-red-500 focus:ring-red-500'
                  : 'focus:ring-black'
              }`}
              placeholder="you@example.com"
            />
            {shippingErrors.email && shippingTouched.email && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {shippingErrors.email}
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Phone Number *</label>
          <input
            type="tel"
            value={shippingData.phone}
            onChange={(e) => handleShippingChange('phone', e.target.value)}
            onBlur={() => handleShippingBlur('phone')}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              shippingErrors.phone && shippingTouched.phone
                ? 'border-red-500 focus:ring-red-500'
                : 'focus:ring-black'
            }`}
            placeholder="+1 (555) 123-4567"
          />
          {shippingErrors.phone && shippingTouched.phone && (
            <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {shippingErrors.phone}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Street Address *</label>
          <input
            type="text"
            value={shippingData.address}
            onChange={(e) => handleShippingChange('address', e.target.value)}
            onBlur={() => handleShippingBlur('address')}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              shippingErrors.address && shippingTouched.address
                ? 'border-red-500 focus:ring-red-500'
                : 'focus:ring-black'
            }`}
            placeholder="123 Main Street, Apt 4B"
          />
          {shippingErrors.address && shippingTouched.address && (
            <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {shippingErrors.address}
            </div>
          )}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">City *</label>
            <input
              type="text"
              value={shippingData.city}
              onChange={(e) => handleShippingChange('city', e.target.value)}
              onBlur={() => handleShippingBlur('city')}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                shippingErrors.city && shippingTouched.city
                  ? 'border-red-500 focus:ring-red-500'
                  : 'focus:ring-black'
              }`}
              placeholder="New York"
            />
            {shippingErrors.city && shippingTouched.city && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {shippingErrors.city}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">State *</label>
            <input
              type="text"
              value={shippingData.state}
              onChange={(e) => handleShippingChange('state', e.target.value)}
              onBlur={() => handleShippingBlur('state')}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                shippingErrors.state && shippingTouched.state
                  ? 'border-red-500 focus:ring-red-500'
                  : 'focus:ring-black'
              }`}
              placeholder="NY"
            />
            {shippingErrors.state && shippingTouched.state && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {shippingErrors.state}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">ZIP Code *</label>
            <input
              type="text"
              value={shippingData.zipCode}
              onChange={(e) => handleShippingChange('zipCode', e.target.value)}
              onBlur={() => handleShippingBlur('zipCode')}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                shippingErrors.zipCode && shippingTouched.zipCode
                  ? 'border-red-500 focus:ring-red-500'
                  : 'focus:ring-black'
              }`}
              placeholder="10001"
            />
            {shippingErrors.zipCode && shippingTouched.zipCode && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {shippingErrors.zipCode}
              </div>
            )}
          </div>
        </div>
      </form>
      <div className="flex gap-4 mt-6">
        <button
          onClick={handlePreviousStep}
          className="flex-1 border border-black py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
        <button
          onClick={handleNextStep}
          className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          Continue to Payment
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  const handlePaymentBlur = (field: string) => {
    setPaymentTouched({ ...paymentTouched, [field]: true });
    const errors = validatePayment();
    setPaymentErrors(errors);
  };

  const handlePaymentChange = (field: string, value: string) => {
    let formattedValue = value;

    // Format card number with spaces
    if (field === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }

    // Format expiry date
    if (field === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
    }

    // Limit CVV
    if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setPaymentData({ ...paymentData, [field]: formattedValue });
    if (paymentTouched[field]) {
      const errors = validatePayment();
      setPaymentErrors(errors);
    }
  };

  const renderPaymentForm = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Payment Details</h2>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
        <p className="font-medium">This is a simulated payment form</p>
        <p>No real payment will be processed. Use test card: 4532 1234 5678 9010</p>
      </div>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Card Number *</label>
          <input
            type="text"
            placeholder="1234 5678 9012 3456"
            value={paymentData.cardNumber}
            onChange={(e) => handlePaymentChange('cardNumber', e.target.value)}
            onBlur={() => handlePaymentBlur('cardNumber')}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              paymentErrors.cardNumber && paymentTouched.cardNumber
                ? 'border-red-500 focus:ring-red-500'
                : 'focus:ring-black'
            }`}
            maxLength={19}
          />
          {paymentErrors.cardNumber && paymentTouched.cardNumber && (
            <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {paymentErrors.cardNumber}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Cardholder Name *</label>
          <input
            type="text"
            placeholder="JOHN DOE"
            value={paymentData.cardName}
            onChange={(e) => handlePaymentChange('cardName', e.target.value.toUpperCase())}
            onBlur={() => handlePaymentBlur('cardName')}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              paymentErrors.cardName && paymentTouched.cardName
                ? 'border-red-500 focus:ring-red-500'
                : 'focus:ring-black'
            }`}
          />
          {paymentErrors.cardName && paymentTouched.cardName && (
            <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {paymentErrors.cardName}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Expiry Date *</label>
            <input
              type="text"
              placeholder="MM/YY"
              value={paymentData.expiryDate}
              onChange={(e) => handlePaymentChange('expiryDate', e.target.value)}
              onBlur={() => handlePaymentBlur('expiryDate')}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                paymentErrors.expiryDate && paymentTouched.expiryDate
                  ? 'border-red-500 focus:ring-red-500'
                  : 'focus:ring-black'
              }`}
              maxLength={5}
            />
            {paymentErrors.expiryDate && paymentTouched.expiryDate && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {paymentErrors.expiryDate}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">CVV *</label>
            <input
              type="text"
              placeholder="123"
              value={paymentData.cvv}
              onChange={(e) => handlePaymentChange('cvv', e.target.value)}
              onBlur={() => handlePaymentBlur('cvv')}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                paymentErrors.cvv && paymentTouched.cvv
                  ? 'border-red-500 focus:ring-red-500'
                  : 'focus:ring-black'
              }`}
              maxLength={4}
            />
            {paymentErrors.cvv && paymentTouched.cvv && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {paymentErrors.cvv}
              </div>
            )}
          </div>
        </div>
      </form>
      <div className="flex gap-4 mt-6">
        <button
          onClick={handlePreviousStep}
          className="flex-1 border border-black py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
        <button
          onClick={handleNextStep}
          className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          Review Order
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  const renderOrderReview = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>

      <div className="space-y-6">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Shipping Address
          </h3>
          <p>{shippingData.fullName}</p>
          <p>{shippingData.address}</p>
          <p>
            {shippingData.city}, {shippingData.state} {shippingData.zipCode}
          </p>
          <p className="mt-2">{shippingData.email}</p>
          <p>{shippingData.phone}</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </h3>
          <p>Card ending in {paymentData.cardNumber.slice(-4)}</p>
          <p className="text-sm text-gray-600">{paymentData.cardName}</p>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Items ({cart.length})
          </h3>
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-6 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span className={shipping === 0 ? 'text-green-600' : ''}>
              {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tax (10%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="border-t pt-2 flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {processingError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-red-900 mb-1">Order Failed</h4>
              <p className="text-sm text-red-700 mb-3">{processingError}</p>
              <button
                onClick={handleRetryOrder}
                className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry Payment
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 mt-6">
        <button
          onClick={handlePreviousStep}
          className="flex-1 border border-black py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
        <button
          onClick={handlePlaceOrder}
          className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          Place Order
          <CheckCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center py-8">
      <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-16 w-16 text-green-600" />
      </div>
      <h2 className="text-3xl font-bold mb-4">Order Placed Successfully!</h2>
      <p className="text-gray-600 mb-6">
        Thank you for your purchase. Your order has been confirmed.
      </p>

      <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto mb-8">
        <p className="text-sm text-gray-600 mb-2">Order Number</p>
        <p className="text-2xl font-bold mb-4">{orderId}</p>
        <p className="text-sm text-gray-600 mb-2">Total Amount</p>
        <p className="text-3xl font-bold">${total.toFixed(2)}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto mb-8">
        <p className="text-sm text-blue-800">
          A confirmation email has been sent to <strong>{shippingData.email}</strong>
        </p>
      </div>

      <button
        onClick={onBack}
        className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
      >
        Continue Shopping
      </button>
    </div>
  );

  return (
    <>
      {showProcessing && (
        <OrderProcessing
          onSuccess={handleProcessingSuccess}
          onFailure={handleProcessingFailure}
          total={total}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {currentStep < 5 && (
          <button onClick={onBack} className="flex items-center gap-2 mb-6 hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Shopping
          </button>
        )}

        <div className="max-w-4xl mx-auto">
          {renderStepIndicator()}

          <div className="bg-white rounded-lg border p-8">
            {currentStep === 1 && renderCartReview()}
            {currentStep === 2 && renderShippingForm()}
            {currentStep === 3 && renderPaymentForm()}
            {currentStep === 4 && renderOrderReview()}
            {currentStep === 5 && renderConfirmation()}
          </div>
        </div>
      </div>
    </>
  );
}
