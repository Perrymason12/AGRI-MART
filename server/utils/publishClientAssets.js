import fs from 'fs';
import path from 'path';
import connectDB from '../config/database.js';
import Product from '../models/Product.js';

const copyFile = (src, dest) => {
  return new Promise((resolve, reject) => {
    const rd = fs.createReadStream(src);
    rd.on('error', reject);
    const wr = fs.createWriteStream(dest);
    wr.on('error', reject);
    wr.on('close', resolve);
    rd.pipe(wr);
  });
};

const run = async () => {
  try {
    const projectRoot = path.resolve(process.cwd(), '..');
    const clientSrcAssets = path.join(projectRoot, 'client', 'src', 'assets');
    const clientPublicAssets = path.join(projectRoot, 'client', 'public', 'assets');

    if (!fs.existsSync(clientSrcAssets)) {
      console.error('Client src assets folder not found:', clientSrcAssets);
      process.exit(1);
    }

    if (!fs.existsSync(clientPublicAssets)) {
      fs.mkdirSync(clientPublicAssets, { recursive: true });
      console.log('Created', clientPublicAssets);
    }

    // Copy product images product_1.png ... product_54.png (and any variants product_2_1.png etc.)
    const files = fs.readdirSync(clientSrcAssets).filter(f => /^product_.*\.png$/.test(f));
    if (files.length === 0) {
      console.log('No product images found to copy.');
    } else {
      for (const file of files) {
        const src = path.join(clientSrcAssets, file);
        const dest = path.join(clientPublicAssets, file);
        await copyFile(src, dest);
        console.log('Copied', file);
      }
    }

    // Update DB product documents to reference relative public paths
    await connectDB();
    const products = await Product.find().sort({ createdAt: 1 }).limit(1000);
    if (!products || products.length === 0) {
      console.log('No products found in DB to update.');
      process.exit(0);
    }

    for (let i = 0; i < products.length; i++) {
      const prod = products[i];
      const idx = (i % 54) + 1;
      const imageFiles = [];
      // prefer product_<n>.png, product_<n+1>.png, product_<n+2>.png if exist
      for (let off = 0; off < 3; off++) {
        const fileIndex = ((idx - 1 + off) % 54) + 1;
        const filename = `product_${fileIndex}.png`;
        const publicPath = `/assets/${filename}`;
        const publicFile = path.join(clientPublicAssets, filename);
        if (fs.existsSync(publicFile)) {
          imageFiles.push(publicPath);
        }
      }
      if (imageFiles.length === 0) {
        // fallback to placeholder
        imageFiles.push('/assets/product_1.png');
      }
      prod.images = imageFiles;
      await prod.save();
      console.log(`Updated DB product ${i + 1}/${products.length}: ${prod.title}`);
    }

    console.log('Publish client assets and DB update complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error in publishClientAssets:', err);
    process.exit(1);
  }
};

run();
