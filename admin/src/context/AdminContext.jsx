// src/context/AdminContext.js
import axios from "axios";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AuthDataContext } from "./AuthContext";

export const AdminDataContext = createContext();

function AdminContext({ children }) {
  // const { baseUrl } = useContext(AuthDataContext);
  const [adminData, setAdminData] = useState(null);
  const [newOrders, setNewOrders] = useState([]);
  const prevOrdersRef = useRef([]);
  const baseUrl = import.meta.env.VITE_BASE_URL
  const getAdmin = async () => {
    try {
      const result = await axios.get(`${baseUrl}/api/v1/user/getAdmin`, { withCredentials: true });
      setAdminData(result.data);
    } catch (error) {
      console.log("getAdmin error", error);
      setAdminData(null);
    }
  };

  const fetchOrdersForNotifications = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/v1/order/all`, { withCredentials: true });
      const fetched = res.data.orders || [];
      const prev = prevOrdersRef.current || [];
      const newOnes = fetched.filter(o => !prev.some(p => p._id === o._id));
      if (newOnes.length > 0) {
        setNewOrders(prev => {
          const dedup = Array.from(new Set([...prev, ...newOnes.map(x => x._id)]));
          return dedup;
        });
      }
      prevOrdersRef.current = fetched;
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    if (!baseUrl) return;
    getAdmin();
    fetchOrdersForNotifications();
    const intervalId = setInterval(fetchOrdersForNotifications, 4000);
    return () => clearInterval(intervalId);
  }, [baseUrl]);

  const value = { adminData, setAdminData, getAdmin, newOrders, setNewOrders, refreshOrders: fetchOrdersForNotifications };
  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export default AdminContext;
