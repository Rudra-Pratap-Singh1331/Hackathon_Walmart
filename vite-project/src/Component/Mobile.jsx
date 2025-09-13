import React from 'react'
import { useEffect , useState } from 'react';
import{Link} from "react-router-dom";
import axios from 'axios';
const Mobile = () => {
  
  const [shoes , setShoes] = useState([])
  
  const cartId = localStorage.getItem("cartId")
  useEffect(() => {
  const fetchShoes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products/category/mobile");
      setShoes(res.data); // assuming useState([]) declared as shoes
    } catch (err) {
      console.error("Failed to fetch shoes", err);
    }
  };

  fetchShoes();
}, []);
  return (
   <div className="min-h-screen bg-blue-50 text-gray-800 p-6">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {shoes.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-xl shadow-[0px_6px_19px_6px_#dbeafe] p-4 hover:shadow-lg transition flex flex-col"
            style={{ height: "420px", width: "300px" }}
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

            <h2 className="text-xl font-semibold text-blue-800 mb-1 line-clamp-1">
              {product.name}
            </h2>

            <p
              className="text-sm text-gray-600 mb-2 line-clamp-2 overflow-hidden text-ellipsis"
              style={{ maxHeight: "3.2em" }}
            >
              {product.description}
            </p>

            <div className="text-sm text-gray-700 mb-4">
              <p>
                <span className="font-medium">Price:</span> ₹{product.price}
              </p>
              <p>
                <span className="font-medium">In Stock:</span> {product.quantity}
              </p>
            </div>

            {/* 🔗 View Details */}
            <div className="mt-auto">
              <Link to={`/product/${product._id}/${cartId}`}>
                <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition text-sm w-full">
                  View Details
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Mobile