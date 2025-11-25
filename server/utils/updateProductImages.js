import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Product from '../models/Product.js';

dotenv.config();

// Default client dev server base where Vite serves src assets
const CLIENT_ASSET_BASE = process.env.CLIENT_ASSET_BASE || 'http://localhost:5173/src/assets';

const run = async () => {
  try {
    await connectDB();

    const products = await Product.find().sort({ createdAt: 1 }).limit(200);
    if (!products || products.length === 0) {
      console.log('No products found to update.');
      process.exit(0);
    }

    // We'll update sequential products to product_1.png ... product_54.png
    const total = products.length;
    for (let i = 0; i < total; i++) {
      const prod = products[i];
      const idx = (i % 54) + 1; // loop within available client assets
      const imageUrl = `${CLIENT_ASSET_BASE}/product_${idx}.png`;
      // assign up to 3 images: product_n.png, product_n+1.png, product_n+2.png
      const images = [
        imageUrl,
        `${CLIENT_ASSET_BASE}/product_${idx === 54 ? 1 : idx + 1}.png`,
        `${CLIENT_ASSET_BASE}/product_${idx >= 53 ? idx - 52 : idx + 2}.png`
      ];
      prod.images = images;
      await prod.save();
      console.log(`Updated product ${i + 1}/${total}: ${prod.title}`);
    }

    console.log('Product image update complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error updating product images:', error);
    process.exit(1);
  }
};

run();
