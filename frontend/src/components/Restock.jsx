import React, { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

export default function Restock() {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [restockQuantities, setRestockQuantities] = useState({});

  const fetchLowStock = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/products/low-stock");
      const data = await res.json();
      setLowStockItems(data);
    } catch (err) {
      console.error("Failed to fetch low stock items:", err);
    }
  };

  useEffect(() => {
    fetchLowStock();
  }, []);

  const handleRestock = async (productId) => {
    const quantity = restockQuantities[productId] || 0;
    if (quantity <= 0) {
      toast.error("Please enter a valid quantity to restock.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/restockproducts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success("Product restocked successfully!");
        setRestockQuantities((prev) => ({ ...prev, [productId]: 0 }));
        setLowStockItems((prevItems) =>
          prevItems.filter((item) => item._id !== productId)
        );
      } else {
        toast.error(result.error || "Failed to restock.");
      }
    } catch (err) {
      console.error("Restock error:", err);
      toast.error("Server error occurred.");
    }
  };

  const handleQuantityChange = (productId, value) => {
    const qty = parseInt(value);
    if (!isNaN(qty)) {
      setRestockQuantities((prev) => ({ ...prev, [productId]: qty }));
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 text-gray-800 p-6">
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="text-3xl font-bold text-blue-700 mb-8 text-center">
        Restock Products
      </h1>
      { lowStockItems.length===0 ? <div className="text-xl text-center ">no items to restock</div>:
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {lowStockItems.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-xl shadow-[0px_6px_19px_6px_#dbeafe] p-4 hover:shadow-lg transition flex flex-col"
            style={{ height: "460px", width: "300px" }}
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
              {product.name || "Unnamed Product"}
            </h2>

            <p className="text-sm text-gray-600 mb-2 line-clamp-2 overflow-hidden text-ellipsis" style={{ maxHeight: "3.2em" }}>
              {product.description || "No description available."}
            </p>

            <div className="text-sm text-gray-700 mb-4">
              <p>
                <span className="font-medium">Price:</span> ₹{product.price || "N/A"}
              </p>
              <p>
                <span className="font-medium">In Stock:</span> {product.quantity ?? "?"}
              </p>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                placeholder="Qty"
                value={restockQuantities[product._id] || ""}
                onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring focus:border-blue-300"
                min="1"
              />
            </div>

            <button
              onClick={() => handleRestock(product._id)}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition text-sm mt-auto"
            >
              Restock
            </button>
          </div>
        ))}
      </div>
      }
    </div>
  );
}