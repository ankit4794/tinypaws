import HeroBanner from "@/components/home/HeroBanner";
import QuickAddToCart from "@/components/home/QuickAddToCart";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import BestSellers from "@/components/home/BestSellers";
import DeliveryCheck from "@/components/home/DeliveryCheck";
import Testimonials from "@/components/home/Testimonials";
import Newsletter from "@/components/home/Newsletter";
import { Helmet } from "react-helmet";

const HomePage = () => {
  return (
    <>
      <Helmet>
        <title>TinyPaws - Premium Pet Products for Dogs, Cats & Small Animals</title>
        <meta name="description" content="TinyPaws offers premium products for your pets. Shop online for food, toys, accessories, and more for dogs, cats, and small animals. Free shipping available." />
      </Helmet>

      <HeroBanner />
      <QuickAddToCart />
      <FeaturedCategories />
      <BestSellers />
      <DeliveryCheck />
      <Testimonials />
      <Newsletter />
    </>
  );
};

export default HomePage;
