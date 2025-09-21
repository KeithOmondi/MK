// src/pages/Grocery.tsx
import React, { useState } from "react";
import {
  Apple,
  Carrot,
  Coffee,
  Cookie,
  Milk,
  ShoppingBasket,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  category: string;
}

const products: Product[] = [
  { id: 1, name: "Fresh Apples (1kg)", image: "https://via.placeholder.com/300x300", price: 250, category: "Fruits" },
  { id: 2, name: "Carrots (1kg)", image: "https://via.placeholder.com/300x300", price: 120, category: "Vegetables" },
  { id: 3, name: "Whole Milk (1L)", image: "https://via.placeholder.com/300x300", price: 95, category: "Dairy" },
  { id: 4, name: "Potato Chips (Large)", image: "https://via.placeholder.com/300x300", price: 180, category: "Snacks" },
  { id: 5, name: "Instant Coffee", image: "https://via.placeholder.com/300x300", price: 450, category: "Beverages" },
  { id: 6, name: "Laundry Soap (2 Pack)", image: "https://via.placeholder.com/300x300", price: 200, category: "Household" },
  { id: 7, name: "Fresh Bread", image: "https://via.placeholder.com/300x300", price: 80, category: "Bakery" },
  { id: 8, name: "Chicken Breast (1kg)", image: "https://via.placeholder.com/300x300", price: 650, category: "Meat" },
  { id: 9, name: "Frozen Peas (500g)", image: "https://via.placeholder.com/300x300", price: 150, category: "Frozen" },
];

const aisles = [
  { name: "All", icon: ShoppingBasket },
  { name: "Fruits", icon: Apple },
  { name: "Vegetables", icon: Carrot },
  { name: "Dairy", icon: Milk },
  { name: "Beverages", icon: Coffee },
  { name: "Snacks", icon: Cookie },
  { name: "Household", icon: Cookie },
  { name: "Bakery", icon: Cookie },
  { name: "Meat", icon: ShoppingBasket },
  { name: "Frozen", icon: ShoppingBasket },
];

const Grocery: React.FC = () => {
  const [selectedAisle, setSelectedAisle] = useState("All");

  const filteredProducts =
    selectedAisle === "All"
      ? products
      : products.filter((p) => p.category === selectedAisle);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-10">
      {/* Sidebar */}
      <aside className="md:col-span-1 bg-white shadow rounded-xl p-6 h-fit sticky top-6">
        <h2 className="text-xl font-bold mb-4">🛒 Shop by Aisle</h2>
        <ul className="space-y-3">
          {aisles.map(({ name, icon: Icon }) => (
            <li key={name}>
              <button
                onClick={() => setSelectedAisle(name)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full text-left transition ${
                  selectedAisle === name
                    ? "bg-green-600 text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <Icon className="w-5 h-5" />
                {name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Products Section */}
      <main className="md:col-span-3">
        <h1 className="text-3xl font-bold mb-6">Groceries</h1>
        <h2 className="text-2xl font-semibold mb-4">
          {selectedAisle === "All" ? "All Products" : selectedAisle}
        </h2>

        {filteredProducts.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
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
                  <p className="text-green-600 font-bold mt-2">
                    KSh {product.price.toLocaleString()}
                  </p>
                  <button className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No products found in this aisle.</p>
        )}
      </main>
    </div>
  );
};

export default Grocery;
