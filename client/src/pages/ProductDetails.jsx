import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductDescription from "../components/ProductDescription";
import ProductFeatures from "../components/ProductFeatures";
import RelatedProducts from "../components/RelatedProducts";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/data";
import Item from "../components/Item";
import toast from "react-hot-toast";

const ProductDetails = () => {
  const { products, currency, addToCart } = useAppContext();
  const [image, setImage] = useState(null);
  const [size, setSize] = useState(null);

  const { productId } = useParams();

  const product = products.find((item) => item._id === productId);
  

  useEffect(() => {
    if (product) {
      setImage(product.images && product.images.length > 0 ? product.images[0] : null);
      if (product.sizes && product.sizes.length > 0) {
        setSize(product.sizes[0]);
      } else {
        setSize(null);
      }
    }
  }, [product]);
  return (
    product && (
        <div className="max-padd-container pt-20">
          {/* Product Data */}
          <div className="flex flex-col xl:flex-row gap-10 mt-3 mb-6">
            {/* Images Section */}
            <div className="flex flex-col xl:flex-row flex-1 gap-4 xl:gap-x-6 max-w-[600px] xl:max-w-[533px]">
              <div className="flex xl:flex-col flex-row gap-2 xl:gap-[7px] flex-wrap xl:w-24">
                {product.images.map((item, i) => (
                  <div key={i} className={`bg-primary rounded-xl p-1 cursor-pointer border ${image === item ? 'border-primary-dark' : 'border-transparent'}` }>
                    <img
                      onClick={() => setImage(item)}
                      src={item}
                      alt="productImg"
                      className="object-cover aspect-square w-16 h-16 xl:w-20 xl:h-20 rounded-lg transition-all duration-200 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
              <div className="flex-1 flex items-center justify-center bg-primary rounded-2xl p-4 min-h-[250px] xl:min-h-[350px]">
                <img src={image} alt="Main product" className="object-contain w-full h-full rounded-xl" />
              </div>
            </div>
            {/* Product Info Section */}
            <div className="flex-1 px-5 py-6 bg-primary rounded-2xl flex flex-col justify-between min-w-[300px]">
              <h3 className="h3 mb-2 text-secondary font-bold">{product.title}</h3>
              {/* Rating & Price */}
              <div className="flex items-center gap-x-2 pt-2 mb-2">
                <div className="flex gap-x-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <img key={i} src={assets.star} alt="star" width={19} />
                  ))}
                </div>
                <p className="medium-14 text-gray-500">(222)</p>
              </div>
              <div className="h4 flex items-baseline gap-4 my-2">
                <h3 className="h3 text-secondary">
                  {currency}
                  {(() => {
                    if (!size) return '0';
                    if (product.price instanceof Map) {
                      return product.price.get(size) || '0';
                    }
                    return product.price[size] || '0';
                  })()}.00
                </h3>
              </div>
              <p className="max-w-[555px] mb-3 text-gray-700">{product.description}</p>
              <div className="flex flex-col gap-4 my-4 mb-5">
                {product.sizes && product.sizes.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {[...product.sizes].map((item, i) => (
                      <button
                        key={i}
                        onClick={() => setSize(item)}
                        className={`medium-14 h-8 w-16 ring-1 ring-slate-900/10 rounded-lg transition-all duration-200 ${item === size ? "bg-primary-dark text-secondary" : "bg-white text-gray-700 hover:bg-primary-dark hover:text-secondary"}`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No sizes available</p>
                )}
              </div>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => {
                    const selectedSize = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : null);
                    if (selectedSize) {
                      addToCart(product._id, selectedSize, 1);
                    } else {
                      toast.error('Please select a size first');
                    }
                  }}
                  disabled={!size && (!product.sizes || product.sizes.length === 0)}
                  className={`btn-dark  flexCenter gap-x-2 capitalize w-1/2 ${(!size && (!product.sizes || product.sizes.length === 0)) ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  Add to Cart
                  <img src={assets.cartAdd} alt="" width={19}/>
                </button>
                <button className="btn-white flex items-center justify-center w-10 h-10 p-0">
                  <img src={assets.heartAdd} alt="Add to wishlist" width={19} />
                </button>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <img src={assets.delivery} alt="Delivery" width={17} />
                <span className="medium-14 text-gray-700">
                  Free Delivery on orders over $500
                </span>
              </div>
              <hr className="my-3 w-2/3 "/>
              <div className="mt-2 flex flex-col gap-1 text-gray-30 text-[14px]">
                <p>Authenticity You Can Trust</p>
                <p>Enjoy Cash on Delivery for Your Convenience</p>
                <p>Easy Returns and Exchanges Within 7 Days</p>
              </div>
            </div>
          </div>
          <ProductDescription />
          <ProductFeatures />
          {/* Related products */}
          <RelatedProducts product={product} productId={productId} />
        </div>
    )
  );
};

export default ProductDetails;
