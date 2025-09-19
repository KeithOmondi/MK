import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Category {
  id: number;
  name: string;
  img: string;
  slug: string;
}

const categories: Category[] = [
  {
    id: 1,
    name: "Electronics",
    slug: "electronics",
    img: "https://img.kilimall.com/c/public/banner-image/100011470.jpg?x-image-process=image/format,webp#",
  },
  {
    id: 2,
    name: "Fashion",
    slug: "fashion",
    img: "https://img.kilimall.com/c/public/banner-image/100011471.jpg?x-image-process=image/format,webp#",
  },
  {
    id: 3,
    name: "Gaming",
    slug: "gaming",
    img: "https://img.kilimall.com/c/public/banner-image/100011472.jpg?x-image-process=image/format,webp#",
  },
  {
    id: 4,
    name: "Home & Kitchen",
    slug: "home-kitchen",
    img: "https://img.kilimall.com/c/public/banner-image/100011473.jpg?x-image-process=image/format,webp#",
  },
];

const FlashSales: React.FC = () => {
  return (
    <section className="bg-[#eee] py-12 px-4 sm:px-8 lg:px-16">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">
          <span role="img" aria-label="categories">🛍️</span> Shop by Category
        </h2>
        <Link
          to="/categories"
          className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors"
        >
          View All <ArrowRight size={18} />
        </Link>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Link
            to={`/category/${cat.slug}`}
            key={cat.id}
            className="block group overflow-hidden  transition"
          >
            <img
              src={cat.img}
              alt={cat.name}
              className="w-full h-40 sm:h-56 object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FlashSales;
