// src/pages/SearchResults.tsx
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts } from "../../redux/slices/productSlice";
import type { RootState, AppDispatch } from "../../redux/store";

const useQuery = () => new URLSearchParams(useLocation().search);

const SearchResults: React.FC = () => {
  const query = useQuery().get("q") || "";
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading } = useSelector(
    (state: RootState) => state.products
  );

  useEffect(() => {
    if (query) dispatch(fetchProducts({ search: query }));
  }, [query, dispatch]);

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Search Results for “{query}”</h2>
      {loading ? (
        <p>Loading...</p>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-lg shadow p-3 cursor-pointer"
            >
              <img
                src={p.images?.[0]?.url || "/assets/placeholder.png"}
                alt={p.name}
                className="w-full h-40 object-contain"
              />
              <p className="font-semibold mt-2">{p.name}</p>
              <p className="text-green-700 font-bold">Ksh {p.price}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No products found.</p>
      )}
    </div>
  );
};

export default SearchResults;
