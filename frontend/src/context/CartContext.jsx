// CartContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { UserDataContext } from "./UserContext";

export const CartDataContext = createContext();

export const CartContext = ({ children }) => {
  const { baseUrl } = useContext(UserDataContext);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch cart
  const fetchCart = async () => {
    if (!baseUrl) return;
    try {
      setLoading(true);
      const res = await axios.get(`${baseUrl}/api/v1/cart/getCart`, {
        withCredentials: true,
      });
      setCart(res.data.cart || []);
    } catch (error) {
      console.error("Fetch cart error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ FIXED: Now taking FormData directly for custom image + text
  const addToCart = async (formData) => {
    if (!baseUrl) return;
    try {
      setLoading(true);

      const res = await axios.post(
        `${baseUrl}/api/v1/cart/add`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" }, // REQUIRED for image uploads
        }
      );

      setCart(res.data.cart || []);
    } catch (error) {
      console.error("Add to cart error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update quantity
  const updateCartItem = async (cartItemId, quantity) => {
    if (!baseUrl) return;
    try {
      setLoading(true);

      const res = await axios.put(
        `${baseUrl}/api/v1/cart/update`,
        { cartItemId, quantity },
        { withCredentials: true }
      );

      setCart(res.data.cart || []);
    } catch (error) {
      console.error("Update cart error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Remove item
  const removeFromCart = async (cartItemId) => {
    if (!baseUrl) return;
    try {
      setLoading(true);

      const res = await axios.delete(
        `${baseUrl}/api/v1/cart/${cartItemId}`,
        { withCredentials: true }
      );

      setCart(res.data.cart || []);
    } catch (error) {
      console.error("Remove cart error:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!baseUrl) return;
    try {
      setLoading(true);
      await axios.delete(`${baseUrl}/api/v1/cart/clearCart`, {
        withCredentials: true,
      });
      setCart([]);
    } catch (error) {
      console.error("Clear cart error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (baseUrl) fetchCart();
  }, [baseUrl]);

  return (
    <CartDataContext.Provider
      value={{
        cart,
        loading,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartDataContext.Provider>
  );
};

export default CartContext;
