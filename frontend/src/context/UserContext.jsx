import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const UserDataContext = createContext()

const UserContext = ({ children }) => {
  const baseUrl = import.meta.env.VITE_BASE_URL
  const [userData, setUserData] = useState(null)

  const getUser = async () => {
    try {
      const result = await axios.get(baseUrl + '/api/v1/user/getCurrentUser', { withCredentials: true })
      console.log(result.data)
      setUserData(result.data)
    } catch (error) {
      console.log("Error fetching user:", error)
    }
  }

  

  useEffect(() => {
    getUser()
  }, [])

  const value = {
    baseUrl,
    userData,
    setUserData,
  }

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  )
}

export default UserContext
