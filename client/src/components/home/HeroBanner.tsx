import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface BannerSlide {
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
}

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides: BannerSlide[] = [
    {
      image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
      title: "Ready, Set, Walk!",
      subtitle: "Harnesses | Leashes | Collars",
      buttonText: "Shop Now",
      buttonLink: "/products/walking-gear"
    },
    {
      image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1969&q=80",
      title: "Premium Food for Happy Pets",
      subtitle: "Quality Nutrition | Healthy Ingredients",
      buttonText: "Explore Food",
      buttonLink: "/products/dogs/food"
    },
    {
      image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2043&q=80",
      title: "Purr-fect Cat Accessories",
      subtitle: "Toys | Scratchers | Cozy Beds",
      buttonText: "Shop Cat Products",
      buttonLink: "/products/cats"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Left Arrow */}
      <button 
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/70 rounded-full p-2 shadow-md"
        onClick={prevSlide}
      >
        <i className="fas fa-chevron-left text-black"></i>
      </button>
      
      {/* Banner Image */}
      <div className="w-full h-[400px] relative">
        <div 
          className="absolute inset-0 transition-opacity duration-500 ease-in-out"
          style={{
            backgroundImage: `url(${slides[currentSlide].image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 banner-gradient"></div>
        </div>
        
        {/* Banner Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-lg">
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-2">
                {slides[currentSlide].title}
              </h1>
              <h2 className="text-xl md:text-2xl text-white drop-shadow-lg mb-6">
                {slides[currentSlide].subtitle}
              </h2>
              <Link href={slides[currentSlide].buttonLink}>
                <Button className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 px-8 rounded transition">
                  {slides[currentSlide].buttonText}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Arrow */}
      <button 
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/70 rounded-full p-2 shadow-md"
        onClick={nextSlide}
      >
        <i className="fas fa-chevron-right text-black"></i>
      </button>
      
      {/* Pagination Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button 
            key={index}
            className={`w-2 h-2 rounded-full bg-white ${currentSlide === index ? 'opacity-100' : 'opacity-50'}`}
            onClick={() => goToSlide(index)}
          ></button>
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;
