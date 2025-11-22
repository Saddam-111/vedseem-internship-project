import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const ItemDataContext = createContext();

const ItemContext = ({ children }) => {
  const baseUrl = import.meta.env.VITE_BASE_URL
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
  try {
    setLoading(true);
    console.log("Fetching from:", `${baseUrl}/api/v1/product/getProducts`); // 👀
    const res = await axios.get(`${baseUrl}/api/v1/product/getProducts`, {
      withCredentials: true,
    });
    console.log("Fetched Items:", res.data); // 👀
    setItems(res.data.products || []);
  } catch (err) {
    console.error("Error fetching items:", err.response?.data || err.message);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchItems();
  }, []);

  const value = {
    baseUrl,
    items,
    setItems,
    loading,
  };

  return (
    <ItemDataContext.Provider value={value}>
      {children}
    </ItemDataContext.Provider>
  );
};

export default ItemContext;
