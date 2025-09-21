// src/components/Sidebar.tsx
import { Fragment, useState } from "react";
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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Categories with icons & subcategories
const categories = [
  {
    name: "Electronics",
    icon: <Monitor size={18} />,
    subcategories: [
      "Headphones",
      "Computers & Accessories",
      "Security & Surveillance",
      "Cesorries and Supplies",
      "Office Electronics",
    ],
  },
  {
    name: "Men's Fashion",
    icon: <ShoppingBag size={18} />,
    subcategories: ["Shoes", "Watches", "Clothing", "Accessories"],
  },
  {
    name: "Women's Fashion",
    icon: <ShoppingBag size={18} />,
    subcategories: [
      "Shoes",
      "Watches",
      "Jewellery",
      "Handbags",
      "Clothing",
      "Accessories",
    ],
  },
  {
    name: "Boys & Girls Fashion",
    icon: <ShoppingBag size={18} />,
    subcategories: [
      "Shoes",
      "Watches",
      "Jewellery",
      "Handbags",
      "Clothing",
      "Accessories",
    ],
  },
  {
    name: "Home & Kitchen",
    icon: <Home size={18} />,
    subcategories: [
      "Kitchen & Dining",
      "Wall Art",
      "Light & Ceiling",
      "Cleaning Supplies",
      "Iron and Steamers",
      "Furniture",
      "Bathing",
      "Heating, Cooling & Air Quality",
      "Storage & Organization",
      "Vacuums & Floor Care",
      "Bedding",
    ],
  },
  {
    name: "Eyeglasses",
    icon: <Eye size={18} />,
    subcategories: ["Prescription", "Sunglasses", "Blue Light"],
  },
  {
    name: "Beauty & Personal Care",
    icon: <Eye size={18} />,
    subcategories: [
      "Oral Care",
      "Personal Care",
      "Shave and Hair Removal",
      "Nail, Foot & Hand Care",
      "Fragrance",
      "Hair Care",
      "Skin Care",
      "Makeup",
    ],
  },
  {
    name: "Apple Store",
    icon: <Apple size={18} />,
    subcategories: ["iPhone", "MacBook", "iPad", "Accessories"],
  },
  {
    name: "Sports and Outdoor",
    icon: <Eye size={18} />,
    subcategories: [
      "Sports & Outdoor",
      "Outdoor Recreation",
      "Sports & Fitness",
    ],
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (name: string) => {
    setExpandedCategory(expandedCategory === name ? null : name);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop with blur */}
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
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 bg-[#2D6A4F]">
                <h2 className="text-lg font-bold text-white">Categories</h2>
                <button
                  className="text-white hover:text-gray-200"
                  onClick={onClose}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Categories List */}
              <nav className="flex-1 overflow-y-auto p-4">
                {categories.map((cat) => (
                  <div key={cat.name} className="mb-2">
                    <button
                      onClick={() => toggleCategory(cat.name)}
                      className="flex w-full items-center justify-between px-3 py-2 font-semibold text-gray-700 rounded transition-all duration-200 hover:bg-[#2D6A4F]/10 hover:text-[#2D6A4F] shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        {cat.icon}
                        <span>{cat.name}</span>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          expandedCategory === cat.name ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Subcategories */}
                    {/* Subcategories */}
                    <Transition
                      show={expandedCategory === cat.name}
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
                            // Route format: /category/<category>/<subcategory>
                            to={`/category/${cat.name
                              .toLowerCase()
                              .replace(/\s+/g, "-")}/${sub
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                            key={sub}
                            className="px-2 py-1 text-sm text-gray-600 hover:text-[#FF6B35] hover:bg-gray-50 rounded transition-colors"
                            onClick={onClose}
                          >
                            {sub}
                          </Link>
                        ))}
                      </div>
                    </Transition>
                  </div>
                ))}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 text-sm text-gray-600 bg-[#2D6A4F]/5">
                Shop with us & enjoy exclusive deals!
              </div>
            </Dialog.Panel>
          </Transition.Child>

          {/* Click outside to close */}
          <div className="flex-shrink-0 w-20" aria-hidden="true" />
        </div>
      </Dialog>
    </Transition.Root>
  );
}
