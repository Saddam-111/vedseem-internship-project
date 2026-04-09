import React, { useContext } from "react";
import NavSection from "../components/NavSection";
import HeroGridSection from "../components/HeroGridSection";
import Gift from "../components/Gift";
import ReviewSection from "../components/ReviewSection";
import BlogSection from "../components/BlogSection";
import Footer from "../components/Footer";
import Card from "../components/Card";
import { ItemDataContext } from "../context/ItemContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { items = [] } = useContext(ItemDataContext);
  const navigate = useNavigate();

  const featuredProducts = items.slice(0, 8);
  const categories = [
    { name: "Gifts", slug: "gifts", emoji: "🎁" },
    { name: "Toys", slug: "toys", emoji: "🧸" },
    { name: "Flowers", slug: "flowers", emoji: "💐" },
    { name: "Personalized", slug: "personalized-gifts", emoji: "✨" },
    { name: "Home Decor", slug: "home-decor", emoji: "🏠" },
    { name: "Fashion", slug: "fashion-accessories", emoji: "👗" },
  ];

  return (
    <main className="w-full flex flex-col overflow-hidden">
      <NavSection />
      <HeroGridSection />
      
      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Shop by Category</h2>
          <button 
            onClick={() => navigate("/products")}
            className="text-yellow-600 font-medium hover:text-yellow-700"
          >
            View All →
          </button>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => navigate(`/products/category/${cat.slug}`)}
              className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-lg transition border border-gray-100 hover:border-yellow-400 group"
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition">{cat.emoji}</span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-yellow-600">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      <Gift />

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Featured Products</h2>
          <button 
            onClick={() => navigate("/products")}
            className="text-yellow-600 font-medium hover:text-yellow-700"
          >
            View All →
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Card key={product._id} product={product} />
          ))}
        </div>
      </section>

      <ReviewSection />
      <BlogSection />
      <Footer />
    </main>
  );
};

export default Home;
