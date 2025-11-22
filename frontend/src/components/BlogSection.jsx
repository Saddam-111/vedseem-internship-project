import React from 'react'
import Blogs from './Blogs'
import Stats from './Stats'
import Paytm from './Paytm'

const BlogSection = () => {
  return (
    <div className='w-full h-screen flex flex-col'>
      <Blogs />
      <Stats />
      <Paytm />

    </div>
  )
}

export default BlogSection