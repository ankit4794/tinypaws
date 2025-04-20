import { Link } from "wouter";
import ProductCard from "@/components/ui/ProductCard";
import { Product } from "@shared/schema";

const BestSellers = () => {
  // This data would typically come from an API
  const bestSellerProducts: Product[] = [
    {
      id: 1,
      name: "Premium Dog Food",
      slug: "premium-dog-food",
      description: "High-quality dog food with balanced nutrition",
      price: 799,
      originalPrice: 999,
      images: ["https://images.unsplash.com/photo-1585846888969-42ae2458f267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"],
      category: "dogs",
      subcategory: "food",
      rating: 4.5,
      reviewCount: 42,
      stock: 100,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      name: "Cat Scratching Post",
      slug: "cat-scratching-post",
      description: "Durable cat scratching post for feline friends",
      price: 1499,
      originalPrice: 1899,
      images: ["https://images.unsplash.com/photo-1623620387429-89ac15da10dc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1958&q=80"],
      category: "cats",
      subcategory: "accessories",
      rating: 5,
      reviewCount: 37,
      stock: 50,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 3,
      name: "Durable Dog Leash",
      slug: "durable-dog-leash",
      description: "Strong and comfortable dog leash for walks",
      price: 699,
      originalPrice: 899,
      images: ["https://images.unsplash.com/photo-1592948078472-4b015cf88c9d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"],
      category: "dogs",
      subcategory: "accessories",
      rating: 4,
      reviewCount: 29,
      stock: 75,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 4,
      name: "Deluxe Hamster Cage",
      slug: "deluxe-hamster-cage",
      description: "Spacious and comfortable cage for hamsters",
      price: 2499,
      originalPrice: 2999,
      images: ["https://images.unsplash.com/photo-1618053935231-4c1f6e6c1336?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80"],
      category: "small-animals",
      subcategory: "hamsters",
      rating: 4.5,
      reviewCount: 18,
      stock: 30,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  return (
    <section className="py-10 px-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Best Sellers</h2>
          <Link href="/products/best-sellers" className="text-black hover:text-gray-700 font-medium">
            View All <i className="fas fa-arrow-right ml-1"></i>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bestSellerProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
