// components/TrendingNow.tsx
import React from "react";

const trendingItems = [
  { id: "1", title: "Smart Watch", image: "/assets/trending/watch.png" },
  { id: "2", title: "Headphones", image: "/assets/trending/headphones.png" },
  { id: "3", title: "Sneakers", image: "/assets/trending/sneakers.png" },
  { id: "4", title: "Laptop", image: "/assets/trending/laptop.png" },
];

const TrendingNow: React.FC = () => {
  return (
    <section className="mt-8 px-6">
      <h2 className="text-xl font-bold mb-4">🔥 Trending Now</h2>

      <div className="flex gap-6 overflow-x-auto scrollbar-hide">
        {trendingItems.map((item) => (
          <div
            key={item.id}
            className="flex-shrink-0 flex flex-col items-center cursor-pointer group"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-28 h-28 rounded-lg object-cover group-hover:scale-105 transition-transform"
            />
            <p className="mt-2 text-sm">{item.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrendingNow;
