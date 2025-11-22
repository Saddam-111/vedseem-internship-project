import React from 'react'
import PromoBanner from './PromoBanner'
import CategoryTab from './CategoryTab'
import ProductCategoryRow from './CategoryProductRow'
import GenderCategory from './GenderCategory'

const Gift = () => {
  return (
    <div className='w-full flex flex-col mt-2'>
      <PromoBanner />
      {/* <CategoryTab /> */}
      <ProductCategoryRow />
      <GenderCategory />
    </div>
  )
}

export default Gift