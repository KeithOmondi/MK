// pages/CustomerService.tsx
import React from "react";
import { Phone, Mail, MessageCircle, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

const faqs = [
  {
    id: 1,
    question: "How do I track my order?",
    answer: "Go to 'My Orders' in your account to view real-time tracking updates.",
  },
  {
    id: 2,
    question: "What is your return policy?",
    answer: "You can return items within 14 days of delivery. Conditions apply.",
  },
  {
    id: 3,
    question: "How do I cancel my order?",
    answer: "If your order hasn’t shipped yet, you can cancel it from your order history.",
  },
  {
    id: 4,
    question: "What payment methods do you accept?",
    answer: "We accept credit/debit cards, mobile money, PayPal, and secure wallets.",
  },
];

const CustomerService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-500 py-20 px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-fade-in-up">
            How Can We Help You Today?
          </h1>
          <p className="text-lg opacity-90">
            Find quick answers, or get in touch with our team for personalized support.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        {/* Quick Help & FAQs Section */}
        <section className="mb-16">
          <div className="flex items-center justify-center text-center">
            <h2 className="text-3xl font-bold mb-8 relative after:absolute after:bottom-0 after:left-1/2 after:w-16 after:-translate-x-1/2 after:border-b-4 after:border-blue-500 after:rounded-full">
              <span className="flex items-center gap-3">
                <HelpCircle className="text-blue-500" size={32} />
                Frequently Asked Questions
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-2xl p-6 shadow-md transition-transform hover:scale-105 duration-300"
              >
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Options Section */}
        <section className="text-center">
          <h2 className="text-3xl font-bold mb-8 relative after:absolute after:bottom-0 after:left-1/2 after:w-16 after:-translate-x-1/2 after:border-b-4 after:border-blue-500 after:rounded-full">
            <span className="flex items-center gap-3">
              <MessageCircle className="text-blue-500" size={32} />
              Still Need Help?
            </span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto text-gray-600 mb-12">
            Can't find what you're looking for? Reach out to our support team through these channels.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col items-center bg-white p-8 rounded-2xl shadow-md transition-transform hover:scale-105 duration-300">
              <div className="mb-4 rounded-full bg-blue-100 p-3">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Call Us</h3>
              <p className="text-gray-600">+254 700 000 000</p>
              <p className="text-sm text-gray-500 mt-1">Mon-Fri, 9am - 5pm</p>
            </div>

            <div className="flex flex-col items-center bg-white p-8 rounded-2xl shadow-md transition-transform hover:scale-105 duration-300">
              <div className="mb-4 rounded-full bg-blue-100 p-3">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Email Support</h3>
              <p className="text-gray-600">support@yourshop.com</p>
              <p className="text-sm text-gray-500 mt-1">Typical response in 24 hours</p>
            </div>

            <div className="flex flex-col items-center bg-white p-8 rounded-2xl shadow-md transition-transform hover:scale-105 duration-300">
              <div className="mb-4 rounded-full bg-blue-100 p-3">
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Live Chat</h3>
              <p className="text-gray-600">Available 24/7</p>
              <p className="text-sm text-gray-500 mt-1">Instant assistance</p>
            </div>
          </div>
          <div className="mt-12">
            <Link
              to="/support-ticket"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105"
            >
              <Mail size={20} /> Submit a Support Ticket
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CustomerService;