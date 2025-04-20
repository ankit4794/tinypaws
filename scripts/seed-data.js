import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import 'dotenv/config';

// Set up mongoose connection
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('📊 MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Import models
import {
  User,
  Category,
  Brand,
  Product,
  Review,
  Order,
  OrderItem,
  ServiceablePincode
} from '../models/index.js';

// Generate random data for each model
async function generateSampleData() {
  try {
    console.log('🌱 Starting to seed database...');
    
    // Create sample serviceable pincodes
    await generatePincodes();
    
    // Create sample categories if they don't exist
    await generateCategories();
    
    // Create sample brands if they don't exist
    await generateBrands();
    
    // Create sample products
    await generateProducts();
    
    // Create sample customers
    await generateCustomers();
    
    // Create sample reviews
    await generateReviews();
    
    // Create sample orders
    await generateOrders();
    
    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Generate serviceable pincodes
async function generatePincodes() {
  const pincodeCount = await ServiceablePincode.countDocuments();
  
  if (pincodeCount > 0) {
    console.log('Pincodes already exist, skipping...');
    return;
  }
  
  console.log('Generating pincodes...');
  
  const areas = [
    {
      areaName: 'Indiranagar',
      city: 'Bangalore',
      state: 'Karnataka',
      deliveryCharge: 50,
      deliveryTime: '1-2 days',
      pincodes: ['560038', '560008']
    },
    {
      areaName: 'Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      deliveryCharge: 50,
      deliveryTime: '1-2 days',
      pincodes: ['560034', '560095']
    },
    {
      areaName: 'HSR Layout',
      city: 'Bangalore',
      state: 'Karnataka',
      deliveryCharge: 70,
      deliveryTime: '1-2 days',
      pincodes: ['560102', '560068']
    },
    {
      areaName: 'Whitefield',
      city: 'Bangalore',
      state: 'Karnataka',
      deliveryCharge: 100,
      deliveryTime: '2-3 days',
      pincodes: ['560066', '560067']
    },
    {
      areaName: 'Jayanagar',
      city: 'Bangalore',
      state: 'Karnataka',
      deliveryCharge: 70,
      deliveryTime: '1-2 days',
      pincodes: ['560041', '560069']
    },
    {
      areaName: 'South Delhi',
      city: 'Delhi',
      state: 'Delhi',
      deliveryCharge: 100,
      deliveryTime: '2-3 days',
      pincodes: ['110048', '110029', '110065']
    },
    {
      areaName: 'Mumbai Central',
      city: 'Mumbai',
      state: 'Maharashtra',
      deliveryCharge: 100,
      deliveryTime: '2-3 days',
      pincodes: ['400008', '400010']
    }
  ];
  
  const pincodes = [];
  
  for (const area of areas) {
    for (const pincode of area.pincodes) {
      pincodes.push({
        pincode,
        areaName: area.areaName,
        city: area.city,
        state: area.state,
        deliveryCharge: area.deliveryCharge,
        deliveryTime: area.deliveryTime
      });
    }
  }
  
  await ServiceablePincode.insertMany(pincodes);
  console.log(`Created ${pincodes.length} pincodes`);
}

// Generate categories
async function generateCategories() {
  const categoryCount = await Category.countDocuments();
  
  if (categoryCount > 0) {
    console.log('Categories already exist, skipping...');
    return;
  }
  
  console.log('Generating categories...');
  
  const categories = [
    {
      name: 'Dogs',
      slug: 'dogs',
      image: 'https://storage.googleapis.com/tinypaws-bucket/categories/dogs.jpg',
      description: 'Everything for your canine companion',
      subcategories: [
        {
          name: 'Food',
          slug: 'dog-food',
          image: 'https://storage.googleapis.com/tinypaws-bucket/categories/dog-food.jpg',
          description: 'Nutritious food for dogs of all ages'
        },
        {
          name: 'Treats',
          slug: 'dog-treats',
          image: 'https://storage.googleapis.com/tinypaws-bucket/categories/dog-treats.jpg',
          description: 'Delicious treats for your dogs'
        },
        {
          name: 'Toys',
          slug: 'dog-toys',
          image: 'https://storage.googleapis.com/tinypaws-bucket/categories/dog-toys.jpg',
          description: 'Fun toys to keep your dog entertained'
        },
        {
          name: 'Beds',
          slug: 'dog-beds',
          image: 'https://storage.googleapis.com/tinypaws-bucket/categories/dog-beds.jpg',
          description: 'Comfortable beds for your dog to sleep'
        },
        {
          name: 'Grooming',
          slug: 'dog-grooming',
          image: 'https://storage.googleapis.com/tinypaws-bucket/categories/dog-grooming.jpg',
          description: 'Products to keep your dog clean and healthy'
        }
      ]
    },
    {
      name: 'Cats',
      slug: 'cats',
      image: 'https://storage.googleapis.com/tinypaws-bucket/categories/cats.jpg',
      description: 'Everything for your feline friend',
      subcategories: [
        {
          name: 'Food',
          slug: 'cat-food',
          image: 'https://storage.googleapis.com/tinypaws-bucket/categories/cat-food.jpg',
          description: 'Nutritious food for cats of all ages'
        },
        {
          name: 'Treats',
          slug: 'cat-treats',
          image: 'https://storage.googleapis.com/tinypaws-bucket/categories/cat-treats.jpg',
          description: 'Delicious treats for your cats'
        },
        {
          name: 'Toys',
          slug: 'cat-toys',
          image: 'https://storage.googleapis.com/tinypaws-bucket/categories/cat-toys.jpg',
          description: 'Fun toys to keep your cat entertained'
        },
        {
          name: 'Beds',
          slug: 'cat-beds',
          image: 'https://storage.googleapis.com/tinypaws-bucket/categories/cat-beds.jpg',
          description: 'Comfortable beds for your cat to sleep'
        },
        {
          name: 'Litter & Accessories',
          slug: 'cat-litter',
          image: 'https://storage.googleapis.com/tinypaws-bucket/categories/cat-litter.jpg',
          description: 'Litter boxes, litter, and accessories'
        }
      ]
    },
    {
      name: 'Small Pets',
      slug: 'small-pets',
      image: 'https://storage.googleapis.com/tinypaws-bucket/categories/small-pets.jpg',
      description: 'Products for small mammals and birds',
      subcategories: [
        {
          name: 'Bird Food',
          slug: 'bird-food',
          image: 'https://storage.googleapis.com/tinypaws-bucket/categories/bird-food.jpg',
          description: 'Nutritious food for birds'
        },
        {
          name: 'Hamster Supplies',
          slug: 'hamster-supplies',
          image: 'https://storage.googleapis.com/tinypaws-bucket/categories/hamster-supplies.jpg',
          description: 'Everything for your hamster'
        },
        {
          name: 'Rabbit Supplies',
          slug: 'rabbit-supplies',
          image: 'https://storage.googleapis.com/tinypaws-bucket/categories/rabbit-supplies.jpg',
          description: 'Everything for your rabbit'
        }
      ]
    },
    {
      name: 'Fish',
      slug: 'fish',
      image: 'https://storage.googleapis.com/tinypaws-bucket/categories/fish.jpg',
      description: 'Products for aquatic pets',
      subcategories: [
        {
          name: 'Fish Food',
          slug: 'fish-food',
          image: 'https://storage.googleapis.com/tinypaws-bucket/categories/fish-food.jpg',
          description: 'Nutritious food for fish'
        },
        {
          name: 'Aquariums',
          slug: 'aquariums',
          image: 'https://storage.googleapis.com/tinypaws-bucket/categories/aquariums.jpg',
          description: 'Tanks and accessories for your fish'
        },
        {
          name: 'Water Care',
          slug: 'water-care',
          image: 'https://storage.googleapis.com/tinypaws-bucket/categories/water-care.jpg',
          description: 'Products to maintain healthy water for your fish'
        }
      ]
    }
  ];
  
  for (const category of categories) {
    const newCategory = new Category({
      name: category.name,
      slug: category.slug,
      image: category.image,
      description: category.description,
      subcategories: []
    });
    
    await newCategory.save();
    
    for (const subcategory of category.subcategories) {
      const newSubcategory = new Category({
        name: subcategory.name,
        slug: subcategory.slug,
        image: subcategory.image,
        description: subcategory.description,
        parent: newCategory._id
      });
      
      await newSubcategory.save();
      
      newCategory.subcategories.push(newSubcategory._id);
    }
    
    await newCategory.save();
  }
  
  console.log(`Created ${categories.length} parent categories with subcategories`);
}

// Generate brands
async function generateBrands() {
  const brandCount = await Brand.countDocuments();
  
  if (brandCount > 0) {
    console.log('Brands already exist, skipping...');
    return;
  }
  
  console.log('Generating brands...');
  
  const brands = [
    {
      name: 'Royal Canin',
      slug: 'royal-canin',
      logo: 'https://storage.googleapis.com/tinypaws-bucket/brands/royal-canin.png',
      description: 'Premium pet nutrition tailored to specific breeds and health needs',
      featured: true
    },
    {
      name: 'Pedigree',
      slug: 'pedigree',
      logo: 'https://storage.googleapis.com/tinypaws-bucket/brands/pedigree.png',
      description: 'Nutrition for healthy, happy dogs',
      featured: true
    },
    {
      name: 'Whiskas',
      slug: 'whiskas',
      logo: 'https://storage.googleapis.com/tinypaws-bucket/brands/whiskas.png',
      description: 'Cat food that cats love',
      featured: true
    },
    {
      name: 'Kong',
      slug: 'kong',
      logo: 'https://storage.googleapis.com/tinypaws-bucket/brands/kong.png',
      description: 'Durable dog toys for playtime and mental stimulation',
      featured: true
    },
    {
      name: 'Purina',
      slug: 'purina',
      logo: 'https://storage.googleapis.com/tinypaws-bucket/brands/purina.png',
      description: 'Better together - pet nutrition experts',
      featured: true
    },
    {
      name: 'Himalaya',
      slug: 'himalaya',
      logo: 'https://storage.googleapis.com/tinypaws-bucket/brands/himalaya.png',
      description: 'Natural pet care products',
      featured: false
    },
    {
      name: 'Farmina',
      slug: 'farmina',
      logo: 'https://storage.googleapis.com/tinypaws-bucket/brands/farmina.png',
      description: 'Natural and delicious pet food',
      featured: false
    },
    {
      name: 'Trixie',
      slug: 'trixie',
      logo: 'https://storage.googleapis.com/tinypaws-bucket/brands/trixie.png',
      description: 'Pet accessories for every need',
      featured: false
    },
    {
      name: 'Drools',
      slug: 'drools',
      logo: 'https://storage.googleapis.com/tinypaws-bucket/brands/drools.png',
      description: 'Indian pet food brand focused on nutrition',
      featured: true
    },
    {
      name: 'Pawsh',
      slug: 'pawsh',
      logo: 'https://storage.googleapis.com/tinypaws-bucket/brands/pawsh.png',
      description: 'Luxury pet products',
      featured: false
    }
  ];
  
  await Brand.insertMany(brands);
  console.log(`Created ${brands.length} brands`);
}

// Generate products
async function generateProducts() {
  const productCount = await Product.countDocuments();
  
  if (productCount > 20) {
    console.log('Products already exist, skipping...');
    return;
  }
  
  console.log('Generating products...');
  
  // Get categories and brands
  const dogFoodCategory = await Category.findOne({ slug: 'dog-food' });
  const catFoodCategory = await Category.findOne({ slug: 'cat-food' });
  const dogToysCategory = await Category.findOne({ slug: 'dog-toys' });
  const catToysCategory = await Category.findOne({ slug: 'cat-toys' });
  const dogBedsCategory = await Category.findOne({ slug: 'dog-beds' });
  
  const royalCanin = await Brand.findOne({ slug: 'royal-canin' });
  const pedigree = await Brand.findOne({ slug: 'pedigree' });
  const whiskas = await Brand.findOne({ slug: 'whiskas' });
  const kong = await Brand.findOne({ slug: 'kong' });
  const drools = await Brand.findOne({ slug: 'drools' });
  
  const products = [
    {
      name: 'Royal Canin Adult Dog Food',
      slug: 'royal-canin-adult-dog-food',
      description: `Royal Canin Adult Dog Food is a premium nutrition designed for adult dogs. Made with high-quality ingredients, it provides balanced nutrition for your dog's overall health and wellbeing.

Features:
- Promotes healthy digestion
- Supports immune system
- Maintains healthy skin and coat
- Contains essential nutrients for optimal health

Ingredients: Dehydrated poultry protein, rice, animal fats, vegetable protein isolate, hydrolysed animal proteins, beet pulp, minerals, fish oil, vegetable oils, fructo-oligo-saccharides, psyllium husks and seeds, hydrolysed yeast, hydrolysed crustaceans, marigold extract, hydrolysed cartilage.`,
      categoryId: dogFoodCategory._id,
      brandId: royalCanin._id,
      price: 2500,
      salePrice: 2250,
      images: [
        'https://storage.googleapis.com/tinypaws-bucket/products/royal-canin-adult-1.jpg',
        'https://storage.googleapis.com/tinypaws-bucket/products/royal-canin-adult-2.jpg'
      ],
      inventory: {
        inStock: true,
        quantity: 50
      },
      specifications: [
        { name: 'Life Stage', value: 'Adult' },
        { name: 'Breed Size', value: 'All Breeds' },
        { name: 'Primary Ingredient', value: 'Chicken' }
      ],
      variants: [
        {
          name: '1kg',
          price: 2500,
          salePrice: 2250,
          sku: 'RC-ADULT-1KG'
        },
        {
          name: '3kg',
          price: 5000,
          salePrice: 4500,
          sku: 'RC-ADULT-3KG'
        },
        {
          name: '10kg',
          price: 12000,
          salePrice: 10800,
          sku: 'RC-ADULT-10KG'
        }
      ],
      features: [
        'Balanced nutrition',
        'Promotes healthy digestion',
        'Supports immune system',
        'Made with high-quality ingredients'
      ],
      tags: ['dog food', 'dry food', 'adult dog', 'royal canin']
    },
    {
      name: 'Pedigree Chicken & Vegetables Adult Dog Food',
      slug: 'pedigree-chicken-vegetables-adult-dog-food',
      description: `Pedigree Adult Dog Food with Chicken & Vegetables is a complete and balanced meal for your adult dog. It contains essential nutrients that help keep your dog healthy and happy.

Features:
- Rich in proteins for strong muscles
- Contains fiber for healthy digestion
- Calcium for strong teeth and bones
- Omega 6 for healthy skin and coat

Ingredients: Cereals, meat and meat by-products (including chicken min. 4%), oils and fats, vegetables (including 4% vegetables), minerals, vegetable protein extracts, vitamins and antioxidants.`,
      categoryId: dogFoodCategory._id,
      brandId: pedigree._id,
      price: 1800,
      salePrice: 1600,
      images: [
        'https://storage.googleapis.com/tinypaws-bucket/products/pedigree-adult-1.jpg',
        'https://storage.googleapis.com/tinypaws-bucket/products/pedigree-adult-2.jpg'
      ],
      inventory: {
        inStock: true,
        quantity: 75
      },
      specifications: [
        { name: 'Life Stage', value: 'Adult' },
        { name: 'Breed Size', value: 'All Breeds' },
        { name: 'Primary Ingredient', value: 'Chicken & Vegetables' }
      ],
      variants: [
        {
          name: '1.2kg',
          price: 1800,
          salePrice: 1600,
          sku: 'PED-CHK-VEG-1.2KG'
        },
        {
          name: '3kg',
          price: 3600,
          salePrice: 3200,
          sku: 'PED-CHK-VEG-3KG'
        },
        {
          name: '10kg',
          price: 9000,
          salePrice: 8100,
          sku: 'PED-CHK-VEG-10KG'
        }
      ],
      features: [
        'Complete and balanced nutrition',
        'Rich in proteins',
        'Contains calcium for strong teeth',
        'No artificial colors or flavors'
      ],
      tags: ['dog food', 'dry food', 'adult dog', 'pedigree', 'chicken', 'vegetables']
    },
    {
      name: 'Whiskas Adult Cat Food Tuna',
      slug: 'whiskas-adult-cat-food-tuna',
      description: `Whiskas Adult Cat Food with Tuna is a delicious and nutritious meal for your adult cat. It provides all the essential nutrients your cat needs for a healthy and active life.

Features:
- Rich in tuna for great taste
- Contains essential vitamins and minerals
- Supports urinary tract health
- Promotes healthy coat and skin

Ingredients: Cereals, meat and animal derivatives, vegetable protein extracts, fish and fish derivatives (tuna min. 4%), oils and fats, derivatives of vegetable origin, minerals, various sugars, yeasts.`,
      categoryId: catFoodCategory._id,
      brandId: whiskas._id,
      price: 1500,
      salePrice: 1350,
      images: [
        'https://storage.googleapis.com/tinypaws-bucket/products/whiskas-tuna-1.jpg',
        'https://storage.googleapis.com/tinypaws-bucket/products/whiskas-tuna-2.jpg'
      ],
      inventory: {
        inStock: true,
        quantity: 60
      },
      specifications: [
        { name: 'Life Stage', value: 'Adult' },
        { name: 'Primary Ingredient', value: 'Tuna' },
        { name: 'Type', value: 'Dry Food' }
      ],
      variants: [
        {
          name: '480g',
          price: 1500,
          salePrice: 1350,
          sku: 'WHSK-TUNA-480G'
        },
        {
          name: '1.2kg',
          price: 3000,
          salePrice: 2700,
          sku: 'WHSK-TUNA-1.2KG'
        },
        {
          name: '3kg',
          price: 6000,
          salePrice: 5400,
          sku: 'WHSK-TUNA-3KG'
        }
      ],
      features: [
        'Complete and balanced nutrition',
        'Rich in tuna flavor',
        'Promotes urinary tract health',
        'Maintains healthy skin and coat'
      ],
      tags: ['cat food', 'dry food', 'adult cat', 'whiskas', 'tuna']
    },
    {
      name: 'Kong Classic Dog Toy',
      slug: 'kong-classic-dog-toy',
      description: `The KONG Classic is the gold standard of dog toys and has become the staple for dogs around the world for over forty years. The KONG Classic's unique all-natural red rubber formula is ultra-durable with an erratic bounce that is ideal for dogs that like to chew and chase.

Features:
- Made of durable, all-natural rubber
- Great for stuffing with treats
- Unpredictable bounce for games of fetch
- Helps reduce boredom and separation anxiety
- Dishwasher safe for easy cleaning

The KONG Classic is recommended by veterinarians, trainers, and dog enthusiasts worldwide. This toy helps satisfy dogs' instinctual needs and provides mental stimulation. To extend play time, stuff with KONG Easy Treat, peanut butter, or kibble and freeze for a longer-lasting challenge.`,
      categoryId: dogToysCategory._id,
      brandId: kong._id,
      price: 800,
      salePrice: 720,
      images: [
        'https://storage.googleapis.com/tinypaws-bucket/products/kong-classic-1.jpg',
        'https://storage.googleapis.com/tinypaws-bucket/products/kong-classic-2.jpg'
      ],
      inventory: {
        inStock: true,
        quantity: 100
      },
      specifications: [
        { name: 'Material', value: 'Natural Rubber' },
        { name: 'Durability', value: 'High' },
        { name: 'Suitable For', value: 'All Dogs' }
      ],
      variants: [
        {
          name: 'Small',
          price: 800,
          salePrice: 720,
          sku: 'KONG-CLS-S'
        },
        {
          name: 'Medium',
          price: 1000,
          salePrice: 900,
          sku: 'KONG-CLS-M'
        },
        {
          name: 'Large',
          price: 1200,
          salePrice: 1080,
          sku: 'KONG-CLS-L'
        }
      ],
      features: [
        'Durable natural rubber',
        'Can be stuffed with treats',
        'Helps clean teeth and gums',
        'Provides mental stimulation',
        'Helps reduce separation anxiety'
      ],
      tags: ['dog toy', 'chew toy', 'treat toy', 'kong', 'durable']
    },
    {
      name: 'Drools Chicken & Egg Adult Dog Food',
      slug: 'drools-chicken-egg-adult-dog-food',
      description: `Drools Chicken and Egg Adult Dog Food is specially formulated to provide complete and balanced nutrition for your adult dog. Made with real chicken and eggs, it provides high-quality protein for muscle maintenance and development.

Features:
- Contains real chicken as the first ingredient
- Added eggs for extra protein
- Omega 3 & 6 for healthy skin and coat
- No artificial colors or flavors
- Made in India

Ingredients: Chicken, eggs, rice, corn, chicken fat (preserved with mixed tocopherols), fish meal, dried beet pulp, flaxseed, fish oil, minerals, vitamins, yeast culture, dried chicory root, yucca schidigera extract, rosemary extract.`,
      categoryId: dogFoodCategory._id,
      brandId: drools._id,
      price: 1600,
      salePrice: 1440,
      images: [
        'https://storage.googleapis.com/tinypaws-bucket/products/drools-chicken-1.jpg',
        'https://storage.googleapis.com/tinypaws-bucket/products/drools-chicken-2.jpg'
      ],
      inventory: {
        inStock: true,
        quantity: 85
      },
      specifications: [
        { name: 'Life Stage', value: 'Adult' },
        { name: 'Breed Size', value: 'All Breeds' },
        { name: 'Primary Ingredient', value: 'Chicken & Egg' }
      ],
      variants: [
        {
          name: '1.2kg',
          price: 1600,
          salePrice: 1440,
          sku: 'DROOLS-CHK-EGG-1.2KG'
        },
        {
          name: '3kg',
          price: 3200,
          salePrice: 2880,
          sku: 'DROOLS-CHK-EGG-3KG'
        },
        {
          name: '10kg',
          price: 8000,
          salePrice: 7200,
          sku: 'DROOLS-CHK-EGG-10KG'
        }
      ],
      features: [
        'Made with real chicken',
        'Added eggs for protein',
        'Contains omega 3 & 6',
        'No artificial colors or flavors',
        'Made in India'
      ],
      tags: ['dog food', 'dry food', 'adult dog', 'drools', 'chicken', 'egg']
    }
  ];
  
  for (const product of products) {
    const newProduct = new Product({
      name: product.name,
      slug: product.slug,
      description: product.description,
      category: product.categoryId,
      brand: product.brandId,
      price: product.price,
      salePrice: product.salePrice,
      images: product.images,
      inventory: product.inventory,
      specifications: product.specifications,
      variants: product.variants,
      features: product.features,
      tags: product.tags
    });
    
    await newProduct.save();
  }
  
  console.log(`Created ${products.length} products`);
}

// Generate customers
async function generateCustomers() {
  const customerCount = await User.countDocuments({ role: 'customer' });
  
  if (customerCount >= 10) {
    console.log('Customers already exist, skipping...');
    return;
  }
  
  console.log('Generating customers...');
  
  const customers = [];
  
  for (let i = 0; i < 10; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    customers.push({
      username: faker.internet.userName({ firstName, lastName }),
      email: faker.internet.email({ firstName, lastName }),
      password: '$2a$10$7JKxo/HZ1Pb2RzSLxDLLXeuKLcqM1jE7Xqb.iQYUlvOT/jG.ELYRG', // hashed version of 'Password123'
      fullName: `${firstName} ${lastName}`,
      mobile: faker.phone.number('+91##########'),
      role: 'customer',
      address: {
        street: faker.location.streetAddress(),
        city: faker.helpers.arrayElement(['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad']),
        state: faker.helpers.arrayElement(['Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu', 'Telangana']),
        pincode: faker.helpers.arrayElement(['560001', '560034', '560066', '400001', '110001', '600001', '500001'])
      }
    });
  }
  
  await User.insertMany(customers);
  console.log(`Created ${customers.length} customers`);
}

// Generate reviews
async function generateReviews() {
  const reviewCount = await Review.countDocuments();
  
  if (reviewCount > 20) {
    console.log('Reviews already exist, skipping...');
    return;
  }
  
  console.log('Generating reviews...');
  
  // Get products and customers
  const products = await Product.find();
  const customers = await User.find({ role: 'customer' });
  
  const reviews = [];
  
  // Generate 3-5 reviews for each product
  for (const product of products) {
    const numReviews = faker.number.int({ min: 3, max: 5 });
    
    for (let i = 0; i < numReviews; i++) {
      const customer = faker.helpers.arrayElement(customers);
      const rating = faker.number.int({ min: 3, max: 5 });
      
      reviews.push({
        productId: product._id,
        userId: customer._id,
        rating,
        title: faker.helpers.arrayElement([
          'Great product!',
          'My pet loves it',
          'Good quality',
          'Excellent value',
          'Highly recommend',
          'Worth the price',
          'Will buy again'
        ]),
        comment: faker.lorem.paragraph(),
        verified: true,
        createdAt: faker.date.past({ years: 1 })
      });
    }
  }
  
  await Review.insertMany(reviews);
  console.log(`Created ${reviews.length} reviews`);
  
  // Update product ratings
  for (const product of products) {
    const productReviews = await Review.find({ productId: product._id });
    
    if (productReviews.length > 0) {
      const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / productReviews.length;
      
      product.rating = {
        average: averageRating,
        count: productReviews.length
      };
      
      await product.save();
    }
  }
}

// Generate orders
async function generateOrders() {
  const orderCount = await Order.countDocuments();
  
  if (orderCount >= 20) {
    console.log('Orders already exist, skipping...');
    return;
  }
  
  console.log('Generating orders...');
  
  // Get products and customers
  const products = await Product.find();
  const customers = await User.find({ role: 'customer' });
  
  const orders = [];
  const orderItems = [];
  
  // Generate 2-3 orders for each customer
  for (const customer of customers) {
    const numOrders = faker.number.int({ min: 2, max: 3 });
    
    for (let i = 0; i < numOrders; i++) {
      // Generate a random order date in the past 6 months
      const orderDate = faker.date.recent({ days: 180 });
      
      // Generate a random order status
      const status = faker.helpers.arrayElement(['placed', 'confirmed', 'shipped', 'delivered', 'cancelled']);
      
      // Generate a random payment method
      const paymentMethod = faker.helpers.arrayElement(['cod', 'online']);
      
      // Generate a random order number
      const orderNumber = `TP${faker.string.numeric(10)}`;
      
      // Create a new order
      const order = new Order({
        orderNumber,
        userId: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        mobile: customer.mobile,
        address: customer.address.street,
        city: customer.address.city,
        state: customer.address.state,
        pincode: customer.address.pincode,
        status,
        paymentMethod,
        createdAt: orderDate,
        updatedAt: orderDate
      });
      
      await order.save();
      orders.push(order);
      
      // Generate random order items (1-4 products per order)
      const numItems = faker.number.int({ min: 1, max: 4 });
      const selectedProducts = faker.helpers.arrayElements(products, numItems);
      
      let subtotal = 0;
      
      for (const product of selectedProducts) {
        const quantity = faker.number.int({ min: 1, max: 3 });
        const price = product.salePrice || product.price;
        
        // Get a random variant if available
        let variant = null;
        if (product.variants && product.variants.length > 0) {
          variant = faker.helpers.arrayElement(product.variants);
        }
        
        const orderItem = new OrderItem({
          orderId: order._id,
          productId: product._id,
          quantity,
          price: variant ? variant.salePrice || variant.price : price,
          weight: variant ? variant.name : null
        });
        
        await orderItem.save();
        orderItems.push(orderItem);
        
        subtotal += orderItem.price * quantity;
      }
      
      // Update order with totals
      const tax = subtotal * 0.18; // 18% GST
      const deliveryCharge = faker.helpers.arrayElement([50, 70, 100]);
      const total = subtotal + tax + deliveryCharge;
      
      order.subtotal = subtotal;
      order.tax = tax;
      order.deliveryCharge = deliveryCharge;
      order.total = total;
      order.items = orderItems.filter(item => item.orderId.toString() === order._id.toString());
      
      // Add tracking info for shipped and delivered orders
      if (status === 'shipped' || status === 'delivered') {
        order.trackingNumber = `TRK${faker.string.numeric(8)}`;
        order.courier = faker.helpers.arrayElement(['BlueDart', 'Delhivery', 'DTDC', 'FedEx']);
      }
      
      await order.save();
    }
  }
  
  console.log(`Created ${orders.length} orders with ${orderItems.length} order items`);
}

// Run the data generation
generateSampleData();