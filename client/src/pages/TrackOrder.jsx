import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { api } from "../utils/api";
import toast from "react-hot-toast";
import Title from "../components/Title";
import { assets } from "../assets/data";

const TrackOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currency, user, getToken } = useAppContext();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (!user || !orderId) {
        navigate("/my-orders");
        return;
      }

      setLoading(true);
      try {
        let token = await getToken();
        let data = await api.getOrderById(orderId, token);

        // If unauthorized, try to refresh token
        if (data && data.status === 401) {
          try {
            token = await getToken({ template: 'default' });
            if (token) {
              data = await api.getOrderById(orderId, token);
            }
          } catch (refreshErr) {
            console.warn('Token refresh failed:', refreshErr);
          }
        }

        if (data && data.status === 401) {
          toast.error('Session expired. Please sign in again.');
          navigate("/my-orders");
          return;
        }

        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          toast.error('Order not found');
          navigate("/my-orders");
        }
      } catch (error) {
        console.error('Error loading order:', error);
        toast.error('Failed to load order details');
        navigate("/my-orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, user, getToken, navigate]);

  // Define order status stages
  const statusStages = [
    { key: 'pending', label: 'Order Placed', icon: '📦', description: 'Your order has been received' },
    { key: 'processing', label: 'Processing', icon: '⚙️', description: 'Your order is being prepared' },
    { key: 'shipped', label: 'Shipped', icon: '🚚', description: 'Your order is on the way' },
    { key: 'delivered', label: 'Delivered', icon: '✅', description: 'Your order has been delivered' },
    { key: 'cancelled', label: 'Cancelled', icon: '❌', description: 'Your order has been cancelled' },
  ];

  const getStatusIndex = (status) => {
    const index = statusStages.findIndex(stage => stage.key === status);
    return index >= 0 ? index : 0;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'shipped':
        return 'bg-purple-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-700';
      case 'processing':
        return 'text-blue-700';
      case 'shipped':
        return 'text-purple-700';
      case 'delivered':
        return 'text-green-700';
      case 'cancelled':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="max-padd-container py-16 pt-28 bg-primary">
        <Title title1={"Track"} title2={"Order"} titleStyles={"pb-10"} />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-padd-container py-16 pt-28 bg-primary">
        <Title title1={"Track"} title2={"Order"} titleStyles={"pb-10"} />
        <div className="bg-white p-6 rounded-lg text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <Link to="/my-orders" className="text-secondary hover:text-secondary-dark font-semibold">
            ← Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="max-padd-container py-16 pt-28 bg-primary">
      <Title title1={"Track"} title2={"Order"} titleStyles={"pb-10"} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Timeline */}
          <div className="bg-white p-6 rounded-lg">
            <h2 className="h3 mb-6">Order Status</h2>
            
            {/* Status Timeline */}
            <div className="relative">
              {statusStages.map((stage, index) => {
                // Skip cancelled stage if order is not cancelled
                if (stage.key === 'cancelled' && !isCancelled) return null;
                
                // For cancelled orders, only show cancelled status
                if (isCancelled && stage.key !== 'cancelled') return null;
                
                const isActive = isCancelled 
                  ? stage.key === 'cancelled'
                  : index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const isPast = index < currentStatusIndex && !isCancelled;
                
                return (
                  <div key={stage.key} className="relative pb-8 last:pb-0">
                    {/* Connection Line */}
                    {!isCancelled && index < statusStages.length - 2 && (
                      <div className={`absolute left-6 top-12 w-0.5 ${
                        isPast ? getStatusColor(order.status) : 'bg-gray-300'
                      }`} style={{ height: 'calc(100% - 2rem)' }}></div>
                    )}
                    
                    {/* Status Item */}
                    <div className="flex items-start gap-4">
                      {/* Icon Circle */}
                      <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                        isActive 
                          ? `${getStatusColor(order.status)} text-white shadow-lg scale-110` 
                          : 'bg-gray-200 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-opacity-50 ' + getStatusColor(order.status).replace('bg-', 'ring-') : ''}`}>
                        <span className="text-xl">{stage.icon}</span>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 pt-2">
                        <div className={`font-semibold text-lg mb-1 transition-colors ${
                          isActive ? getStatusTextColor(order.status) : 'text-gray-400'
                        }`}>
                          {stage.label}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{stage.description}</p>
                        {isCurrent && order.updatedAt && (
                          <div className="text-xs text-gray-500">
                            Updated: {new Date(order.updatedAt).toLocaleString()}
                          </div>
                        )}
                        {isPast && order.updatedAt && (
                          <div className="text-xs text-gray-500">
                            Completed: {new Date(order.updatedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tracking Number */}
            {order.trackingNumber && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                    <p className="font-mono font-semibold text-lg">{order.trackingNumber}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(order.trackingNumber);
                      toast.success('Tracking number copied!');
                    }}
                    className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white p-6 rounded-lg">
            <h2 className="h3 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => {
                  const product = item.product || {};
                  const productTitle = product.title || 'Product';
                  const productImages = product.images || [];
                  
                  return (
                    <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flexCenter bg-primary rounded-xl flex-shrink-0">
                        <img
                          src={productImages[0] || assets.uploadIcon}
                          alt={productTitle}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="h5 mb-2">{productTitle}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>Size: {item.size}</span>
                          <span>Quantity: {item.quantity}</span>
                          <span>Price: {currency}{item.price?.toFixed(2) || '0.00'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {currency}{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">No items found in this order</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          {/* Order Summary Card */}
          <div className="bg-white p-6 rounded-lg">
            <h2 className="h3 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono text-xs">{order._id?.slice(-8) || order.id?.slice(-8)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Order Date:</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold">{order.paymentMethod}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Status:</span>
                <span className={`font-semibold ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.isPaid ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span>{currency}{order.amount?.toFixed(2)}</span>
              </div>
              {order.shippingFee && (
                <div className="flex justify-between mb-2 text-sm text-gray-600">
                  <span>Shipping:</span>
                  <span>{currency}{order.shippingFee.toFixed(2)}</span>
                </div>
              )}
              {order.tax && order.tax > 0 && (
                <div className="flex justify-between mb-2 text-sm text-gray-600">
                  <span>Tax:</span>
                  <span>{currency}{order.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span>{currency}{order.totalAmount?.toFixed(2) || order.amount?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          {order.address && (
            <div className="bg-white p-6 rounded-lg">
              <h2 className="h3 mb-4">Delivery Address</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-semibold text-gray-900">
                  {order.address.firstName} {order.address.lastName}
                </p>
                <p>{order.address.street}</p>
                <p>
                  {order.address.city}, {order.address.state} {order.address.zipcode}
                </p>
                <p>{order.address.country}</p>
                {order.address.phone && (
                  <p className="mt-2">Phone: {order.address.phone}</p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-white p-6 rounded-lg">
            <Link
              to="/my-orders"
              className="block w-full text-center btn-secondary py-2 rounded-lg mb-3"
            >
              Back to My Orders
            </Link>
            <button
              onClick={() => window.print()}
              className="block w-full text-center btn-outline py-2 rounded-lg"
            >
              Print Order Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;

