// src/components/Sidebar.tsx
import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Monitor,
  ShoppingBag,
  Home,
  Eye,
  Apple,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  selectCategoryTree,
  selectCategoryLoading,
} from "../../redux/slices/categorySlice";
import type { AppDispatch } from "../../redux/store";

// ----------------- TYPES -----------------
interface Subcategory {
  _id: string;
  name: string;
  slug: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  subcategories: Subcategory[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// ----------------- ICON MAP -----------------
const iconMap: Record<string, React.ReactNode> = {
  Monitor: <Monitor size={18} />,
  ShoppingBag: <ShoppingBag size={18} />,
  Home: <Home size={18} />,
  Eye: <Eye size={18} />,
  Apple: <Apple size={18} />,
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const categories = useSelector(selectCategoryTree);
  const loading = useSelector(selectCategoryLoading);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          {/* MAIN SIDEBAR (Categories) */}
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative w-80 max-w-full bg-white shadow-xl flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-[#2D6A4F]">
                <h2 className="text-lg font-bold text-white">Categories</h2>
                <button
                  className="text-white hover:text-gray-200"
                  onClick={onClose}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Categories */}
              <nav className="flex-1 overflow-y-auto p-4">
                {loading ? (
                  <p className="text-gray-500 text-sm">Loading categories...</p>
                ) : (
                  categories.map((cat: Category) => (
                    <button
                      key={cat._id}
                      onClick={() => setSelectedCategory(cat)}
                      className="flex w-full items-center justify-between px-3 py-2 font-semibold text-gray-700 rounded transition-all duration-200 hover:bg-[#2D6A4F]/10 hover:text-[#2D6A4F] shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        {iconMap[cat.icon || ""] || <ShoppingBag size={18} />}
                        <span>{cat.name}</span>
                      </div>
                      <ChevronRight size={16} />
                    </button>
                  ))
                )}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 text-sm text-gray-600 bg-[#2D6A4F]/5">
                Shop with us & enjoy exclusive deals!
              </div>
            </Dialog.Panel>
          </Transition.Child>

          {/* SUB-SIDEBAR (Subcategories) */}
          {selectedCategory && (
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="relative w-72 bg-white shadow-xl flex flex-col h-full border-l border-gray-200">
                {/* Sub Header */}
                <div className="flex items-center justify-between p-4 bg-[#2D6A4F]">
                  <div className="flex items-center gap-2 text-white">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="hover:text-gray-200"
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <h2 className="text-lg font-bold">{selectedCategory.name}</h2>
                  </div>
                  <button
                    className="text-white hover:text-gray-200"
                    onClick={onClose}
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Subcategories */}
                <nav className="flex-1 overflow-y-auto p-4">
                  {selectedCategory.subcategories?.length ? (
                    selectedCategory.subcategories.map((sub) => (
                      <Link
                        key={sub._id}
                        to={`/category/${sub.slug}`}
                        className="block px-3 py-2 rounded text-gray-700 hover:bg-gray-100 hover:text-[#FF6B35] transition-colors"
                        onClick={onClose}
                      >
                        {sub.name}
                      </Link>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No subcategories available.
                    </p>
                  )}
                </nav>
              </div>
            </Transition.Child>
          )}
        </div>
      </Dialog>
    </Transition.Root>
  );
}
