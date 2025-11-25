import { assets } from "../assets/data";

const Testimonial = () => {
  const cardsData = [
    {
      image: assets.user1,
      name: "Briar Martin",
      handle: "@neilstellar",
      date: "April 20, 2025",
      message: "The rental process was incredibly smooth! Found the perfect tractor for my farm in minutes and the checkout was hassle-free. Highly recommend!"
    },
    {
      image: assets.user2,
      name: "Avery Johnson",
      handle: "@averywrites",
      date: "May 10, 2025",
      message: "Amazing selection of agricultural equipment! The product details are clear, and I love how easy it is to compare different sizes and prices. Great service!"
    },
    {
      image: assets.user3,
      name: "Jordan Lee",
      handle: "@jordantalks",
      date: "June 5, 2025",
      message: "Fast delivery and excellent customer support! The equipment arrived in perfect condition. The secure payment options made me feel confident throughout."
    },
    {
      image: assets.user4,
      name: "Sarah Chen",
      handle: "@sarahfarms",
      date: "May 28, 2025",
      message: "Love the user-friendly interface! Managing my orders and tracking deliveries is so simple. The address management feature saved me so much time."
    },
    {
      image: assets.user1,
      name: "Michael Torres",
      handle: "@mikefarms",
      date: "June 15, 2025",
      message: "The search and filter features are fantastic! I can easily find exactly what I need by category, type, and price. Saved me hours of browsing!"
    },
    {
      image: assets.user2,
      name: "Emma Williams",
      handle: "@emmaworks",
      date: "May 22, 2025",
      message: "Cash on delivery option is a lifesaver! No need to worry about online payments. The equipment quality exceeded my expectations. Will rent again!"
    },
    {
      image: assets.user3,
      name: "David Park",
      handle: "@davidgrows",
      date: "June 8, 2025",
      message: "The cart system works perfectly! I can add multiple items, adjust quantities, and checkout seamlessly. The order confirmation emails are very helpful."
    },
    {
      image: assets.user4,
      name: "Lisa Anderson",
      handle: "@lisafarm",
      date: "May 30, 2025",
      message: "Best agricultural rental platform I've used! The product images are high quality, descriptions are detailed, and the mobile layout is perfect for browsing on the go."
    },
  ];

  const CreateCard = ({ card }) => (
    <div className="p-4 rounded-lg mx-4 shadow hover:shadow-lg transition-all duration-200 w-72 shrink-0">
      <div className="flex gap-2">
        <img
          className="size-11 rounded-full"
          src={card.image}
          alt="User Image"
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <p>{card.name}</p>
            <img src={assets.badge} alt="" width={15} />
          </div>
          <span className="text-xs text-slate-500">{card.handle}</span>
        </div>
      </div>
      <p className="text-sm py-4 text-gray-800">
        {card.message}
      </p>
      <div className="flex items-center justify-between text-slate-500 text-xs">
        <div className="flex items-center gap-1">
          <span>Posted on</span>
          <a
            href="https://x.com"
            target="_blank"
            className="hover:text-sky-500"
          >
            <img src={assets.twitter} alt="" width={16} />
          </a>
        </div>
        <p>{card.date}</p>
      </div>
    </div>
  );

  return (
    <section className="max-padd-container py-16 xl:py-22">
      <>
        <style>{`
            @keyframes marqueeScroll {
                0% { transform: translateX(0%); }
                100% { transform: translateX(-50%); }
            }

            .marquee-inner {
                animation: marqueeScroll 25s linear infinite;
            }

            .marquee-reverse {
                animation-direction: reverse;
            }
        `}</style>

        <div className="marquee-row overflow-hidden relative">
          <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-linear-to-r from-white to-transparent"></div>
          <div className="marquee-inner flex transform-gpu min-w-[200%] pt-10 pb-5">
            {[...cardsData, ...cardsData].map((card, index) => (
              <CreateCard key={index} card={card} />
            ))}
          </div>
          <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-linear-to-l from-white to-transparent"></div>
        </div>

        <div className="marquee-row  overflow-hidden relative">
          <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-linear-to-r from-white to-transparent"></div>
          <div className="marquee-inner marquee-reverse flex transform-gpu min-w-[200%] pt-10 pb-5">
            {[...cardsData, ...cardsData].map((card, index) => (
              <CreateCard key={index} card={card} />
            ))}
          </div>
          <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-linear-to-l from-white to-transparent"></div>
        </div>
      </>
    </section>
  );
};

export default Testimonial;
