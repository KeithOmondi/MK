import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import { fetchCategories, selectCategoryTree } from "../../redux/slices/categorySlice";

const TopCategories: React.FC = () => {
  const [showAll, setShowAll] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const categoryTree = useSelector(selectCategoryTree); // gives tree structure
  const topCategories = categoryTree.map(cat => ({
    _id: cat._id,
    name: cat.name,
    slug: cat.slug,
    img: `/images/categories/${cat.slug}.jpg`, // fallback image mapping (can also come from DB)
  }));

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const displayedCategories = showAll ? topCategories : topCategories.slice(0, 16);

  return (  
    <section className="bg-white py-12 px-4 sm:px-8 lg:px-16">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          <span role="img" aria-label="categories">🏆</span> Top Categories
        </h2>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayedCategories.map((cat) => (
          <Link
            to={`/category/${cat.slug}`}
            key={cat._id}
            className="block group overflow-hidden rounded-xl bg-gray-100 shadow hover:shadow-lg transition"
          >
            <img
              src={cat.img}
              alt={cat.name}
              className="w-full h-40 object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <div className="p-2 text-center font-medium text-gray-800">
              {cat.name}
            </div>
          </Link>
        ))}
      </div>

      {/* View All Button */}
      {!showAll && topCategories.length > 16 && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            View All <ArrowRight size={18} />
          </button>
        </div>
      )}
    </section>
  );
};

export default TopCategories;
