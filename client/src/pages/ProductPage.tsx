// src/pages/ProductPage.tsx
import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Star, ShoppingCart, Zap } from "lucide-react";

// Mock Product
const mockProduct = {
  id: "1",
  name: "Wireless Bluetooth Headphones",
  price: 49.99,
  oldPrice: 79.99,
  stock: 12,
  rating: 4.3,
  reviews: 128,
  images: [
    "https://via.placeholder.com/400x400?text=Headphone+1",
    "https://via.placeholder.com/400x400?text=Headphone+2",
    "https://via.placeholder.com/400x400?text=Headphone+3",
  ],
  description:
    "Enjoy crystal-clear sound with these wireless Bluetooth headphones. Featuring noise cancellation, long battery life, and comfortable ear cups.",
  details: [
    "Bluetooth 5.0",
    "Noise Cancelling",
    "20 Hours Playtime",
    "1-Year Warranty",
  ],
};

// Mock Related Products
const relatedProducts = [
  {
    id: "2",
    name: "Smart Watch Series 6",
    price: 199.99,
    image: "https://via.placeholder.com/300x300?text=Smart+Watch",
  },
  {
    id: "3",
    name: "Gaming Laptop 15”",
    price: 899.99,
    image: "https://via.placeholder.com/300x300?text=Laptop",
  },
  {
    id: "4",
    name: "Noise Cancelling Earbuds",
    price: 59.99,
    image: "https://via.placeholder.com/300x300?text=Earbuds",
  },
  {
    id: "5",
    name: "4K Smart TV",
    price: 499.99,
    image: "https://via.placeholder.com/300x300?text=Smart+TV",
  },
];

const ProductPage = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(mockProduct.images[0]);
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-10">
      {/* Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Images */}
        <div>
          <img
            src={selectedImage}
            alt={mockProduct.name}
            className="w-full h-96 object-contain border rounded-lg"
          />
          <div className="flex gap-2 mt-2">
            {mockProduct.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`thumb-${idx}`}
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-20 object-contain border rounded-lg cursor-pointer ${
                  selectedImage === img
                    ? "border-[#FF6B35]"
                    : "border-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">{mockProduct.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex text-yellow-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill={
                    i < Math.round(mockProduct.rating) ? "currentColor" : "none"
                  }
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {mockProduct.rating} ({mockProduct.reviews} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="space-x-2">
            <span className="text-2xl font-bold text-[#FF6B35]">
              ${mockProduct.price.toFixed(2)}
            </span>
            <span className="text-gray-400 line-through">
              ${mockProduct.oldPrice.toFixed(2)}
            </span>
          </div>

          {/* Stock */}
          <p
            className={`font-medium ${
              mockProduct.stock > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {mockProduct.stock > 0
              ? `In Stock (${mockProduct.stock} left)`
              : "Out of Stock"}
          </p>

          {/* Quantity */}
          <div className="flex items-center gap-3">
            <label htmlFor="qty" className="text-sm font-medium">
              Quantity:
            </label>
            <input
              id="qty"
              type="number"
              min={1}
              max={mockProduct.stock}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-16 border rounded px-2 py-1 text-center"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF6B35] text-white hover:bg-[#e65b2d] transition">
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition">
              <Zap size={18} /> Buy Now
            </button>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold mt-4">Product Description</h2>
            <p className="text-gray-600 mt-1">{mockProduct.description}</p>
          </div>

          {/* Details */}
          <div>
            <h2 className="text-lg font-semibold mt-4">Product Details</h2>
            <ul className="list-disc pl-6 text-gray-600">
              {mockProduct.details.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div>
        <h2 className="text-xl font-bold mb-4">Customers also viewed</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {relatedProducts.map((product) => (
            <Link
              to={`/product/${product.id}`}
              key={product.id}
              className="border rounded-lg p-3 hover:shadow-md transition cursor-pointer block"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 object-contain mb-2"
              />
              <h3 className="text-sm font-medium line-clamp-2">
                {product.name}
              </h3>
              <p className="text-[#FF6B35] font-semibold mt-1">
                ${product.price.toFixed(2)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
