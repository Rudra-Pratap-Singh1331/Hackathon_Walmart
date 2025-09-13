import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { AuthContext } from "../Context/AuthContext";
import "@google/model-viewer";

const ProductDetail = () => {
  const { id, cartId } = useParams(); // ✅ get both productId & cartId
  const [product, setProduct] = useState(null);
  const [showModel, setShowModel] = useState(false);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Failed to load product", err);
      }
    };

    fetchProduct();
  }, [id]);

  const handleBuyNow = async (product) => {
    if (!user || !user.token) {
      toast.error("Please login to add items to cart.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/cart/add",
        {
          cartId, // ✅ include this in request body
          product: {
            productId: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            imgurl: product.imgurl,
            quantity: 1,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error("Failed to add to cart");
      console.error(error);
    }
  };

  if (!product) return <p className="p-4">Loading product...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 flex items-center justify-center min-h-screen">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 flex justify-center">
         <img
  src={
    product?.imgUrl?.startsWith("data:image")
      ? product.imgUrl
      : product?.imgUrl || product?.imgurl || "https://via.placeholder.com/150"
  }
  alt={product?.name || "Product"}
  className="w-full max-w-md object-contain rounded-lg shadow-md"
  onError={(e) => {
    e.target.src = "https://via.placeholder.com/150";
  }}
/>

        </div>

        <div className="md:w-1/2 flex flex-col gap-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-xl font-semibold text-green-700">₹{product.price}</p>
          <p className="text-sm text-gray-500">In Stock: {product.quantity}</p>
          <p className="text-sm text-gray-500">Description: {product.description}</p>

          <div className="border p-4 rounded-md bg-gray-100">
            <p className="text-sm text-gray-700 font-semibold mb-2">3D Model Viewer</p>
            <button
              onClick={() => setShowModel(true)}
              className="bg-[#0071dc] text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              View in 360° / AR
            </button>
          </div>

          <button
            onClick={() => handleBuyNow(product)}
            className="bg-[#0071dc] text-white px-6 py-3 rounded hover:bg-blue-700 transition mt-4 w-full"
          >
            Buy Now
          </button>
        </div>
      </div>

      {showModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/50">
          <div className="bg-white p-4 rounded-xl shadow-2xl relative w-[95%] max-w-2xl border border-gray-300">
            <button
              onClick={() => setShowModel(false)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-3 py-1 z-50 text-sm shadow"
            >
              ✕
            </button>

            {product.modelUrl ? (
              <model-viewer
                src={product.modelUrl}
                ar
                ar-modes="scene-viewer webxr quick-look"
                auto-rotate
                camera-controls
                shadow-intensity="1"
                alt={product.name}
                style={{
                  width: "100%",
                  height: "500px",
                  borderRadius: "0.5rem",
                }}
              ></model-viewer>
            ) : (
              <div className="text-center py-20 text-gray-600">
                <p className="text-lg font-semibold">3D Model Not Available</p>
                <p className="text-sm mt-2">This product doesn't have a 3D view yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
