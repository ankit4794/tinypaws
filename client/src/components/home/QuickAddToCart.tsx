import { Link } from "wouter";

interface QuickAddItem {
  id: number;
  title: string;
  image: string;
  link: string;
  bgColor: string;
}

const QuickAddToCart = () => {
  const quickAddItems: QuickAddItem[] = [
    {
      id: 1,
      title: "Pet Essentials",
      image: "https://images.unsplash.com/photo-1567773463078-6d945e4b4482?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
      link: "/products/pet-essentials",
      bgColor: "bg-amber-100"
    },
    {
      id: 2,
      title: "Premium Pet Food",
      image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      link: "/products/pet-food",
      bgColor: "bg-blue-100"
    },
    {
      id: 3,
      title: "Pet Grooming Products",
      image: "https://images.unsplash.com/photo-1559000357-f6b52ddfcbba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
      link: "/products/pet-grooming",
      bgColor: "bg-pink-100"
    },
    {
      id: 4,
      title: "Cat Play Equipment",
      image: "https://images.unsplash.com/photo-1636473407405-e34af518273a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
      link: "/products/cat-toys",
      bgColor: "bg-purple-100"
    },
    {
      id: 5,
      title: "Healthy Dog Treats",
      image: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
      link: "/products/dog-treats",
      bgColor: "bg-yellow-100"
    },
    {
      id: 6,
      title: "Pet Accessories",
      image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2064&q=80",
      link: "/products/pet-accessories",
      bgColor: "bg-green-100"
    }
  ];

  return (
    <section className="py-10 px-4">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-6">Quick Add-To-Carts!</h2>
        <p className="text-gray-600 mb-6">Were you looking for these?</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickAddItems.map((item) => (
            <div key={item.id} className={`${item.bgColor} rounded-lg overflow-hidden`}>
              <Link href={item.link} className="block">
                <img 
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickAddToCart;
