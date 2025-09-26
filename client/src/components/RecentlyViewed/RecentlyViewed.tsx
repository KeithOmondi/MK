// src/components/RecentlyViewed.tsx
import { fetchRecentlyViewed } from "../../redux/slices/recentlyViewedSlice";
import type { AppDispatch, RootState } from "../../redux/store";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const RecentlyViewed: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector(
    (state: RootState) => state.recentlyViewed
  );

  // Fetch recently viewed when component mounts
  useEffect(() => {
    dispatch(fetchRecentlyViewed());
  }, [dispatch]);

  if (loading) return <p className="px-6 text-gray-500">Loading...</p>;
  if (error) return <p className="px-6 text-red-500">⚠ {error}</p>;
  if (items.length === 0) return null;

  return (
    <section className="mt-8 px-6">
      <h2 className="text-xl font-bold mb-4">👀 Recently Viewed</h2>

      <div className="flex gap-6 overflow-x-auto scrollbar-hide">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex-shrink-0 flex flex-col items-center cursor-pointer group"
          >
            <img
              src={item.image || "/placeholder.png"}

              alt={item.name}
              className="w-28 h-28 rounded-lg object-contain group-hover:scale-105 transition-transform"
            />
            <p className="mt-2 text-sm">{item.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
