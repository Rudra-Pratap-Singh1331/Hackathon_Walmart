import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";

const Search = () => {
  const [params] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const query = params.get("q");

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/search?q=${query}`);
        setResults(res.data);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-blue-50 text-gray-800 p-6">
      <h2 className="text-2xl font-semibold mb-4">
        Search Results for: <span className="text-blue-700">"{query}"</span>
      </h2>

      {loading ? (
        <p className="text-gray-600">🔄 Loading results...</p>
      ) : results.length === 0 ? (
        <p className="text-red-600 text-lg">No matching products found.</p>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-4">
            Found {results.length} product{results.length > 1 ? "s" : ""}.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {results.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-[0px_6px_19px_6px_#dbeafe] p-4 hover:shadow-lg transition flex flex-col"
                style={{ height: "420px", width: "300px" }}
              >
                <img
                  src={product.imgUrl}
                  alt={product.name}
                  className="w-full h-40 object-contain rounded-md mb-4"
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

                <div className="mt-auto">
                  <Link to={`/product/${product._id}`}>
                    <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition text-sm w-full">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Search;
