import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface OrderProcessingProps {
  onSuccess: (orderId: string) => void;
  onFailure: (error: string) => void;
  total: number;
}

type ProcessingStage =
  | 'processing'
  | 'verifying'
  | 'confirming'
  | 'success'
  | 'payment_failed'
  | 'validation_failed';

export default function OrderProcessing({ onSuccess, onFailure, total }: OrderProcessingProps) {
  const [stage, setStage] = useState<ProcessingStage>('processing');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Simulate order processing
    const processOrder = async () => {
      // Stage 1: Processing Order
      setStage('processing');
      setProgress(0);
      await simulateDelay(1500);
      setProgress(33);

      // Simulate random payment failure (10% chance)
      const paymentSuccess = Math.random() > 0.1;

      if (!paymentSuccess) {
        setStage('payment_failed');
        setErrorMessage('Payment declined. Please check your payment details and try again.');
        onFailure('Payment failed');
        return;
      }

      // Stage 2: Verifying Payment
      setStage('verifying');
      setProgress(33);
      await simulateDelay(1500);
      setProgress(66);

      // Simulate validation check
      const validationSuccess = Math.random() > 0.05;

      if (!validationSuccess) {
        setStage('validation_failed');
        setErrorMessage('Unable to verify order details. Please review your information and try again.');
        onFailure('Validation failed');
        return;
      }

      // Stage 3: Confirming Order
      setStage('confirming');
      setProgress(66);
      await simulateDelay(1500);
      setProgress(100);

      // Success
      setStage('success');
      const orderId = 'ORD-' + Date.now().toString(36).toUpperCase();
      await simulateDelay(800);
      onSuccess(orderId);
    };

    processOrder();
  }, [onSuccess, onFailure]);

  const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getStageIcon = () => {
    switch (stage) {
      case 'processing':
      case 'verifying':
      case 'confirming':
        return <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-600" />;
      case 'payment_failed':
        return <XCircle className="h-16 w-16 text-red-600" />;
      case 'validation_failed':
        return <AlertTriangle className="h-16 w-16 text-orange-600" />;
    }
  };

  const getStageTitle = () => {
    switch (stage) {
      case 'processing':
        return 'Processing Order';
      case 'verifying':
        return 'Verifying Payment';
      case 'confirming':
        return 'Confirming Order';
      case 'success':
        return 'Order Confirmed!';
      case 'payment_failed':
        return 'Payment Failed';
      case 'validation_failed':
        return 'Validation Error';
    }
  };

  const getStageMessage = () => {
    switch (stage) {
      case 'processing':
        return 'Please wait while we process your order...';
      case 'verifying':
        return 'Verifying your payment information...';
      case 'confirming':
        return 'Finalizing your order details...';
      case 'success':
        return 'Your order has been successfully placed!';
      case 'payment_failed':
      case 'validation_failed':
        return errorMessage;
    }
  };

  const isError = stage === 'payment_failed' || stage === 'validation_failed';
  const isSuccess = stage === 'success';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            {getStageIcon()}
          </div>

          <h2 className="text-2xl font-bold mb-2">{getStageTitle()}</h2>
          <p className="text-gray-600 mb-6">{getStageMessage()}</p>

          {!isError && !isSuccess && (
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">{progress}% Complete</p>
            </div>
          )}

          {!isError && !isSuccess && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className={stage === 'processing' ? 'text-blue-600 font-medium' : 'text-gray-600'}>
                  {stage === 'processing' && <Loader2 className="h-4 w-4 inline animate-spin mr-2" />}
                  Processing Order
                </span>
                {progress > 0 && <CheckCircle className="h-4 w-4 text-green-600" />}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={stage === 'verifying' ? 'text-blue-600 font-medium' : 'text-gray-600'}>
                  {stage === 'verifying' && <Loader2 className="h-4 w-4 inline animate-spin mr-2" />}
                  Verifying Payment
                </span>
                {progress > 33 && <CheckCircle className="h-4 w-4 text-green-600" />}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className={stage === 'confirming' ? 'text-blue-600 font-medium' : 'text-gray-600'}>
                  {stage === 'confirming' && <Loader2 className="h-4 w-4 inline animate-spin mr-2" />}
                  Confirming Order
                </span>
                {progress > 66 && <CheckCircle className="h-4 w-4 text-green-600" />}
              </div>
            </div>
          )}

          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800">
                {stage === 'payment_failed'
                  ? 'Your payment could not be processed. This may be due to insufficient funds, incorrect card details, or a temporary issue with your payment provider.'
                  : 'There was an issue validating your order. Please check all information is correct and try again.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
