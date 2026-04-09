import React, { createContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'

export const UserDataContext = createContext()

const UserContext = ({ children }) => {
  const baseUrl = import.meta.env.VITE_BASE_URL
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const getUser = useCallback(async () => {
    if (!baseUrl) return;
    
    try {
      setLoading(true)
      setError(null)
      
      // Get token from localStorage as backup
      const localToken = localStorage.getItem('token');
      
      const config = { withCredentials: true };
      if (localToken) {
        config.headers = {
          'Authorization': `Bearer ${localToken}`
        };
      }
      
      const result = await axios.get(baseUrl + '/api/v1/user/getCurrentUser', config)
      
      if (result.data && result.data._id) {
        setUserData(result.data)
      } else {
        setUserData(null)
      }
    } catch (error) {
      console.log("Error fetching user:", error.response?.data?.message || error.message)
      setUserData(null)
    } finally {
      setLoading(false)
    }
  }, [baseUrl])

  useEffect(() => {
    if (baseUrl) {
      getUser()
    }
  }, [baseUrl, getUser])

  const logout = async () => {
    try {
      await axios.get(baseUrl + '/api/v1/auth/logout', { withCredentials: true })
      localStorage.removeItem('token');
      setUserData(null)
    } catch (error) {
      console.error("Logout error:", error)
      localStorage.removeItem('token');
      setUserData(null)
    }
  }

  const value = {
    baseUrl,
    userData,
    setUserData,
    loading,
    error,
    logout,
    refetchUser: getUser
  }

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  )
}

export default UserContext
