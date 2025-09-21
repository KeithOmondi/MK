// components/WhyChooseUs.tsx
import React from "react";
import { Tag, Truck, ShieldCheck, CheckCircle, Headphones, Smartphone } from "lucide-react";

const values = [
  {
    id: 1,
    title: "Unbeatable Deals",
    description: "Save big with discounts and exclusive offers across thousands of products.",
    icon: <Tag className="w-10 h-10 text-blue-600" />,
  },
  {
    id: 2,
    title: "Fast & Reliable Shipping",
    description: "From our store to your doorstep — quick, secure, and trackable.",
    icon: <Truck className="w-10 h-10 text-green-600" />,
  },
  {
    id: 3,
    title: "Secure Checkout",
    description: "Your data is safe with encrypted payment gateways you can trust.",
    icon: <ShieldCheck className="w-10 h-10 text-purple-600" />,
  },
  {
    id: 4,
    title: "Quality Guaranteed",
    description: "We carefully vet every product so you shop worry-free.",
    icon: <CheckCircle className="w-10 h-10 text-yellow-600" />,
  },
  {
    id: 5,
    title: "Always Here for You",
    description: "Our friendly support team is just a click away, anytime you need help.",
    icon: <Headphones className="w-10 h-10 text-red-600" />,
  },
  {
    id: 6,
    title: "Seamless Shopping",
    description: "Enjoy a smooth experience on desktop, mobile, or tablet — shopping made simple.",
    icon: <Smartphone className="w-10 h-10 text-indigo-600" />,
  },
];

const WhyChooseUs: React.FC = () => {
  return (
    <section className="mt-12 px-6">
      <h2 className="text-2xl font-bold text-center mb-8">🌟 Why Choose Us</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {values.map((item) => (
          <div
            key={item.id}
            className="flex flex-col items-center text-center bg-white shadow-md rounded-2xl p-6 hover:shadow-lg transition"
          >
            <div className="mb-4">{item.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-600 text-sm">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;
