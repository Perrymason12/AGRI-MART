import React, { useEffect, useState } from "react";
import Title from "./Title";
import Item from "./Item";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
// Import Swiper styles
import "swiper/css";
// import required modules
import { Autoplay } from "swiper/modules";
import { useAppContext } from "../context/AppContext";

const RelatedProducts = ({product, productId}) => {
    const {products} = useAppContext()
    const [relatedProducts , setRelatedProducts] = useState([])
    useEffect(()=>{
      if (products.length > 0) {
        let productsCopy = products.slice()
        productsCopy = productsCopy.filter((item)=> item.category === product.category && productId !== item._id)
        setRelatedProducts(productsCopy.slice(0,6));
      }
    },[products, product?.category, productId])
  return (
    <section className="mt-16 md:mt-24 lg:mt-28 max-padd-container">
      <Title title1={"Related"} title2={"Products"} titleStyles={"pb-6 md:pb-8 lg:pb-10"} />
      {/*Container */}
        <Swiper
        spaceBetween={20}
        
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        
        breakpoints={
            {
             555:{
                slidesPerView: 1,
                spaceBetween: 20,
             }, 
             600:{
                slidesPerView: 2,
                spaceBetween: 24,
             }, 
             1022:{
                slidesPerView: 3,
                spaceBetween: 30,
             }, 
             1350:{
                slidesPerView: 4,
                spaceBetween: 40,
             },   
            }
        }
        modules={[Autoplay]}
        className="min-h-[280px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[400px]"
      >

            {relatedProducts.map((product) => (
               <SwiperSlide key={product._id}>
                  <Item product={product} /> 
               </SwiperSlide>
            ))}
        
        
      </Swiper>
    </section>
  );
};

export default RelatedProducts;
