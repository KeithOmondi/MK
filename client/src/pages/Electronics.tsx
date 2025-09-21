// src/pages/Electronics.tsx
import React from "react";
import { Laptop, Smartphone, Headphones, Tv, Watch } from "lucide-react";

interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  category: string;
}

const products: Product[] = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    image: "https://via.placeholder.com/300",
    price: 145000,
    category: "Phones",
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    image: "https://via.placeholder.com/300",
    price: 130000,
    category: "Phones",
  },
  {
    id: 3,
    name: "MacBook Pro 16”",
    image: "https://via.placeholder.com/300",
    price: 285000,
    category: "Laptops",
  },
  {
    id: 4,
    name: "Sony WH-1000XM5 Headphones",
    image: "https://via.placeholder.com/300",
    price: 42000,
    category: "Accessories",
  },
  {
    id: 5,
    name: "Samsung 55” Smart TV",
    image: "https://via.placeholder.com/300",
    price: 85000,
    category: "TVs",
  },
  {
    id: 6,
    name: "Apple Watch Series 9",
    image: "https://via.placeholder.com/300",
    price: 52000,
    category: "Wearables",
  },
];

const Electronics: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Page Header */}
      <h1 className="text-3xl font-bold mb-8">Electronics</h1>

      {/* Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 mb-10">
        <div className="flex flex-col items-center p-4 bg-white shadow rounded-xl hover:shadow-md transition cursor-pointer">
          <Smartphone className="w-8 h-8 text-blue-600" />
          <p className="mt-2 text-sm font-medium">Phones</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-white shadow rounded-xl hover:shadow-md transition cursor-pointer">
          <Laptop className="w-8 h-8 text-green-600" />
          <p className="mt-2 text-sm font-medium">Laptops</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-white shadow rounded-xl hover:shadow-md transition cursor-pointer">
          <Headphones className="w-8 h-8 text-red-600" />
          <p className="mt-2 text-sm font-medium">Accessories</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-white shadow rounded-xl hover:shadow-md transition cursor-pointer">
          <Tv className="w-8 h-8 text-purple-600" />
          <p className="mt-2 text-sm font-medium">TVs</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-white shadow rounded-xl hover:shadow-md transition cursor-pointer">
          <Watch className="w-8 h-8 text-yellow-600" />
          <p className="mt-2 text-sm font-medium">Wearables</p>
        </div>
      </div>

      {/* Featured Products */}
      <h2 className="text-2xl font-semibold mb-6">Featured Electronics</h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-blue-600 font-bold mt-2">
                KSh {product.price.toLocaleString()}
              </p>
              <button className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Electronics;
