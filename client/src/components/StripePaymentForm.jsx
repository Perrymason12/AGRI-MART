import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

const StripePaymentForm = ({ onSuccess, onError, loading, setProcessing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/my-orders',
        },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        onError(error);
        setIsProcessing(false);
        setProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        onSuccess(paymentIntent);
        setIsProcessing(false);
        setProcessing(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('An error occurred during payment');
      onError(err);
      setIsProcessing(false);
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-white p-4 rounded-lg ring-1 ring-slate-900/10">
        <PaymentElement 
          options={{
            layout: 'tabs',
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || !elements || isProcessing || loading}
        className="btn-dark w-full rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing || loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

export default StripePaymentForm;

