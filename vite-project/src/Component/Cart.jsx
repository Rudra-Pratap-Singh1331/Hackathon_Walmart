import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const cartRef = useRef([]);
  const [useLoyalty, setUseLoyalty] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [collaboratingCartId, setCollaboratingCartId] = useState("");
  const [inputCartId, setInputCartId] = useState("");

  const { cartId: urlCartId } = useParams();
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const localStorageCartId = localStorage.getItem("cartId");
  const cartUserId = localStorage.getItem("cartUserId");
  const actualCartId = localStorageCartId || urlCartId;
  const isSameUser = cartUserId === user?._id;

  const discount = 0.1;
  const deliveryFee = 40;

  const handleJoinCart = () => {
    if (!inputCartId.trim()) {
      toast.error("Please enter a valid Cart ID");
      return;
    }
    const id = inputCartId.trim();
    setIsCollaborating(true);
    setCollaboratingCartId(id);
    localStorage.setItem("cartId", id);
    localStorage.removeItem("cartUserId");
    socket.emit("join-collaboration", id);
    navigate(`/cart/${id}`);
    toast.success("Joined Collaborative cart")
  };

  const handleDisconnectCart = () => {
    socket.emit("leave-collaboration", collaboratingCartId);
    const newId = `cart_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    localStorage.setItem("cartId", newId);
    localStorage.setItem("cartUserId", user._id);
    setIsCollaborating(false);
    setCollaboratingCartId("");
    setInputCartId("");
    navigate(`/cart/${newId}`);
    toast.success("Disconnected")
  };

  useEffect(() => {
    if (!user?.token) {
      navigate("/login");
      return;
    }

    if (!cartUserId && actualCartId) {
      setIsCollaborating(true);
      setCollaboratingCartId(actualCartId);
    }

    if (!isSameUser && !urlCartId) {
      toast.error("Invalid cart session. Reloading.");
      const newId = `cart_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      localStorage.setItem("cartId", newId);
      localStorage.setItem("cartUserId", user._id);
      navigate(`/cart/${newId}`);
      return;
    }

    const fetchCart = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/cart/get/${actualCartId}`);
        setCartItems(res.data.products || []);
        cartRef.current = res.data.products || [];
      } catch (err) {
        console.error("Error loading cart:", err);
        toast.error("Cart not found or failed to load");
        if (err.response?.status === 401) {
          logout();
          navigate("/login");
        }
      }
    };

    const fetchLoyalty = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        setLoyaltyPoints(res.data.loyaltyPoints || 0);
      } catch (err) {
        console.error("Failed to fetch loyalty points:", err);
      }
    };

    fetchCart();
    fetchLoyalty();

    socket.emit("join-cart", actualCartId);
    socket.on("receive-cart", (updatedCart) => {
      const newItems = updatedCart.products || [];
      const hasChanged = JSON.stringify(cartRef.current) !== JSON.stringify(newItems);
      if (hasChanged) {
        cartRef.current = newItems;
        setCartItems(newItems);
      }
    });

    return () => {
      socket.off("receive-cart");
    };
  }, [actualCartId, user?._id, user?.token, navigate, logout, isSameUser, urlCartId, cartUserId]);

  const updateQuantity = async (id, type) => {
    try {
      const res = await axios.post("http://localhost:5000/api/cart/update", {
        cartId: actualCartId,
        productId: id,
        action: type === "increase" ? "add" : "remove",
      });

      const updatedItems = res.data.products || [];
      const nonZeroItems = updatedItems.filter(item => item.quantity > 0);
      setCartItems(nonZeroItems);
      cartRef.current = nonZeroItems;

      socket.emit("cart-update", {
        cartId: actualCartId,
        updatedCart: { products: nonZeroItems },
      });

      if (nonZeroItems.length === 0) {
        await axios.delete("http://localhost:5000/api/cart/clear", {
          data: { cartId: actualCartId },
        });
        toast.success("All items removed. Cart is now empty.");
      }
    } catch (err) {
      console.error("Quantity update error:", err.response?.data || err.message);
      toast.error("Failed to update quantity");
    }
  };

  const handleBuy = async () => {
    try {
      if (!cartItems.length) {
        toast.error("Cart is empty. Add items before purchase.");
        return;
      }

      await axios.post("http://localhost:5000/api/sales/add", {
        userId: user._id,
        products: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });

      await axios.put("http://localhost:5000/api/users/update-loyalty", {
        newPoints: 0,
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      await axios.delete("http://localhost:5000/api/cart/clear", {
        data: { cartId: actualCartId },
      });

      toast.success("Purchase successful!");
      setCartItems([]);
      cartRef.current = [];
      setUseLoyalty(false);
      setLoyaltyPoints(0);

      socket.emit("cart-update", {
        cartId: actualCartId,
        updatedCart: { products: [] },
      });
    } catch (err) {
      console.error("Buy error:", err.response?.data || err.message);
      toast.error("Failed to complete purchase");
    }
  };

  const productTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = productTotal * discount;
  const grandTotal = productTotal - discountAmount + deliveryFee;
  const loyaltyWorth = useLoyalty ? loyaltyPoints : 0;
  const finalAmount = Math.max(grandTotal - loyaltyWorth, 0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">
        🛒 Collaborative Cart ({actualCartId || "None"})
      </h2>

      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          value={isCollaborating ? collaboratingCartId : inputCartId}
          onChange={(e) => setInputCartId(e.target.value)}
          disabled={isCollaborating}
          placeholder="Enter Cart ID to collaborate"
          className="border px-3 py-2 rounded-md w-full max-w-md text-sm"
        />
        {isCollaborating ? (
          <button
            onClick={handleDisconnectCart}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={handleJoinCart}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            Join
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <p className="text-gray-600 text-center">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={String(item.productId)} className="flex items-center justify-between border p-4 rounded-md shadow-md">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      item?.imgUrl?.startsWith("data:image")
                        ? item.imgUrl
                        : item?.imgUrl || "https://dummyimage.com/150x150/cccccc/000000&text=No+Image"
                    }
                    alt={item?.name || "Product"}
                    className="w-32 h-32 object-contain rounded-md bg-white"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://dummyimage.com/150x150/cccccc/000000&text=No+Image";
                    }}
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="mt-1 font-medium">₹{item.price}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.productId, "decrease")}
                    className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                  >-</button>
                  <span className="px-3">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, "increase")}
                    className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                  >+</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 border-t pt-4 space-y-2 text-gray-800">
            <p>Total Products: ₹{productTotal.toFixed(2)}</p>
            <p>Discount (10%): -₹{discountAmount.toFixed(2)}</p>
            <p>Delivery Fee: ₹{deliveryFee.toFixed(2)}</p>
            <hr />
            <p className="text-xl font-bold">Final Amount: ₹{finalAmount.toFixed(2)}</p>
            <button
              onClick={handleBuy}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              Buy Now
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
