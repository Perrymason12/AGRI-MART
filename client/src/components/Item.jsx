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
    <div className="overflow-hidden w-full transition-all duration-300 hover:-translate-y-1 cursor-pointer group/item">
      {/*image */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flexCenter h-[140px] sm:h-[160px] md:h-[200px] lg:h-[240px] xl:h-[280px] w-full transition-all duration-300 rounded-lg sm:rounded-xl group relative overflow-hidden shadow-sm hover:shadow-md"
        style={{ backgroundColor: bgcolor }}
      >
        <img
          src={
            product.images?.length > 1 && hovered
              ? product.images[1]
              : product.images?.[0] || ''
          }
          alt={product.title || 'Product'}
          className="w-auto h-full object-contain p-2 md:p-3 lg:p-4 xl:p-5 transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute bottom-1 left-1 right-1 md:bottom-2 md:left-2 md:right-2 block md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={() => {
              navigate(`/collection/${product._id} `);
              scrollTo(0, 0);
              
            }}
            className = "btn-secondary py-2! px-3! md:py-2.5! md:px-4! w-full text-xs! sm:text-sm! md:text-base! font-medium shadow-lg hover:shadow-xl transition-all"
          >
            Quick View
          </button>
        </div>
        {product.type && (
          <p className="absolute top-1 right-1 sm:top-2 sm:right-2 md:top-3 md:right-3 ring-1 ring-slate-900/10 px-2 sm:px-3 md:px-4 lg:px-5 bg-white/90 md:bg-white/80 backdrop-blur-sm rounded-full text-[10px] sm:text-xs md:text-sm font-medium shadow-sm">
            {product.type}
          </p>
        )}
      </div>
      {/*info */}
      <div className="pt-3 sm:pt-3 md:pt-4 lg:pt-5 xl:pt-6 px-0.5 sm:p-1 md:p-1.5 lg:p-2">
        {/*title and description */}
        <div className="flexBetween gap-1 sm:gap-2 md:gap-3 lg:gap-4">
          <h5 className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-semibold uppercase line-clamp-1 flex-1 min-w-0 hover:text-tertiary transition-colors cursor-pointer">{product.title}</h5>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl uppercase font-bold whitespace-nowrap flex-shrink-0 text-tertiary">
            {currency}{getPrice()}
          </p>
        </div>
        <p className="text-[10px] sm:text-xs md:text-sm lg:text-base xl:text-lg text-gray-600 line-clamp-2 pt-1.5 sm:pt-2 md:pt-2.5 lg:pt-3 leading-relaxed">{product.description}</p>
      </div>
    </div>
  );
};

export default Item;
