// src/pages/Fashion.tsx
import React from "react";
import { Shirt, ShoppingBag, Watch,  Baby } from "lucide-react";

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
    name: "Men's Casual Shirt",
    image: "https://via.placeholder.com/300x400",
    price: 2500,
    category: "Men",
  },
  {
    id: 2,
    name: "Women's Summer Dress",
    image: "https://via.placeholder.com/300x400",
    price: 3200,
    category: "Women",
  },
  {
    id: 3,
    name: "Kids' Sneakers",
    image: "https://via.placeholder.com/300x400",
    price: 1800,
    category: "Kids",
  },
  {
    id: 4,
    name: "Leather Wrist Watch",
    image: "https://via.placeholder.com/300x400",
    price: 7000,
    category: "Accessories",
  },
  {
    id: 5,
    name: "Designer Sunglasses",
    image: "https://via.placeholder.com/300x400",
    price: 5500,
    category: "Accessories",
  },
  {
    id: 6,
    name: "Stylish Handbag",
    image: "https://via.placeholder.com/300x400",
    price: 6400,
    category: "Women",
  },
];

const Fashion: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Page Header */}
      <h1 className="text-3xl font-bold mb-8">Fashion</h1>

      {/* Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-10">
        <div className="flex flex-col items-center p-4 bg-white shadow rounded-xl hover:shadow-md transition cursor-pointer">
          <Shirt className="w-8 h-8 text-blue-600" />
          <p className="mt-2 text-sm font-medium">Men</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-white shadow rounded-xl hover:shadow-md transition cursor-pointer">
          <ShoppingBag className="w-8 h-8 text-pink-600" />
          <p className="mt-2 text-sm font-medium">Women</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-white shadow rounded-xl hover:shadow-md transition cursor-pointer">
          <Baby className="w-8 h-8 text-yellow-600" />
          <p className="mt-2 text-sm font-medium">Kids</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-white shadow rounded-xl hover:shadow-md transition cursor-pointer">
          <Watch className="w-8 h-8 text-green-600" />
          <p className="mt-2 text-sm font-medium">Accessories</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-white shadow rounded-xl hover:shadow-md transition cursor-pointer">
          <Watch className="w-8 h-8 text-purple-600" />
          <p className="mt-2 text-sm font-medium">Shoes & More</p>
        </div>
      </div>

      {/* Featured Products */}
      <h2 className="text-2xl font-semibold mb-6">Trending Fashion</h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-60 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-pink-600 font-bold mt-2">
                KSh {product.price.toLocaleString()}
              </p>
              <button className="mt-4 w-full bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Fashion;
