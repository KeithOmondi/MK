import React from "react";

export interface Brand {
  id: string;
  name: string;
  logo: string;
}

export interface PopularBrandsProps {
  brands?: Brand[]; // Allow overriding from outside
  onSelectBrand?: (name: string) => void;
}

const DEFAULT_BRANDS: Brand[] = [
  {
    id: "1",
    name: "Apple",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYOlzRQawnP8IiktnDa9GSeTknh2O5f444vQ&s",
  },
  {
    id: "2",
    name: "Nike",
    logo: "data:image/png;base64,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",
  },
  { id: "3", name: "Samsung", logo: "data:image/png;base64,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" },
  { id: "4", name: "Sony", logo: "/assets/brands/sony.png" },
  { id: "5", name: "Adidas", logo: "/assets/brands/adidas.png" },
  { id: "6", name: "HP", logo: "/assets/brands/hp.png" },
];

const PopularBrands: React.FC<PopularBrandsProps> = ({
  brands = DEFAULT_BRANDS,
  onSelectBrand,
}) => {
  return (
    <section className="mt-10 px-6">
      <h2 className="text-xl font-semibold mb-5 text-gray-800 dark:text-gray-200">
        🏷️ Popular Brands
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {brands.map((brand) => (
          <button
            key={brand.id}
            onClick={() => onSelectBrand?.(brand.name)}
            className="flex flex-col items-center group focus:outline-none"
            aria-label={`View products from ${brand.name}`}
          >
            <img
              src={brand.logo}
              alt={brand.name}
              loading="lazy"
              className="w-20 h-20 rounded-full object-contain border border-gray-200 dark:border-gray-700 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-transform duration-300"
            />
            <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-indigo-600">
              {brand.name}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
};

export default React.memo(PopularBrands);
