import React from "react";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";

const Item = ({ product }) => {
  const { navigate, currency } = useAppContext();
  const [hovered, setHovered] = useState(false);
  const [size, _setSize] = useState(product.sizes[0]); // Default size(first size in the array)
  // colors to cycle through
  const colors = ["#f2f2f2", "#f6f9f6", "#f6f8fe"];
  //computing an index from product._id; parseint fallback to 0 for safety
  const bgcolor =
    colors[parseInt(product._id?.slice(-4) || "0", 16) % colors.length];
  return (
    <div className="overflow-hidden">
      {/*image */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flexCenter h-[182px] w-full transition-all duration-300 rounded-xl group relative"
        style={{ backgroundColor: bgcolor }}
      >
        <img
          src={
            product.images.length > 1 && hovered
              ? product.images[1]
              : product.images[0]
          }
          alt=""
          height={144}
          width={144}
        />
        <div className="absolute bottom-1 left-1 right-1 block md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => {
              navigate(`/collection/${product._id} `);
              scrollTo(0, 0);
              
            }}
            className = "btn-secondary py-2! px-0! w-full text-xs!"
          >
            Quick View
          </button>
        </div>
        <p className="absolute top-2 right-1 ring-1 ring-slate-900/10 px-5 bg-white/50 rounded-full ">
          {product.type}
        </p>
      </div>
      {/*info */}
      <div className="pt-3 p-1">
        {/*title and description */}
        <div className="flexBetween">
          <h5 className="h5 uppercase line-clamp-1">{product.title}</h5>
          <p className="uppercase font-semibold">
            {currency}
            {product.price[size]}
          </p>
        </div>
        <p className="line-clamp-2 pt-1">{product.description}</p>
      </div>
    </div>
  );
};

export default Item;
