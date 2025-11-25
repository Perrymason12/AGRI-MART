import React from "react";

const ProductDescription = () => {
  return (
    <div className="mt-14 bg-white">
      <div className="flex gap-3 bg-primary rounded-t-2xl">
        <button className="medium-14 p-3 w-32 border-secondry">
          Description
        </button>
        <button className="medium-14 p-3 w-32 ">Type Guide</button>
        <button className="medium-14 p-3 w-32 ">Size Guide</button>
      </div>
      <hr className="h-px w-full text-slate-900/20" />
      <div className="flex flex-col gap-3 p-3">
        <div>
          <h5 className="h5">Detail</h5>
          <p className="text-sm">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio,
            voluptatem. Ipsa soluta perferendis ipsam commodi optio accusantium
            odio expedita esse eaque eos necessitatibus, quisquam qui. Aliquam
            illo ea perspiciatis neque.
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim sint
            molestias pariatur? Numquam, nihil blanditiis illo laborum vitae
            earum a ut aliquid eum recusandae voluptate voluptatum velit error,
            reprehenderit perspiciatis.
          </p>
        </div>
        <div>
          <h5 className="h5">Benefit</h5>
          <ul className="list-disc pl-5 text-sm text-gray-30 flex flex-col gap-1">
            <li>
              High-quality materials ensure long-lasting durability and confort
            </li>
            <li>Designed to meet the needs of modern, active lifestyles.</li>
            <li>Available in a wide range of colors and trendy colors.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductDescription;
