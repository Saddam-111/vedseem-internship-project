
import { createContext } from "react";

export const AuthDataContext = createContext()

function AuthContext({children}){

  const baseUrl = import.meta.env.VITE_BASE_URL

  const value = {
    baseUrl
  }


  return(
    <div>
      <AuthDataContext.Provider value={value}>
        {children}
      </AuthDataContext.Provider>
    </div>
  )
}

export default AuthContext