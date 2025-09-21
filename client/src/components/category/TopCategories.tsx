import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Category {
  id: number;
  name: string;
  slug: string;
  img: string;
}

// Example categories (add as many as you want)
const categories: Category[] = [
  { id: 1, name: "Electronics", slug: "electronics", img: "https://img.kilimall.com/c/public/banner-image/100011470.jpg?x-image-process=image/format,webp#" },
  { id: 2, name: "Fashion", slug: "fashion", img: "https://img.kilimall.com/c/public/banner-image/100011471.jpg?x-image-process=image/format,webp#" },
  { id: 3, name: "Gaming", slug: "gaming", img: "https://img.kilimall.com/c/public/banner-image/100011472.jpg?x-image-process=image/format,webp#" },
  { id: 4, name: "Home & Kitchen", slug: "home-kitchen", img: "https://img.kilimall.com/c/public/banner-image/100011473.jpg?x-image-process=image/format,webp#" },
  { id: 5, name: "Beauty", slug: "beauty", img: "https://img.kilimall.com/c/public/banner-image/100011474.jpg?x-image-process=image/format,webp#" },
  { id: 6, name: "Sports", slug: "sports", img: "https://img.kilimall.com/c/public/banner-image/100011475.jpg?x-image-process=image/format,webp#" },
  { id: 7, name: "Books", slug: "books", img: "https://img.kilimall.com/c/public/banner-image/100011476.jpg?x-image-process=image/format,webp#" },
  { id: 8, name: "Toys", slug: "toys", img: "https://img.kilimall.com/c/public/banner-image/100011477.jpg?x-image-process=image/format,webp#" },
  { id: 9, name: "Phones", slug: "phones", img: "https://img.kilimall.com/c/public/banner-image/100011478.jpg?x-image-process=image/format,webp#" },
  { id: 10, name: "Computers", slug: "computers", img: "https://img.kilimall.com/c/public/banner-image/100011479.jpg?x-image-process=image/format,webp#" },
  { id: 11, name: "Cameras", slug: "cameras", img: "https://img.kilimall.com/c/public/banner-image/100011480.jpg?x-image-process=image/format,webp#" },
  { id: 12, name: "Health", slug: "health", img: "https://img.kilimall.com/c/public/banner-image/100011481.jpg?x-image-process=image/format,webp#" },
  { id: 13, name: "Office", slug: "office", img: "https://img.kilimall.com/c/public/banner-image/100011482.jpg?x-image-process=image/format,webp#" },
  { id: 14, name: "Groceries", slug: "groceries", img: "https://img.kilimall.com/c/public/banner-image/100011483.jpg?x-image-process=image/format,webp#" },
  { id: 15, name: "Jewelry", slug: "jewelry", img: "https://img.kilimall.com/c/public/banner-image/100011484.jpg?x-image-process=image/format,webp#" },
  { id: 16, name: "Automotive", slug: "automotive", img: "https://img.kilimall.com/c/public/banner-image/100011485.jpg?x-image-process=image/format,webp#" },
  { id: 17, name: "Pets", slug: "pets", img: "https://img.kilimall.com/c/public/banner-image/100011486.jpg?x-image-process=image/format,webp#" },
  { id: 18, name: "Garden", slug: "garden", img: "https://img.kilimall.com/c/public/banner-image/100011487.jpg?x-image-process=image/format,webp#" },
];

const TopCategories: React.FC = () => {
  const [showAll, setShowAll] = useState(false);

  const displayedCategories = showAll ? categories : categories.slice(0, 16);

  return (
    <section className="bg-white py-12 px-4 sm:px-8 lg:px-16">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          <span role="img" aria-label="categories">🏆</span> Top Categories
        </h2>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayedCategories.map((cat) => (
          <Link
            to={`/category/${cat.slug}`}
            key={cat.id}
            className="block group overflow-hidden rounded-xl bg-gray-100 shadow hover:shadow-lg transition"
          >
            <img
              src={cat.img}
              alt={cat.name}
              className="w-full h-40 object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <div className="p-2 text-center font-medium text-gray-800">
              {cat.name}
            </div>
          </Link>
        ))}
      </div>

      {/* View All Button */}
      {!showAll && categories.length > 16 && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            View All <ArrowRight size={18} />
          </button>
        </div>
      )}
    </section>
  );
};

export default TopCategories;
