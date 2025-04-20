import { Link } from "wouter";
import { useCategories, getMainCategories, getCategoryPath } from "@/hooks/use-categories";
import { Loader2 } from "lucide-react";

const FeaturedCategories = () => {
  const { categories, isLoading, error } = useCategories();
  const mainCategories = getMainCategories(categories);

  if (isLoading) {
    return (
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-gray-500">Loading categories...</p>
        </div>
      </section>
    );
  }

  if (error || mainCategories.length === 0) {
    console.error("Error loading categories:", error);
    return null;
  }

  return (
    <section className="py-10 px-4 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">Shop By Category</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {mainCategories.map((category) => (
            <div key={category._id} className="text-center">
              <Link href={getCategoryPath(category)} className="block hover:opacity-90 transition">
                <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition mb-3">
                  <img 
                    src={category.image || "https://storage.googleapis.com/tinypaws-assets/categories/placeholder.jpg"}
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
