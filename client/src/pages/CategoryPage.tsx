// src/pages/CategoryPage.tsx
import { useParams } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

interface Product {
  id: string;
  title: string;
  price: number;
  stock: number;
  category: string;
  subcategory?: string;
  image: string;
}

// Dummy products (later connect to API)
const products: Product[] = [
  {
    id: "1",
    title: "Wireless Headphones",
    price: 59.99,
    stock: 25,
    category: "electronics",
    subcategory: "headphones",
    image: "/assets/products/headphones.jpg",
  },
  {
    id: "2",
    title: "Gaming Laptop",
    price: 1299.99,
    stock: 8,
    category: "electronics",
    subcategory: "computers-accessories",
    image: "/assets/products/laptop.jpg",
  },
  {
    id: "3",
    title: "Men’s Sneakers",
    price: 79.99,
    stock: 12,
    category: "mens-fashion",
    subcategory: "shoes",
    image: "/assets/products/sneakers.jpg",
  },
  {
    id: "4",
    title: "Women’s Handbag",
    price: 45.0,
    stock: 40,
    category: "womens-fashion",
    subcategory: "handbags",
    image: "/assets/products/handbag.jpg",
  },
];

export default function CategoryPage() {
  const { category, subcategory } = useParams<{ category: string; subcategory?: string }>();

  // Normalize params for filtering
  const categoryKey = category?.toLowerCase();
  const subcategoryKey = subcategory?.toLowerCase();

  const filteredProducts = products.filter((p) => {
    const matchesCategory = p.category.toLowerCase() === categoryKey;
    const matchesSubcategory = subcategoryKey ? p.subcategory?.toLowerCase() === subcategoryKey : true;
    return matchesCategory && matchesSubcategory;
  });

  return (
    <>
    <div><Header /></div>
    <section className="p-6">
      <h1 className="text-2xl font-bold capitalize mb-4">
        {subcategory ? `${subcategory.replace("-", " ")} in ${category}` : category}
      </h1>

      {filteredProducts.length === 0 ? (
        <p className="text-gray-500">No products found in this category.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4 hover:shadow-lg transition"
            >
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-40 object-contain mb-3"
              />
              <h2 className="font-semibold text-sm">{product.title}</h2>
              <p className="text-[#2D6A4F] font-bold">${product.price}</p>
              <p className="text-xs text-gray-500">Stock: {product.stock}</p>
              <button className="mt-2 bg-[#2D6A4F] text-white px-3 py-1 rounded hover:bg-[#1B4332] text-sm">
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
    <div><Footer /></div>
    </>
  );
}
