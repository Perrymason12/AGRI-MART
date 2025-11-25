import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Product from '../models/Product.js';

dotenv.config();

const placeholder = (i) => `https://via.placeholder.com/600x400.png?text=Product+${i}`;

const createProduct = (i, name, category, type, sizes, basePrice) => {
  const price = {};
  const stock = {};
  sizes.forEach((s, idx) => {
    // price increases with size index
    price[s] = Math.round((basePrice * (1 + idx * 0.35)) * 100) / 100;
    stock[s] = 50 + ((i + idx) % 50); // deterministic-ish stock
  });

  return {
    title: name,
    description: `${name} — high quality agricultural product for ${category}. Suitable for farms and agricultural operations.`,
    images: [placeholder(i)],
    price,
    sizes,
    category,
    type,
    popular: i % 7 === 0,
    inStock: true,
    stock,
  };
};

const run = async () => {
  try {
    await connectDB();

    // Build ~54 agricultural products across categories
    const feeds = [
      'Broiler Starter Poultry Feed',
      'Layer Grower Feed',
      'Cattle Compound Feed',
      'Pig Grower Feed',
      'Goat Performance Pellets',
      'Fish Floating Feed',
      'Duck Starter Feed',
      'Calf Starter Mix',
      'Horse Maintenance Feed',
      'Poultry Scratch Grains',
      'Poultry Feed Additive',
      'Ruminant Mineral Licks'
    ];

    const seeds = [
      'Maize Hybrid Seeds',
      'Wheat Certified Seeds',
      'Rice High-Yield Seeds',
      'Soybean Seeds',
      'Sunflower Oilseed',
      'Sorghum Seed',
      'Tomato Hybrid Seeds',
      'Onion Sets',
      'Cucumber Seeds',
      'Carrot Seed Mix'
    ];

    const fertilizers = [
      'NPK 20-10-10 Granules',
      'Urea N46',
      'DAP 18-46-0',
      'Organic Composted Manure',
      'Liquid Seaweed Extract',
      'Micro-Nutrient Mix',
      'Amino Acid Foliar Feed',
      'Slow Release Lawn Fertilizer',
      'Bone Meal Organic',
      'Rock Phosphate'
    ];

    const machinery = [
      '2WD Farm Tractor',
      'Rotavator 1.8m',
      'Disc Harrow 2.0m',
      'Seeder Planter Unit',
      'Power Tiller 8HP',
      'Motorized Sprayer 200L',
      'Combine Harvester (compact)',
      'Irrigation Pump 5HP'
    ];

    const tools = [
      'Wheelbarrow Heavy Duty',
      'Hand Hoe',
      'Garden Fork',
      'Sledge Hammer',
      'Cordless Drill',
      'Pruning Shears'
    ];

    const equipment = [
      'Beekeeping Protective Suit',
      'Chemical Respirator Mask',
      'Forestry Safety Helmet',
      'Motorized Wheelbarrow Sprayer'
    ];

    const vet = [
      'Poultry Oral Rehydration Solution',
      'Dewormer for Cattle',
      'Veterinary Antibiotic Spray',
      'First Aid Livestock Kit'
    ];

    const allNames = [...feeds, ...seeds, ...fertilizers, ...machinery, ...tools, ...equipment, ...vet];

    const products = allNames.map((name, idx) => {
      // derive category/type/size/pricing from name
      let category = 'general';
      let type = 'general';
      let sizes = ['1kg', '5kg', '25kg'];
      let basePrice = 10 + (idx % 10) * 5;

      if (feeds.includes(name)) {
        category = 'feeds';
        type = 'feeds';
        sizes = ['25kg', '50kg', '100kg'];
        basePrice = 30 + (idx % 5) * 5;
      } else if (seeds.includes(name)) {
        category = 'seeds';
        type = 'seeds';
        sizes = ['250g', '1kg', '5kg'];
        basePrice = 5 + (idx % 4) * 3;
      } else if (fertilizers.includes(name)) {
        category = 'fertilizers';
        type = 'fertilizer';
        sizes = ['10kg', '50kg', '250kg'];
        basePrice = 12 + (idx % 6) * 6;
      } else if (machinery.includes(name)) {
        category = 'machinery';
        type = 'equipment';
        sizes = ['standard'];
        basePrice = 500 + (idx % 8) * 120;
      } else if (tools.includes(name)) {
        category = 'tools';
        type = 'hand-tools';
        sizes = ['standard'];
        basePrice = 15 + (idx % 6) * 8;
      } else if (equipment.includes(name)) {
        category = 'equipment';
        type = 'protective';
        sizes = ['standard'];
        basePrice = 20 + (idx % 4) * 10;
      } else if (vet.includes(name)) {
        category = 'veterinary';
        type = 'medicine';
        sizes = ['100ml', '250ml', '500ml'];
        basePrice = 8 + (idx % 4) * 6;
      }

      return createProduct(idx + 1, name, category, type, sizes, basePrice);
    });

    // Remove existing products to avoid duplicates
    await Product.deleteMany({});
    const inserted = await Product.insertMany(products);
    console.log(`Inserted ${inserted.length} products into the database.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

run();
