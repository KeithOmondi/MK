// components/PopularBrands.tsx
import React from "react";

const brands = [
  { id: "1", name: "Apple", logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYOlzRQawnP8IiktnDa9GSeTknh2O5f444vQ&s" },
  { id: "2", name: "Nike", logo: "data:image/png;base64,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" },
  { id: "3", name: "Samsung", logo: "/assets/brands/samsung.png" },
  { id: "4", name: "Sony", logo: "/assets/brands/sony.png" },
  { id: "5", name: "Adidas", logo: "/assets/brands/adidas.png" },
  { id: "6", name: "HP", logo: "/assets/brands/hp.png" },
];

interface PopularBrandsProps {
  onSelectBrand?: (name: string) => void; // ✅ made optional
}

const PopularBrands: React.FC<PopularBrandsProps> = ({ onSelectBrand }) => {
  return (
    <section className="mt-8 px-6">
      <h2 className="text-xl font-bold mb-4">🏷️ Popular Brands</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {brands.map((brand) => (
          <button
            key={brand.id}
            onClick={() => onSelectBrand?.(brand.name)} // ✅ safe call
            className="flex flex-col items-center group"
          >
            <img
              src={brand.logo}
              alt={brand.name}
              className="w-20 h-20 rounded-full object-contain border group-hover:scale-105 transition-transform"
            />
            <p className="mt-2 text-sm font-medium">{brand.name}</p>
          </button>
        ))}
      </div>
    </section>
  );
};

export default PopularBrands;
