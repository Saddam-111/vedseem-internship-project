import React, { createContext, useEffect, useState } from 'react'
import axios from 'axios'
export const ProductDataContext = createContext()

const ProductContext = ({children}) => {
    const baseUrl = import.meta.env.VITE_BASE_URL
    const [blogData, setBlogData] = useState([])



  const fetchBlogList = async () => {
    try {
      const result = await axios.get(baseUrl + "/api/v1/blogs/list", {
        withCredentials: true,
      });
      console.log(result.data)
      setBlogData(result.data.blogs); // ✅ Fix: use products array
    } catch (error) {
      console.error("Error fetching list:", error);
    }
  }; 
  
  useEffect( () => {
    fetchBlogList()
  },[])

  const value = {
    baseUrl,
    blogData, setBlogData
  }

  return (
    <ProductDataContext.Provider value={value}>
      {children}
    </ProductDataContext.Provider>
  )
}

export default ProductContext