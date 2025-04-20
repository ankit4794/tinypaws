import { Link } from "wouter";

interface CategoryItem {
  id: number;
  name: string;
  image: string;
  link: string;
}

const FeaturedCategories = () => {
  const categories: CategoryItem[] = [
    {
      id: 1,
      name: "Dogs",
      image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1969&q=80",
      link: "/products/dogs"
    },
    {
      id: 2,
      name: "Cats",
      image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2043&q=80",
      link: "/products/cats"
    },
    {
      id: 3,
      name: "Small Animals",
      image: "https://images.unsplash.com/photo-1591561582301-7ce6587cc286?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
      link: "/products/small-animals"
    },
    {
      id: 4,
      name: "Fresh Meals",
      image: "https://images.unsplash.com/photo-1623428454614-abaf7c258903?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80",
      link: "/fresh-meals"
    }
  ];

  return (
    <section className="py-10 px-4 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">Shop By Category</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="text-center">
              <Link href={category.link} className="block hover:opacity-90 transition">
                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition mb-3">
                  <img 
                    src={category.image}
                    alt={`${category.name} Category`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <h3 className="font-medium text-lg">{category.name}</h3>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
