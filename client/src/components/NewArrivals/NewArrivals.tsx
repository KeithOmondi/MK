import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  slug: string;
  img: string;
  price: number;
}

const newArrivals: Product[] = [
  {
    id: 1,
    name: "Wireless Earbuds X",
    slug: "wireless-earbuds-x",
    img: "https://img.kilimall.com/c/public/banner-image/100011470.jpg?x-image-process=image/format,webp#",
    price: 59,
  },
  {
    id: 2,
    name: "Smart Home Lamp",
    slug: "smart-home-lamp",
    img: "https://img.kilimall.com/c/public/banner-image/100011471.jpg?x-image-process=image/format,webp#",
    price: 89,
  },
  {
    id: 3,
    name: "Yoga Mat Pro",
    slug: "yoga-mat-pro",
    img: "https://img.kilimall.com/c/public/banner-image/100011472.jpg?x-image-process=image/format,webp#",
    price: 35,
  },
  {
    id: 4,
    name: "Smartwatch Fit Band",
    slug: "smartwatch-fit-band",
    img: "https://img.kilimall.com/c/public/banner-image/100011473.jpg?x-image-process=image/format,webp#",
    price: 129,
  },
  {
    id: 5,
    name: "Mini Projector",
    slug: "mini-projector",
    img: "https://img.kilimall.com/c/public/banner-image/100011474.jpg?x-image-process=image/format,webp#",
    price: 249,
  },
  {
    id: 6,
    name: "VR Headset 2.0",
    slug: "vr-headset-2",
    img: "https://img.kilimall.com/c/public/banner-image/100011475.jpg?x-image-process=image/format,webp#",
    price: 199,
  },
  {
    id: 7,
    name: "Portable Blender",
    slug: "portable-blender",
    img: "https://img.kilimall.com/c/public/banner-image/100011476.jpg?x-image-process=image/format,webp#",
    price: 49,
  },
  {
    id: 8,
    name: "Robot Vacuum",
    slug: "robot-vacuum",
    img: "https://img.kilimall.com/c/public/banner-image/100011477.jpg?x-image-process=image/format,webp#",
    price: 329,
  },
];

const NewArrivals: React.FC = () => {
  return (
    <section className="bg-white py-12 px-4 sm:px-8 lg:px-16">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          <span role="img" aria-label="sparkles">✨</span> New Arrivals
        </h2>

        <Link
          to="/new-arrivals"
          className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors"
        >
          View All <ArrowRight size={18} />
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {newArrivals.map((product) => (
          <Link
            to={`/product/${product.slug}`}
            key={product.id}
            className="group bg-gray-50 shadow rounded-xl overflow-hidden hover:shadow-lg transition"
          >
            <div className="relative">
              <img
                src={product.img}
                alt={product.name}
                className="w-full h-40 sm:h-56 object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                New
              </span>
            </div>
            <div className="p-3">
              <h3 className="text-gray-800 font-medium text-sm truncate">
                {product.name}
              </h3>
              <div className="mt-2">
                <span className="text-lg font-bold text-gray-900">
                  ${product.price}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default NewArrivals;
