// components/RecentlyViewed.tsx
import React from "react";

const recentlyViewed = [
  { id: "1", title: "Wireless Earbuds", image: "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg" },
  { id: "2", title: "Backpack", image: "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg" },
  { id: "3", title: "Gaming Mouse", image: "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg" },
];

const RecentlyViewed: React.FC = () => {
  return (
    <section className="mt-8 px-6">
      <h2 className="text-xl font-bold mb-4">👀 Recently Viewed</h2>

      <div className="flex gap-6 overflow-x-auto scrollbar-hide">
        {recentlyViewed.map((item) => (
          <div
            key={item.id}
            className="flex-shrink-0 flex flex-col items-center cursor-pointer group"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-28 h-28 rounded-lg object-contain group-hover:scale-105 transition-transform"
            />
            <p className="mt-2 text-sm">{item.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
