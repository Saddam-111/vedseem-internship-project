import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { CartDataContext } from "../context/CartContext";
import { UserDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const Checkout = () => {
  const { cart, clearCart } = useContext(CartDataContext);
  const { baseUrl } = useContext(UserDataContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [location, setLocation] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  useEffect(() => {
    if (useCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setLocation(coords);

          try {
            const { data } = await axios.get(
              `${baseUrl}/api/v1/location/geocode`, 
              {
                params: {
                  lat: coords.lat,
                  lon: coords.lng,
                },
                withCredentials: true
              }
            );

            if (data && data.address) {
              setAddress((prev) => ({
                ...prev,
                street: data.address.road || data.display_name || "",
                city:
                  data.address.city ||
                  data.address.town ||
                  data.address.village ||
                  "",
                state: data.address.state || "",
                pincode: data.address.postcode || "",
              }));
            }
          } catch (err) {
            console.error("Reverse geocoding error:", err);
          }
        },
        (err) => {
          console.error("Location access denied:", err.message);
          setUseCurrentLocation(false);
        }
      );
    }
  }, [useCurrentLocation, baseUrl]);

  const normalizeImageData = (image) => {
    if (!image) {
      return { url: "https://via.placeholder.com/150", publicId: "" };
    }

    if (typeof image === 'string') {
      return { url: image, publicId: "" };
    }

    if (typeof image === 'object') {
      return { url: image.url || image, publicId: image.publicId || "" };
    }

    return { url: "https://via.placeholder.com/150", publicId: "" };
  };

  const validateAddress = () => {
    const errors = [];
    
    if (!address.firstName?.trim()) {
      errors.push("First name is required");
    }
    if (!address.phone?.trim()) {
      errors.push("Phone number is required");
    }
    if (!address.street?.trim()) {
      errors.push("Street address is required");
    }
    if (!address.city?.trim()) {
      errors.push("City is required");
    }
    
    if (address.phone && !/^\d{10}$/.test(address.phone.replace(/\D/g, ''))) {
      errors.push("Please enter a valid 10-digit phone number");
    }
    
    if (address.email && !/^\S+@\S+\.\S+$/.test(address.email)) {
      errors.push("Please enter a valid email address");
    }
    
    return errors;
  };

  const handleCOD = async () => {
    const validationErrors = validateAddress();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const itemsForOrder = cart.map(item => {
        const productId = item.product?._id || item.product || item.productId;
        const imageData = normalizeImageData(item.image);
        
        return {
          productId: productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: imageData,
          customization: item.customization || undefined, 
        };
      });

      const { data } = await axios.post(
        baseUrl + "/api/v1/order/create",
        {
          items: itemsForOrder,
          address,
          paymentMethod: "COD",
        },
        { withCredentials: true }
      );

      if (data.success) {
        alert("Order placed successfully!");
        clearCart();
        navigate("/orders");
      } else {
        setError(data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("COD order error:", error.response?.data || error);
      setError(error.response?.data?.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  
  const handleRazorpay = async () => {
    const validationErrors = validateAddress();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const normalizedItems = cart.map(item => {
        const imageData = normalizeImageData(item.image);

        return {
          productId: item.product?._id || item.product || item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: imageData, 
          customization: item.customization || undefined, 
        };
      });

      const amount = cart.reduce(
        (sum, item) => sum + (item.price || item.product?.price) * item.quantity,
        0
      );

      
      const { data: order } = await axios.post(
        `${baseUrl}/api/v1/order/razorpay/order`,
        { amount },
        { withCredentials: true }
      );

      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Dhanush Digital",
        description: "Order Payment",
        order_id: order.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(
              `${baseUrl}/api/v1/order/razorpay/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData: {
                  items: normalizedItems,
                  amount,
                  address,
                },
              },
              { withCredentials: true }
            );

            if (verifyRes.data.success) {
              alert("Payment Successful & Order Placed!");
              clearCart();
              navigate("/orders");
            } else {
              alert(verifyRes.data.message || "Payment verification failed");
            }
          } catch (err) {
            console.error("Payment verification failed:", err);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: `${address.firstName} ${address.lastName}`,
          email: address.email,
          contact: address.phone,
        },
        theme: { color: "#3399cc" },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (error) {
      console.error("Razorpay error:", error);
      setError(error.response?.data?.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = () => {
    setError("");
    
    if (cart.length === 0) {
      setError("Your cart is empty!");
      return;
    }

    if (paymentMethod === "cod") {
      handleCOD();
    } else {
      handleRazorpay();
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + (item.price || item.product?.price) * item.quantity,
    0
  );

  const handleAddressChange = (key, value) => {
    setAddress({ ...address, [key]: value });
    setError("");
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="flex flex-row gap-3 items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
          >
            <FaArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>
        <div className="bg-white shadow p-6 rounded-lg">
          <p className="text-gray-600 text-lg mb-4">Your cart is empty.</p>
          <button 
            onClick={() => navigate('/')} 
            className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

 return (
  <div className="bg-gray-100 min-h-screen py-">
    <div className="max-w-8xl mx-auto p-4">

      {/* Header */}
      <div className="flex items-center bg-yellow-400 rounded-md p-4 gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-full hover:bg-gray-100 shadow transition"
        >
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Checkout</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Address Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Delivery Address</h2>

          <label className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={useCurrentLocation}
              onChange={(e) => setUseCurrentLocation(e.target.checked)}
              className="accent-yellow-500"
            />
            <span className="text-sm text-gray-700">Use my current location</span>
          </label>

          {/* Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "firstName", placeholder: "First Name *", required: true },
              { key: "lastName", placeholder: "Last Name" },
              { key: "email", placeholder: "Email", type: "email" },
              { key: "phone", placeholder: "Phone Number *", required: true, type: "tel" },
              { key: "street", placeholder: "Street Address *", full: true, required: true },
              { key: "city", placeholder: "City *", required: true },
              { key: "state", placeholder: "State" },
              { key: "pincode", placeholder: "Pincode" },
              { key: "country", placeholder: "Country" }
            ].map((field) => (
              <input
                key={field.key}
                type={field.type || "text"}
                placeholder={field.placeholder}
                required={field.required}
                className={`border p-3 rounded-lg text-sm w-full focus:ring-2 focus:ring-yellow-400 ${
                  field.full ? "md:col-span-2" : ""
                }`}
                value={address[field.key]}
                onChange={(e) => handleAddressChange(field.key, e.target.value)}
              />
            ))}
          </div>

          {useCurrentLocation && location && (
            <p className="text-sm text-green-600 mt-3">
               {address.street}, {address.city}, {address.state} - {address.pincode}
            </p>
          )}
        </div>

        {/* Summary & Payment */}
        <div className="space-y-6">

          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Order Summary</h2>

            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto scrollbar-hide pr-1">
              {cart.map((item) => (
                <div key={item._id} className="flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <img
                      src={item.image?.url || item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-lg border"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                      {item.customization && (
                        <p className="text-xs text-blue-600">Customized</p>
                      )}
                    </div>
                  </div>
                  <p className="font-semibold text-gray-700">
                    Rs.{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mt-3">
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Items</span>
                <span>{cart.length}</span>
              </div>
              <div className="flex justify-between text-gray-900 text-lg font-bold">
                <span>Total</span>
                <span className="text-green-600">Rs.{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Payment Method</h2>

            <div className="space-y-3 text-sm text-gray-700">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="accent-yellow-500"
                />
                Cash on Delivery (COD)
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="RAZORPAY"
                  checked={paymentMethod === "RAZORPAY"}
                  onChange={() => setPaymentMethod("RAZORPAY")}
                  className="accent-yellow-500"
                />
                Pay Online (Razorpay)
              </label>
            </div>
          </div>

          {/* Place Order */}
          <button
            onClick={handlePlaceOrder}
            disabled={loading || cart.length === 0}
            className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg shadow-md transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : `Place Order — Rs.${total.toFixed(2)}`}
          </button>
        </div>

      </div>
    </div>
  </div>
);
};

export default Checkout;