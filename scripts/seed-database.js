// Database seeding script for TinyPaws
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Define models
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  description: String,
  image: String,
  isActive: { type: Boolean, default: true },
  type: { type: String, enum: ['shop_for', 'accessories', 'brands', 'age'] },
  forPet: { type: String, enum: ['dog', 'cat', 'small_animal', 'all'] },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

const BrandSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  logo: { type: String, required: true },
  bannerImage: String,
  featured: { type: Boolean, default: false },
  discount: { 
    type: { type: String, enum: ['flat', 'percentage', 'none'], default: 'none' },
    value: { type: Number, default: 0 },
    label: String
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const ProductVariantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: Number,
  stock: { type: Number, default: 0 },
  weight: Number,
  weightUnit: { type: String, enum: ['g', 'kg'] },
  packSize: Number,
  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  longDescription: String,
  price: { type: Number, required: true },
  originalPrice: Number,
  images: [String],
  features: [String],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  ageGroup: String,
  stock: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  hasVariants: { type: Boolean, default: false },
  variantType: { type: String, enum: ['weight', 'pack', 'none'], default: 'none' },
  variants: [ProductVariantSchema]
}, { timestamps: true });

// Register models
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Brand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// Sample data
const seedCategories = [
  {
    name: 'Dogs',
    slug: 'dogs',
    type: 'shop_for',
    forPet: 'dog',
    image: 'https://storage.googleapis.com/tinypaws-assets/categories/dogs.jpg',
    displayOrder: 1,
    description: 'Products for your canine companion',
    isActive: true
  },
  {
    name: 'Cats',
    slug: 'cats',
    type: 'shop_for',
    forPet: 'cat',
    image: 'https://storage.googleapis.com/tinypaws-assets/categories/cats.jpg',
    displayOrder: 2,
    description: 'Everything your feline friend needs',
    isActive: true
  },
  {
    name: 'Small Animals',
    slug: 'small-animals',
    type: 'shop_for', 
    forPet: 'small_animal',
    image: 'https://storage.googleapis.com/tinypaws-assets/categories/small-animals.jpg',
    displayOrder: 3,
    description: 'Products for rabbits, hamsters, and other small pets',
    isActive: true
  }
];

const seedBrands = [
  {
    name: 'Royal Canin',
    slug: 'royal-canin',
    description: 'Premium pet nutrition tailored to specific breeds and needs',
    logo: 'https://storage.googleapis.com/tinypaws-assets/brands/royal-canin.png',
    featured: true,
    isActive: true
  },
  {
    name: 'Pedigree',
    slug: 'pedigree',
    description: 'Quality dog food and treats for all life stages',
    logo: 'https://storage.googleapis.com/tinypaws-assets/brands/pedigree.png',
    featured: true,
    isActive: true
  },
  {
    name: 'Whiskas',
    slug: 'whiskas',
    description: 'Specialized nutrition for cats',
    logo: 'https://storage.googleapis.com/tinypaws-assets/brands/whiskas.png',
    featured: true,
    isActive: true
  }
];

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Seed the database
async function seedDatabase() {
  try {
    await connectDB();
    
    // Clear existing data
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Product.deleteMany({});
    
    // Insert categories
    const categories = await Category.insertMany(seedCategories);
    console.log(`${categories.length} categories inserted`);
    
    // Insert brands
    const brands = await Brand.insertMany(seedBrands);
    console.log(`${brands.length} brands inserted`);
    
    // Create sample subcategories
    const dogCategory = categories.find(c => c.slug === 'dogs');
    const catCategory = categories.find(c => c.slug === 'cats');
    
    // Dog subcategories
    const dogSubcategories = [
      {
        name: 'Dog Food',
        slug: 'dog-food',
        parentId: dogCategory._id,
        type: 'accessories',
        forPet: 'dog',
        displayOrder: 1,
        isActive: true
      },
      {
        name: 'Dog Toys',
        slug: 'dog-toys',
        parentId: dogCategory._id,
        type: 'accessories',
        forPet: 'dog',
        displayOrder: 2,
        isActive: true
      },
      {
        name: 'Dog Accessories',
        slug: 'dog-accessories',
        parentId: dogCategory._id,
        type: 'accessories',
        forPet: 'dog',
        displayOrder: 3,
        isActive: true
      }
    ];
    
    // Cat subcategories
    const catSubcategories = [
      {
        name: 'Cat Food',
        slug: 'cat-food',
        parentId: catCategory._id,
        type: 'accessories',
        forPet: 'cat',
        displayOrder: 1,
        isActive: true
      },
      {
        name: 'Cat Toys',
        slug: 'cat-toys',
        parentId: catCategory._id,
        type: 'accessories',
        forPet: 'cat',
        displayOrder: 2,
        isActive: true
      },
      {
        name: 'Cat Accessories',
        slug: 'cat-accessories',
        parentId: catCategory._id,
        type: 'accessories',
        forPet: 'cat',
        displayOrder: 3,
        isActive: true
      }
    ];
    
    // Insert all subcategories
    const subcategories = await Category.insertMany([...dogSubcategories, ...catSubcategories]);
    console.log(`${subcategories.length} subcategories inserted`);
    
    // Create some products
    const royalCanin = brands.find(b => b.slug === 'royal-canin');
    const pedigree = brands.find(b => b.slug === 'pedigree');
    const whiskas = brands.find(b => b.slug === 'whiskas');
    
    const dogFood = subcategories.find(c => c.slug === 'dog-food');
    const dogToys = subcategories.find(c => c.slug === 'dog-toys');
    const catFood = subcategories.find(c => c.slug === 'cat-food');
    
    const products = [
      {
        name: 'Royal Canin Medium Adult Dry Dog Food',
        slug: 'royal-canin-medium-adult-dry-dog-food',
        description: 'Complete nutrition specifically formulated for medium-sized adult dogs',
        longDescription: 'Royal Canin Medium Adult Dry Dog Food provides precise nutrition for your medium-sized dogs specific needs. Formulated for dogs between 11 and 25 kg, this food supports healthy digestion with highly digestible proteins and a balanced supply of fibers.',
        price: 1299,
        originalPrice: 1499,
        images: [
          'https://storage.googleapis.com/tinypaws-assets/products/royal-canin-medium-adult-1.jpg',
          'https://storage.googleapis.com/tinypaws-assets/products/royal-canin-medium-adult-2.jpg'
        ],
        features: [
          'Formulated for medium-sized adult dogs (11-25 kg)',
          'Supports digestive health',
          'Maintains ideal weight',
          'Promotes skin and coat health'
        ],
        category: dogFood._id,
        brand: royalCanin._id,
        ageGroup: 'adult',
        stock: 50,
        rating: 4.8,
        reviewCount: 124,
        isActive: true,
        hasVariants: true,
        variantType: 'weight',
        variants: [
          {
            name: '2kg',
            sku: 'RC-MED-2KG',
            price: 1299,
            originalPrice: 1499,
            stock: 20,
            weight: 2,
            weightUnit: 'kg',
            isDefault: true,
            isActive: true
          },
          {
            name: '4kg',
            sku: 'RC-MED-4KG',
            price: 2499,
            originalPrice: 2899,
            stock: 15,
            weight: 4,
            weightUnit: 'kg',
            isDefault: false,
            isActive: true
          },
          {
            name: '10kg',
            sku: 'RC-MED-10KG',
            price: 5499,
            originalPrice: 5999,
            stock: 15,
            weight: 10,
            weightUnit: 'kg',
            isDefault: false,
            isActive: true
          }
        ]
      },
      {
        name: 'Pedigree Chicken & Vegetables Adult Dog Food',
        slug: 'pedigree-chicken-vegetables-adult-dog-food',
        description: 'Complete and balanced nutrition with chicken and vegetables',
        longDescription: 'Pedigree Adult Complete Nutrition with Chicken & Vegetables provides complete and balanced nutrition for adult dogs. Enriched with omega-6 fatty acids for healthy skin and coat.',
        price: 999,
        originalPrice: 1199,
        images: [
          'https://storage.googleapis.com/tinypaws-assets/products/pedigree-chicken-veg-1.jpg',
          'https://storage.googleapis.com/tinypaws-assets/products/pedigree-chicken-veg-2.jpg'
        ],
        features: [
          'Complete nutrition for adult dogs',
          'Enriched with antioxidants, vitamins, and minerals',
          'No artificial flavors',
          'Supports healthy digestion'
        ],
        category: dogFood._id,
        brand: pedigree._id,
        ageGroup: 'adult',
        stock: 75,
        rating: 4.5,
        reviewCount: 89,
        isActive: true,
        hasVariants: true,
        variantType: 'weight',
        variants: [
          {
            name: '1.5kg',
            sku: 'PED-CV-1.5KG',
            price: 999,
            originalPrice: 1199,
            stock: 25,
            weight: 1.5,
            weightUnit: 'kg',
            isDefault: true,
            isActive: true
          },
          {
            name: '3kg',
            sku: 'PED-CV-3KG',
            price: 1899,
            originalPrice: 2099,
            stock: 25,
            weight: 3,
            weightUnit: 'kg',
            isDefault: false,
            isActive: true
          },
          {
            name: '8kg',
            sku: 'PED-CV-8KG',
            price: 4299,
            originalPrice: 4599,
            stock: 25,
            weight: 8,
            weightUnit: 'kg',
            isDefault: false,
            isActive: true
          }
        ]
      },
      {
        name: 'Whiskas Ocean Fish Adult Cat Food',
        slug: 'whiskas-ocean-fish-adult-cat-food',
        description: 'Complete nutrition with delicious ocean fish flavor cats love',
        longDescription: 'Whiskas Ocean Fish Adult Cat Food is specially formulated to provide complete nutrition with a taste cats love. Contains essential nutrients, vitamins, and minerals to support your cats overall health.',
        price: 799,
        originalPrice: 899,
        images: [
          'https://storage.googleapis.com/tinypaws-assets/products/whiskas-ocean-fish-1.jpg',
          'https://storage.googleapis.com/tinypaws-assets/products/whiskas-ocean-fish-2.jpg'
        ],
        features: [
          'Formulated for adult cats',
          'Rich in proteins for muscle development',
          'Contains taurine for heart and eye health',
          'Balanced calcium and phosphorus for strong teeth and bones'
        ],
        category: catFood._id,
        brand: whiskas._id,
        ageGroup: 'adult',
        stock: 60,
        rating: 4.6,
        reviewCount: 103,
        isActive: true,
        hasVariants: true,
        variantType: 'weight',
        variants: [
          {
            name: '1kg',
            sku: 'WSK-OF-1KG',
            price: 799,
            originalPrice: 899,
            stock: 20,
            weight: 1,
            weightUnit: 'kg',
            isDefault: true,
            isActive: true
          },
          {
            name: '3kg',
            sku: 'WSK-OF-3KG',
            price: 2199,
            originalPrice: 2399,
            stock: 20,
            weight: 3,
            weightUnit: 'kg',
            isDefault: false,
            isActive: true
          },
          {
            name: '7kg',
            sku: 'WSK-OF-7KG',
            price: 4799,
            originalPrice: 4999,
            stock: 20,
            weight: 7,
            weightUnit: 'kg',
            isDefault: false,
            isActive: true
          }
        ]
      },
      {
        name: 'Chew Rope Dog Toy',
        slug: 'chew-rope-dog-toy',
        description: 'Durable cotton rope toy for active play and dental health',
        longDescription: 'This durable rope toy is designed for hours of interactive play with your dog. Made from high-quality cotton fibers, it helps clean teeth and gums while your dog plays.',
        price: 299,
        originalPrice: 399,
        images: [
          'https://storage.googleapis.com/tinypaws-assets/products/rope-toy-1.jpg',
          'https://storage.googleapis.com/tinypaws-assets/products/rope-toy-2.jpg'
        ],
        features: [
          'Durable cotton construction',
          'Helps clean teeth and massage gums',
          'Great for interactive play',
          'Suitable for all dog sizes'
        ],
        category: dogToys._id,
        ageGroup: 'all',
        stock: 100,
        rating: 4.7,
        reviewCount: 56,
        isActive: true,
        hasVariants: false,
        variantType: 'none'
      }
    ];
    
    await Product.insertMany(products);
    console.log(`${products.length} products inserted`);
    
    console.log('Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase();