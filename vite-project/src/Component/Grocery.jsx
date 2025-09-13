import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';

const Grocery = () => {
  const [products, setProducts] = useState([]);
  const [popupData, setPopupData] = useState(null);
  const [loading, setLoading] = useState(false);

  const cartId = localStorage.getItem("cartId");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/products/category/grocery");
        setProducts(res.data);
      } catch (err) {
        console.error("Failed to fetch grocery items", err);
      }
    };
    fetchProducts();
  }, []);

  const handleIngredientClick = async (productName) => {
    setLoading(true);
    setPopupData(null);

    try {
      const res = await fetch("http://localhost:5000/api/ai/ingredient-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName }),
      });

      const data = await res.json();
      setPopupData(data);
    } catch (err) {
      console.error("Error fetching ingredient info:", err);
      setPopupData({ raw: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 text-gray-800 p-6">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-2xl shadow-md p-4 hover:shadow-xl transition duration-300 flex flex-col"
          >
          <img
        src={
          product?.imgUrl?.startsWith("data:image")
           ? product.imgUrl
            : product?.imgUrl || product?.imgurl || "https://via.placeholder.com/150"
         }
        alt={product?.name || "Product"}
          className="w-full h-40 object-contain rounded-md mb-4 bg-white"
          onError={(e) => {
           e.target.src = "https://via.placeholder.com/150";
         }}
        />

            <h2 className="text-lg font-semibold text-blue-800 mb-1 line-clamp-1">{product.name}</h2>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>

            <div className="text-sm text-gray-700 mb-4">
              <p><span className="font-medium">Price:</span> ₹{product.price}</p>
              <p><span className="font-medium">In Stock:</span> {product.quantity}</p>
            </div>

            <div className="mt-auto flex gap-2">
              <button
                onClick={() => handleIngredientClick(product.name)}
                className="bg-green-600 text-white py-2 px-3 rounded hover:bg-green-700 transition text-sm w-1/2"
              >
                Product Insight
              </button>

              <Link to={`/product/${product._id}/${cartId}`} className="w-1/2">
                <button className="bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition text-sm w-full">
                  View
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* 🔄 Unified Modal for Loading and AI Response */}
      {(loading || popupData) && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
            {/* Loader */}
            {loading && (
              <div className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5 text-[#0071dc]" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <p className="text-gray-700 font-medium">Thinking... </p>
              </div>
            )}

            {/* AI Response */}
            {!loading && popupData && (
              <>
                <h2 className="text-xl font-semibold text-[#0071dc] mb-4">Product Information</h2>

                <div className="text-sm text-gray-700 space-y-4 max-h-[60vh] overflow-y-auto">
                  {popupData.ingredients && (
                    <div>
                      <h3 className="font-semibold">Ingredients:</h3>
                      <ul className="list-disc pl-5 text-gray-600">
                        {popupData.ingredients.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {popupData.nutritionalContent && (
                    <div>
                      <h3 className="font-semibold">Nutritional Content:</h3>
                      <ul className="list-disc pl-5 text-gray-600">
                        {popupData.nutritionalContent.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {popupData.benefits && (
                    <div>
                      <h3 className="font-semibold text-green-700">Benefits:</h3>
                      <ul className="list-disc pl-5 text-green-700">
                        {popupData.benefits.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {popupData.disadvantages && (
                    <div>
                      <h3 className="font-semibold text-red-600">Disadvantages:</h3>
                      <ul className="list-disc pl-5 text-red-600">
                        {popupData.disadvantages.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {popupData.raw && (
                    <div className="text-gray-600 whitespace-pre-line border border-gray-200 rounded p-2 bg-gray-50">
                      {popupData.raw}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setPopupData(null)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-xl font-bold"
                >
                  ×
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Grocery;
