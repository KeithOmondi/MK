import BestDeals from "../components/BestDeals/BestDeals";
import TopCategories from "../components/category/TopCategories";
import Footer from "../components/common/Footer";
import Header from "../components/common/Header";
import FlashSales from "../components/FlashSales/FlashSales";
import Hero from "../components/Hero/Hero";
import WhyChooseUs from "../components/Hero/WhyChooseUs";
import NewArrivals from "../components/NewArrivals/NewArrivals";
import PopularBrands from "../components/PopularBrands/PopularBrands";
import RecentlyViewed from "../components/RecentlyViewed/RecentlyViewed";
import TrendingNow from "../components/Trending/TrendingNow";



export default function HomePage() {


  return (
    <div>
      <Header />
      <Hero />
      <FlashSales />
      <TopCategories />
      <BestDeals />
      <NewArrivals />
      <RecentlyViewed />
      <TrendingNow />
      <PopularBrands />
      <WhyChooseUs />
     <Footer />
    </div>
  );
}
