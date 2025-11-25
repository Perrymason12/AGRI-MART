import React, { useEffect, useState } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/data'

const Cart = () => {
  const { cartItems, products, currency, updateQuantity} = useAppContext()
  const [cartData , setCartData] = useState([])

  useEffect(() => {
    if(products.length > 0 && cartItems){
      const tempData = []
      for(const itemId in cartItems){
        // Safety check: ensure cartItems[itemId] is an object
        if(cartItems[itemId] && typeof cartItems[itemId] === 'object'){
          for(const size in cartItems[itemId]){
            // Safety check: ensure quantity is a valid number
            const quantity = cartItems[itemId][size];
            if(quantity && quantity > 0){
              tempData.push({
                _id: itemId,
                size: size,
              })
            }
          }
        }
      }
      setCartData(tempData)
    }
  }, [products, cartItems])

  const increment = (id, size)=>{
    if (!cartItems[id] || !cartItems[id][size]) {
      console.warn('Cannot increment: item not found in cart');
      return;
    }
    const currentQuantity = cartItems[id][size]
    updateQuantity(id, size , currentQuantity + 1)
  }

  const decrement = (id, size)=>{
    if (!cartItems[id] || !cartItems[id][size]) {
      console.warn('Cannot decrement: item not found in cart');
      return;
    }
    const currentQuantity = cartItems[id][size]
    if (currentQuantity > 1) {
      updateQuantity(id, size , currentQuantity - 1)
    }
    
  }

  const getPrice = (product, size) => {
    if (product.price instanceof Map) {
      return product.price.get(size);
    }
    return product.price[size] || product.price[Object.keys(product.price)[0]];
  };

  return products && cartItems ? (
    <div className='max-padd-container py-16 pt-28 bg-primary'>
      <div className='flex flex-col xl:flex-row gap-8 xl:gap-28'>
        {/*Left side */}
        <div className='flex flex-2 flex-col gap-3 text-[95%]'>
          <Title title1={"Cart"} title2={"Overview"} titleStyles={"pb-5"}/>
          <div className='hidden sm:grid grid-cols-[6fr_2fr_1fr] font-medium bg-white p-2 rounded-xl'>
            <h5 className='h5 text-left'>Product Details</h5>
            <h5 className='h5 text-center'>Subtotal</h5>
            <h5 className='h5 text-center'>Action</h5>
          </div>
          {cartData.map((item , i)=>{
            const product = products.find((p)=>p._id === item._id)
            if (!product) return null;
            
            // Safety check: ensure cartItems[item._id] exists before accessing size
            if (!cartItems[item._id] || !cartItems[item._id][item.size]) {
              return null;
            }
            
            const quantity = cartItems[item._id][item.size]
            const price = getPrice(product, item.size);
            
            // Safety check: ensure price exists
            if (!price) {
              console.warn(`Price not found for product ${item._id} size ${item.size}`);
              return null;
            }
            
            // Safety check: ensure product has images
            if (!product.images || !product.images.length) {
              console.warn(`No images found for product ${item._id}`);
              return null;
            }
            
            return (
              <div key={i} className='grid grid-cols-1 sm:grid-cols-[6fr_2fr_1fr] items-center bg-white p-3 sm:p-2 rounded-xl gap-3'>
                <div className='flex items-center gap-3 sm:gap-6'>
                  <div className='flex bg-primary rounded-xl flex-shrink-()'>
                    <img src={product.images[0]} alt={product.title || 'Product'} className='w-16 h-16 sm:w-20 sm:h-20 object-cover'/>
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h5 className='h5 line-clamp-2 sm:line-clamp-1'>{product.title}</h5>
                    <div className='bold-14 flexStart gap-2 mb-1'>Size: <p>{item.size}</p></div>
                    <div className='flexBetween items-center'>
                      <div className='flex items-center ring-1 ring-slate-900/15 rounded-full overflow-hidden bg-primary'>
                        <button onClick={()=> decrement(item._id, item.size)} className='p-1.5 bg-secondary text-white rounded-full shadow-md cursor-pointer'><img src={assets.minus} alt="" width={11} className='invert'/></button>
                        <p className="px-2">{quantity}</p>
                        <button onClick={()=> increment(item._id, item.size)} className='p-1.5 bg-secondary text-white rounded-full shadow-md cursor-pointer'><img src={assets.plus} alt="" width={11} className='invert'/></button>
                      </div>
                      <div className='sm:hidden bold-16'>
                        {currency}{(price * quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className='hidden sm:block text-center bold-16'>
                  {currency}{(price * quantity).toFixed(2)}
                </div>
                <button onClick={()=> updateQuantity(item._id, item.size, 0)} className='cursor-pointer mx-auto sm:mx-auto'><img src={assets.cartRemove} alt="" width={22}/></button>
              </div>
            )
          })}
        </div>
        {/*Right side */}
        <div className='flex flex-1 flex-col'>
          <div className='w-full max-w-[379px] mx-auto bg-white p-5 py-10 rounded-xl'>
            <CartTotal />
          </div>
        </div>
      </div>
    </div>
  ): null;
};

export default Cart;
