// src/components/Sidebar.tsx
import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  X,
  ChevronDown,
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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// map string -> icon
const iconMap: Record<string, React.ReactNode> = {
  Monitor: <Monitor size={18} />,
  ShoppingBag: <ShoppingBag size={18} />,
  Home: <Home size={18} />,
  Eye: <Eye size={18} />,
  Apple: <Apple size={18} />,
};

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  const categories = useSelector(selectCategoryTree);
  const loading = useSelector(selectCategoryLoading);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const toggleCategory = (id: string) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-50 backdrop-blur-sm"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-50 backdrop-blur-sm"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
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
                  categories.map((cat) => (
                    <div key={cat._id} className="mb-2">
                      <button
                        onClick={() => toggleCategory(cat._id)}
                        className="flex w-full items-center justify-between px-3 py-2 font-semibold text-gray-700 rounded transition-all duration-200 hover:bg-[#2D6A4F]/10 hover:text-[#2D6A4F] shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          {iconMap[cat.icon || ""] || (
                            <ShoppingBag size={18} />
                          )}
                          <span>{cat.name}</span>
                        </div>
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${
                            expandedCategory === cat._id ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Subcategories */}
                      <Transition
                        show={expandedCategory === cat._id}
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 -translate-y-2"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 -translate-y-2"
                      >
                        <div className="ml-6 mt-1 flex flex-col gap-1">
                          {cat.subcategories.map((sub) => (
                            <Link
                              key={sub._id}
                              to={`/category/${sub.slug}`} // ✅ simplified
                              className="px-2 py-1 text-sm text-gray-600 hover:text-[#FF6B35] hover:bg-gray-50 rounded transition-colors"
                              onClick={onClose}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </Transition>
                    </div>
                  ))
                )}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 text-sm text-gray-600 bg-[#2D6A4F]/5">
                Shop with us & enjoy exclusive deals!
              </div>
            </Dialog.Panel>
          </Transition.Child>

          <div className="flex-shrink-0 w-20" aria-hidden="true" />
        </div>
      </Dialog>
    </Transition.Root>
  );
}
