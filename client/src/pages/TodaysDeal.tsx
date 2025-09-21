// src/pages/TodaysDeal.tsx
import React from "react";
import { Clock, Percent, ShoppingCart } from "lucide-react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

interface DealProduct {
  id: number;
  name: string;
  image: string;
  price: number;
  oldPrice: number;
  discount: number;
  stock: number;
}

const deals: DealProduct[] = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    image: "https://via.placeholder.com/300",
    price: 2500,
    oldPrice: 4000,
    discount: 38,
    stock: 12,
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    image: "https://via.placeholder.com/300",
    price: 4500,
    oldPrice: 7000,
    discount: 36,
    stock: 7,
  },
  {
    id: 3,
    name: "Portable Laptop Stand",
    image: "https://via.placeholder.com/300",
    price: 1800,
    oldPrice: 2500,
    discount: 28,
    stock: 25,
  },
   {
    id: 4,
    name: "Portable Laptop Stand",
    image: "https://via.placeholder.com/300",
    price: 1800,
    oldPrice: 2500,
    discount: 28,
    stock: 2,
  },
];

const TodaysDeal: React.FC = () => {
  return (
    <>
    <div><Header /></div>
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Clock className="w-7 h-7 text-red-600" />
        Today's Deals
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
        {deals.map((deal) => (
          <div
            key={deal.id}
            className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition"
          >
            <img
              src={deal.image}
              alt={deal.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold">{deal.name}</h2>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-red-600 text-xl font-bold">
                  KSh {deal.price.toLocaleString()}
                </span>
                <span className="line-through text-gray-400 text-sm">
                  KSh {deal.oldPrice.toLocaleString()}
                </span>
                <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                  <Percent className="w-3 h-3" />-{deal.discount}%
                </span>
              </div>

              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-red-500 h-2.5 rounded-full"
                    style={{
                      width: `${Math.max(
                        10,
                        (deal.stock / 30) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {deal.stock} left in stock
                </p>
              </div>

              <button className="mt-4 w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div><Footer /></div>
    </>
  );
};

export default TodaysDeal;
