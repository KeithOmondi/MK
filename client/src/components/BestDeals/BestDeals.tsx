import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Deal {
  id: number;
  name: string;
  img: string;
  price: number;
  oldPrice: number;
  slug: string;
}

const deals: Deal[] = [
  {
    id: 1,
    name: "Smartphone Pro Max",
    slug: "smartphone-pro-max",
    img: "https://img.kilimall.com/c/public/banner-image/100011470.jpg?x-image-process=image/format,webp#",
    price: 499,
    oldPrice: 699,
  },
  {
    id: 2,
    name: "Gaming Headset",
    slug: "gaming-headset",
    img: "https://img.kilimall.com/c/public/banner-image/100011472.jpg?x-image-process=image/format,webp#",
    price: 79,
    oldPrice: 129,
  },
  {
    id: 3,
    name: "Air Fryer XL",
    slug: "air-fryer-xl",
    img: "https://img.kilimall.com/c/public/banner-image/100011473.jpg?x-image-process=image/format,webp#",
    price: 99,
    oldPrice: 159,
  },
  {
    id: 4,
    name: "Smartwatch Series 7",
    slug: "smartwatch-series-7",
    img: "https://img.kilimall.com/c/public/banner-image/100011471.jpg?x-image-process=image/format,webp#",
    price: 149,
    oldPrice: 229,
  },
  {
    id: 5,
    name: "Bluetooth Speaker",
    slug: "bluetooth-speaker",
    img: "https://img.kilimall.com/c/public/banner-image/100011474.jpg?x-image-process=image/format,webp#",
    price: 49,
    oldPrice: 89,
  },
  {
    id: 6,
    name: "4K Smart TV 55”",
    slug: "4k-smart-tv-55",
    img: "https://img.kilimall.com/c/public/banner-image/100011475.jpg?x-image-process=image/format,webp#",
    price: 599,
    oldPrice: 799,
  },
  {
    id: 7,
    name: "Laptop Backpack",
    slug: "laptop-backpack",
    img: "https://img.kilimall.com/c/public/banner-image/100011476.jpg?x-image-process=image/format,webp#",
    price: 39,
    oldPrice: 69,
  },
  {
    id: 8,
    name: "Wireless Mouse",
    slug: "wireless-mouse",
    img: "https://img.kilimall.com/c/public/banner-image/100011477.jpg?x-image-process=image/format,webp#",
    price: 19,
    oldPrice: 39,
  },
];

const BestDeals: React.FC = () => {
  return (
    <section className="bg-[#f9fafb] py-12 px-4 sm:px-8 lg:px-16">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          <span role="img" aria-label="star">⭐</span> Best Deals of the Week
        </h2>

        <Link
          to="/deals"
          className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors"
        >
          View All <ArrowRight size={18} />
        </Link>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {deals.map((deal) => (
          <Link
            to={`/product/${deal.slug}`}
            key={deal.id}
            className="group bg-white shadow rounded-xl overflow-hidden hover:shadow-lg transition"
          >
            <div className="relative">
              <img
                src={deal.img}
                alt={deal.name}
                className="w-full h-40 sm:h-56 object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                -{Math.round(((deal.oldPrice - deal.price) / deal.oldPrice) * 100)}%
              </span>
            </div>
            <div className="p-3">
              <h3 className="text-gray-800 font-medium text-sm truncate">
                {deal.name}
              </h3>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-lg font-bold text-red-600">
                  ${deal.price}
                </span>
                <span className="text-sm line-through text-gray-400">
                  ${deal.oldPrice}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default BestDeals;
