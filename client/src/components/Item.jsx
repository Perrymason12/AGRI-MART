import React from "react";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";

const Item = ({ product }) => {
  const { navigate, currency } = useAppContext();
  const [hovered, setHovered] = useState(false);
  const [size, _setSize] = useState(product.sizes?.[0]); // Default size(first size in the array)
  
  // Get price - handles both Map and object formats
  const getPrice = () => {
    if (!size || !product.price) return 0;
    if (product.price instanceof Map) {
      return product.price.get(size) || 0;
    }
    return product.price[size] || Object.values(product.price)[0] || 0;
  };
  
  // colors to cycle through
  const colors = ["#f2f2f2", "#f6f9f6", "#f6f8fe"];
  //computing an index from product._id; parseint fallback to 0 for safety
  const bgcolor =
    colors[parseInt(product._id?.slice(-4) || "0", 16) % colors.length];
  return (
    <div className="overflow-hidden w-full">
      {/*image */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flexCenter h-[140px] sm:h-[160px] md:h-[182px] w-full transition-all duration-300 rounded-lg sm:rounded-xl group relative overflow-hidden"
        style={{ backgroundColor: bgcolor }}
      >
        <img
          src={
            product.images?.length > 1 && hovered
              ? product.images[1]
              : product.images?.[0] || ''
          }
          alt={product.title || 'Product'}
          className="w-auto h-full object-contain p-2"
        />
        <div className="absolute bottom-1 left-1 right-1 block md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => {
              navigate(`/collection/${product._id} `);
              scrollTo(0, 0);
              
            }}
            className = "btn-secondary py-1.5! px-2! w-full text-xs! sm:py-2! sm:text-sm!"
          >
            Quick View
          </button>
        </div>
        {product.type && (
          <p className="absolute top-1 right-1 sm:top-2 sm:right-1 ring-1 ring-slate-900/10 px-2 sm:px-3 md:px-5 bg-white/80 backdrop-blur-sm rounded-full text-[10px] sm:text-xs font-medium">
            {product.type}
          </p>
        )}
      </div>
      {/*info */}
      <div className="pt-2 sm:pt-3 px-0.5 sm:p-1">
        {/*title and description */}
        <div className="flexBetween gap-1 sm:gap-2">
          <h5 className="text-xs sm:text-sm md:text-base font-semibold uppercase line-clamp-1 flex-1 min-w-0">{product.title}</h5>
          <p className="text-xs sm:text-sm md:text-base uppercase font-semibold whitespace-nowrap flex-shrink-0">
            {currency}{getPrice()}
          </p>
        </div>
        <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 line-clamp-2 pt-1 sm:pt-1.5">{product.description}</p>
      </div>
    </div>
  );
};

export default Item;
