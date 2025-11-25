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

const NewArrivals = () => {
    const {products} = useAppContext()
    const [newArrivals , setNewArrivals] = useState([])
    useEffect(()=>{
       const data = products.filter((item)=> item.inStock).slice(0,10)
       setNewArrivals(data)
    },[products])
  return (
    <section className="max-padd-container mt-16 md:mt-24 lg:mt-28">
      <Title title1={"New"} title2={"Arrivals"} titleStyles={"pb-6 md:pb-8 lg:pb-10"} />
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

            {newArrivals.map((product) => (
               <SwiperSlide key={product._id}>
                  <Item product={product} /> 
               </SwiperSlide>
            ))}
        
        
      </Swiper>
    </section>
  );
};

export default NewArrivals;
