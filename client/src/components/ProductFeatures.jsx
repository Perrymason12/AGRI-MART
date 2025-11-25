import React from 'react'
import { assets } from '../assets/data'

const ProductFeatures = () => {
  return (
    <div className='mt-12 bg-primary rounded-3xl'>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 rounded-xl">
        <div className="flexCenter gap-x-4 p-2 rounded-3xl">
          <div><img src={assets.returnRequest} alt="" width={77} className='mb-3' /></div>
          <div>
            <h4 className="h4 capitalize">Easy Return</h4>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Rerum quisquam voluptas dolorem sed ab, reiciendis ipsam nam autem adipisci libero debitis aspernatur exercitationem consequuntur minima, sit vitae, facilis eos optio!</p>
          </div>
        </div>
        <div className="flexCenter gap-x-4 p-2 rounded-3xl">
          <div><img src={assets.secure} alt="" width={77} className='mb-3 text-blue-500'/></div>
          <div>
            <h4 className="h4 capitalize">secure payment</h4>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam tenetur doloremque aspernatur, voluptates ab dolores beatae recusandae cupiditate dolore consequatur, nam architecto minima facilis voluptatum quidem eligendi autem repellat quisquam?</p>
          </div>
        </div>
        <div className='flexCenter gap-x-4 p-2 rounded-3xl'>
          <div><img src={assets.delivery} alt="" width={77} className='mb-3'/></div>
          <div>
            <h4 className="h4 capitalize">Fast Delivery</h4>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Dicta excepturi nemo sit, similique magnam labore recusandae sint quisquam alias non, ullam ipsa error in nobis ab unde eos commodi consequatur.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductFeatures
