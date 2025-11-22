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

  // ✅ Get user current location & reverse geocode using OpenStreetMap (Nominatim)
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
              `${baseUrl}/api/v1/location/geocode`, // Call your backend
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

  // ✅ Helper function to normalize image data
  const normalizeImageData = (image) => {
    if (!image) {
      return {
        url: "https://via.placeholder.com/150",
        publicId: ""
      };
    }

    if (typeof image === 'string') {
      return {
        url: image,
        publicId: ""
      };
    }

    if (typeof image === 'object') {
      return {
        url: image.url || image,
        publicId: image.publicId || ""
      };
    }

    return {
      url: "https://via.placeholder.com/150",
      publicId: ""
    };
  };

  // ✅ Place COD order (direct to backend)
  const handleCOD = async () => {
    try {
      // ✅ Debug: Log the cart structure
      console.log("Raw cart data:", cart);
      
      // ✅ FIXED: Properly map cart items with all required fields
      const itemsForOrder = cart.map(item => {
        console.log("Processing cart item:", item); // Debug each item
        
        // ✅ Handle different cart item structures
        const productId = item.product?._id || item.product || item.productId;
        
        // ✅ FIXED: Handle image structure properly using helper function
        const imageData = normalizeImageData(item.image);
        
        return {
          productId: productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: imageData, // ✅ Properly structured image object
          customization: item.customization || undefined, // ✅ Include customization
        };
      });

      console.log("Items sent to backend (COD):", itemsForOrder);
      console.log("Address sent:", address);

      const { data } = await axios.post(
        baseUrl + "/api/v1/order/create",
        {
          items: itemsForOrder,
          address,
          paymentMethod: "COD",
        },
        { withCredentials: true }
      );

      console.log("Order:", data);
      alert("✅ Order placed successfully!");
      clearCart();
      navigate("/orders");
    } catch (error) {
      console.error("COD order error:", error.response?.data || error);
      alert("❌ Failed to place order. Please try again.");
    }
  };

  // ✅ Place Razorpay order
  const handleRazorpay = async () => {
    try {
      // ✅ Normalize cart items to always have productId
      const normalizedItems = cart.map(item => {
        // ✅ Handle image structure properly using helper function
        const imageData = normalizeImageData(item.image);

        return {
          productId: item.product?._id || item.product || item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: imageData, // ✅ Properly structured image object
          customization: item.customization || undefined, // ✅ Include customization
        };
      });

      const amount = cart.reduce(
        (sum, item) => sum + (item.price || item.product?.price) * item.quantity,
        0
      );

      // Step 1: Create order in backend (Razorpay order)
      const { data: order } = await axios.post(
        `${baseUrl}/api/v1/order/razorpay/order`,
        { amount },
        { withCredentials: true }
      );

      // Step 2: Razorpay checkout
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

            alert("✅ Payment Successful & Order Placed!");
            console.log("Order:", verifyRes.data);
            clearCart();
            navigate("/orders");
          } catch (err) {
            console.error("Payment verification failed:", err);
            alert("❌ Payment verification failed");
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
      alert("❌ Failed to initiate Razorpay payment");
    }
  };

  const handlePlaceOrder = () => {
    // ✅ Validate required fields
    if (!address.firstName || !address.phone || !address.street || !address.city) {
      alert("Please fill in all required address fields");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty!");
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
          <p className="text-gray-600 text-lg mb-4">🛒 Your cart is empty.</p>
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
              { key: "email", placeholder: "Email" },
              { key: "phone", placeholder: "Phone Number *", required: true },
              { key: "street", placeholder: "Street Address *", full: true, required: true },
              { key: "city", placeholder: "City *", required: true },
              { key: "state", placeholder: "State" },
              { key: "pincode", placeholder: "Pincode" },
              { key: "country", placeholder: "Country" }
            ].map((field) => (
              <input
                key={field.key}
                type="text"
                placeholder={field.placeholder}
                required={field.required}
                className={`border p-3 rounded-lg text-sm w-full focus:ring-2 focus:ring-yellow-400 ${
                  field.full ? "md:col-span-2" : ""
                }`}
                value={address[field.key]}
                onChange={(e) =>
                  setAddress({ ...address, [field.key]: e.target.value })
                }
              />
            ))}
          </div>

          {useCurrentLocation && location && (
            <p className="text-sm text-green-600 mt-3">
              📍 {address.street}, {address.city}, {address.state} - {address.pincode}
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
                        <p className="text-xs text-blue-600">✨ Customized</p>
                      )}
                    </div>
                  </div>
                  <p className="font-semibold text-gray-700">
                    ₹{(item.price * item.quantity).toFixed(2)}
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
                <span className="text-green-600">₹{total.toFixed(2)}</span>
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
            disabled={cart.length === 0}
            className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg shadow-md transition disabled:bg-gray-400"
          >
            Place Order — ₹{total.toFixed(2)}
          </button>
        </div>

      </div>
    </div>
  </div>
);
};

export default Checkout;