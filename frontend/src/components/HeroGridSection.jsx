import React from 'react'
import PromoCardLarge from './PromoCardLarge'
import PromoCardSmall from './PromoCardSmall'
import ProductRow from './ProductRow'

const HeroGridSection = () => {
  return (
    <div className='w-full flex flex-col mt-12'>
        <div className='w-[94%] mx-auto gap-1 hidden md:flex flex-row'>
          <PromoCardLarge />
          <PromoCardSmall />
        </div>
        <ProductRow />
    </div>
  )
}

export default HeroGridSection