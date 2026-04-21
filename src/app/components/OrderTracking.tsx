import { Package, Truck, CheckCircle, Clock } from 'lucide-react';

interface OrderTrackingProps {
  status: string;
  orderDate: string;
}

export default function OrderTracking({ status, orderDate }: OrderTrackingProps) {
  const stages = [
    { name: 'Pending', icon: Clock },
    { name: 'Processing', icon: Package },
    { name: 'Shipped', icon: Truck },
    { name: 'Delivered', icon: CheckCircle },
  ];

  const statusOrder = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const currentIndex = statusOrder.indexOf(status);

  const getStageStatus = (index: number) => {
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'pending';
  };

  const getStageClasses = (stageName: string, stageStatus: string) => {
    if (stageStatus === 'completed') {
      return 'bg-green-600 text-white';
    }
    if (stageStatus === 'current') {
      if (stageName === 'Pending') return 'bg-yellow-600 text-white ring-4 ring-yellow-100';
      if (stageName === 'Processing') return 'bg-blue-600 text-white ring-4 ring-blue-100';
      if (stageName === 'Shipped') return 'bg-purple-600 text-white ring-4 ring-purple-100';
      if (stageName === 'Delivered') return 'bg-green-600 text-white ring-4 ring-green-100';
    }
    return 'bg-gray-200 text-gray-400';
  };

  const getStatusColorClass = (statusName: string) => {
    if (statusName === 'Pending') return 'text-yellow-600';
    if (statusName === 'Processing') return 'text-blue-600';
    if (statusName === 'Shipped') return 'text-purple-600';
    if (statusName === 'Delivered') return 'text-green-600';
    return 'text-gray-600';
  };

  const getEstimatedDate = (stageName: string) => {
    const orderDateObj = new Date(orderDate);
    const daysToAdd = {
      'Pending': 0,
      'Processing': 1,
      'Shipped': 3,
      'Delivered': 5,
    }[stageName] || 0;

    const estimatedDate = new Date(orderDateObj);
    estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);

    return estimatedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="font-semibold mb-6">Order Tracking</h3>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200">
          <div
            className="h-full bg-green-600 transition-all duration-500"
            style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }}
          />
        </div>

        {/* Stages */}
        <div className="relative flex justify-between">
          {stages.map((stage, index) => {
            const stageStatus = getStageStatus(index);
            const Icon = stage.icon;

            return (
              <div key={stage.name} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all ${getStageClasses(stage.name, stageStatus)}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`text-xs font-medium mb-1 ${
                    stageStatus === 'current' ? 'text-black' : 'text-gray-600'
                  }`}
                >
                  {stage.name}
                </span>
                <span className="text-xs text-gray-500">{getEstimatedDate(stage.name)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Message */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm">
          <span className="font-medium">Current Status: </span>
          <span className={`${getStatusColorClass(status)} font-medium`}>{status}</span>
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {status === 'Pending' && 'Your order has been received and is awaiting processing.'}
          {status === 'Processing' && 'Your order is being prepared for shipment.'}
          {status === 'Shipped' && 'Your order is on its way to you!'}
          {status === 'Delivered' && 'Your order has been successfully delivered.'}
        </p>
      </div>
    </div>
  );
}
