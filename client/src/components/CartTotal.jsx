import React, {useEffect, useState} from 'react'
import toast from 'react-hot-toast'
import { useAppContext } from '../context/AppContext'
import { api } from '../utils/api'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import StripePaymentForm from './StripePaymentForm'

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) 
  : null

const CartTotal = () => {
  const{
    navigate,
    user,
    currency,
    method,
    setMethod,
    delivery_charges,
    getCartCount,
    getCartAmount,
    addresses,
    loadAddresses,
    getToken
  } = useAppContext()

  const [showAddress, setShowAddress] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [loading, setLoading] = useState(false)
  // paymentIntent id is not needed client-side for display; keep clientSecret only
  const [clientSecret, setClientSecret] = useState(null)
  const [processing, setProcessing] = useState(false)
  // Note: paymentIntent ID is retrieved from paymentIntentResult.id in handleStripePaymentSuccess

  useEffect(() => {
    if (user && addresses.length > 0) {
      const defaultAddr = addresses.find(addr => addr.isDefault) || addresses[0]
      setSelectedAddress(defaultAddr)
    }
  }, [addresses, user])

  useEffect(() => {
    if (user) {
      loadAddresses()
    }
  }, [user])

  // Create payment intent when Stripe method is selected
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (method === 'stripe' && selectedAddress && user && !clientSecret) {
        try {
          let token = await getToken()
          let paymentData = await api.createPaymentIntent(selectedAddress._id, token)
          
          // If unauthorized, try to refresh token
          if (paymentData && paymentData.status === 401) {
            try {
              token = await getToken({ template: 'default' })
              if (token) {
                paymentData = await api.createPaymentIntent(selectedAddress._id, token)
              }
            } catch (refreshErr) {
              console.warn('Token refresh failed:', refreshErr)
            }
          }
          
          if (paymentData && paymentData.status === 401) {
            toast.error('Session expired. Please sign in again.')
            setMethod('COD')
            return
          }
          
          if (paymentData.success) {
            setClientSecret(paymentData.clientSecret)
            // paymentIntent ID will be retrieved from paymentIntentResult.id after payment
          }
        } catch (error) {
          console.error('Error creating payment intent:', error)
          toast.error('Failed to initialize payment')
        }
      } else if (method !== 'stripe') {
        setClientSecret(null)
      }
    }

    createPaymentIntent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, selectedAddress, user, clientSecret])

  const handleStripePaymentSuccess = async (paymentIntentResult) => {
    try {
      let token = await getToken()
      let orderData = await api.createOrder({
        addressId: selectedAddress._id,
        paymentMethod: 'stripe',
        paymentIntentId: paymentIntentResult.id
      }, token)

      // If unauthorized, try to refresh token
      if (orderData && orderData.status === 401) {
        try {
          token = await getToken({ template: 'default' })
          if (token) {
            orderData = await api.createOrder({
              addressId: selectedAddress._id,
              paymentMethod: 'stripe',
              paymentIntentId: paymentIntentResult.id
            }, token)
          }
        } catch (refreshErr) {
          console.warn('Token refresh failed:', refreshErr)
        }
      }

      if (orderData && orderData.status === 401) {
        toast.error('Session expired. Please sign in again.')
        navigate('/sign-in')
        return
      }

      if (orderData.success) {
        toast.success("Order placed successfully!")
        navigate('/my-orders')
      } else {
        toast.error(orderData.message || "Failed to create order")
      }
    } catch (error) {
      toast.error(error.message || "Failed to create order")
    }
  }

  const handleStripePaymentError = (error) => {
    console.error('Payment error:', error)
    setProcessing(false)
  }

  const handleOrder = async () => {
    if (!user) {
      toast.error("Please sign in to place an order")
      navigate('/sign-in')
      return
    }
    if (!selectedAddress) {
      toast.error("Please select or add an address")
      return
    }
    if (getCartCount() === 0) {
      toast.error("Your cart is empty")
      return
    }

    // For COD, proceed directly
    if (method === 'COD') {
      setLoading(true)
      try {
        let token = await getToken()
        let orderData = await api.createOrder({
          addressId: selectedAddress._id,
          paymentMethod: 'COD'
        }, token)

        // If unauthorized, try to refresh token
        if (orderData && orderData.status === 401) {
          try {
            token = await getToken({ template: 'default' })
            if (token) {
              orderData = await api.createOrder({
                addressId: selectedAddress._id,
                paymentMethod: 'COD'
              }, token)
            }
          } catch (refreshErr) {
            console.warn('Token refresh failed:', refreshErr)
          }
        }

        if (orderData && orderData.status === 401) {
          toast.error('Session expired. Please sign in again.')
          navigate('/sign-in')
          return
        }

        if (orderData.success) {
          toast.success("Order placed successfully!")
          navigate('/my-orders')
        } else {
          toast.error(orderData.message || "Failed to place order")
        }
      } catch (error) {
        toast.error(error.message || "Failed to place order")
      } finally {
        setLoading(false)
      }
    }
    // For Stripe, payment form will handle the order creation
  }

  return (
    <div>
      <h3 className="bold-22">Order Details <span className="bold-14 text-secondary">({getCartCount()}) Items</span></h3>
      <hr className='border-gray-300 my-5'/>
      {/*payment && addresses */}
      <div className='mb-5'>
        <div className='my-5'>
          <h4 className='h4 mb-5'>Where to ship your order?</h4>
          <div className='relative flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mt-2'>
            <p className='text-sm sm:text-base'>{selectedAddress? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}`: "No address found"}</p>
            <div className='flex gap-2'>
              <button type="button" className='text-secondary medium-14 hover:underline cursor-pointer' onClick={()=>setShowAddress(!showAddress)}>Change</button>
              <button type="button" className='text-secondary medium-14 hover:underline cursor-pointer' onClick={()=>{navigate('/address-form'); scrollTo(0,0)}}>Add New</button>
            </div>
            {showAddress && addresses.length > 0 && (
              <div className='absolute top-10 left-0 right-0 z-10 py-1 bg-white ring-1 ring-slate-900/10 text-sm rounded shadow-lg max-h-48 overflow-y-auto'>
                {addresses.map((address,index)=>(
                  <p key={address._id || index} onClick={()=>{setSelectedAddress(address); setShowAddress(false)}} className='p-2 cursor-pointer hover:bg-gray-100 medium-14' >
                    {address.street}, {address.city}, {address.state}, {address.country}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
        <hr className='border-gray-300 mt-5' />
        <div className='my-6'>
          <h4 className='h4 mb-5'>Payment Method</h4>
          <div className='flex flex-wrap gap-3 cursor-pointer'>
            <button 
              type="button"
              onClick={()=>setMethod("COD")} 
              className={`${method === "COD" ? "btn-secondary":"btn-outline"} py-2 px-4 text-xs sm:text-sm rounded-lg transition-colors`}
            >
              Cash On Delivery
            </button> 
            <button 
              type="button"
              onClick={()=>setMethod("stripe")}
              className={`${method === "stripe" ? "btn-secondary":"btn-outline"} py-2 px-4 text-xs sm:text-sm rounded-lg transition-colors`}
            >
              Card Payment
            </button> 
          </div>
        </div>
        <hr className='border-gray-300 mt-5' />
      </div>
      
      {/* Stripe Payment Form */}
      {method === 'stripe' && clientSecret && stripePromise && (
        <div className='mb-5'>
          <h4 className='h4 mb-4'>Payment Details</h4>
          <Elements 
            stripe={stripePromise} 
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#4CAF50',
                  colorBackground: '#ffffff',
                  colorText: '#1a1a1a',
                  colorDanger: '#df1b41',
                  fontFamily: 'system-ui, sans-serif',
                  spacingUnit: '4px',
                  borderRadius: '8px',
                },
              },
            }}
          >
            <StripePaymentForm
              clientSecret={clientSecret}
              onSuccess={handleStripePaymentSuccess}
              onError={handleStripePaymentError}
              loading={loading || processing}
              setProcessing={setProcessing}
            />
          </Elements>
        </div>
      )}
      <div className='mt-4 space-y-2'>
        <div className='flex justify-between'>
            <h5 className='h5'>Price</h5>
            <p className="font-bold">{currency}{getCartAmount()}</p>
        </div>
        <div className='flex justify-between'>
            <h5 className='h5'>Shipping Fee</h5>
            <p className="font-bold">{currency}{getCartAmount() === 0 ? "0.00" : `${delivery_charges}.00`}</p>
        </div>
        <div className='flex justify-between'>
            <h5 className='h5'>Tax (2%) </h5>
            <p className="font-bold">{currency}{(getCartAmount() * 2) / 100}</p>
        </div>
        <div className='flex justify-between text-lg font-medium mt-3'>
            <h4 className='h4'>Total Amount </h4>
            <p className="bold-18">{currency}{getCartAmount() === 0 ? "0.00" : getCartAmount() + delivery_charges + (getCartAmount() * 2) / 100}</p>
        </div>
      </div>
      {/* Show COD button only for COD method */}
      {method === 'COD' && (
        <button 
          onClick={handleOrder} 
          disabled={loading || !selectedAddress || getCartCount() === 0}
          className='btn-dark w-full mt-8 rounded-md disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {loading ? "Processing..." : "Proceed to Order"}
        </button>
      )}
      
      {/* Info message for Stripe */}
      {method === 'stripe' && !clientSecret && (
        <div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md'>
          <p className='text-sm text-yellow-800'>
            {!selectedAddress 
              ? 'Please select an address to proceed with payment'
              : 'Initializing payment...'}
          </p>
        </div>
      )}
    </div>
  )
}

export default CartTotal
