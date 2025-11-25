Seed Products
===============

This file describes how to seed the MongoDB `products` collection with a set of sample agricultural products.

Run steps:

1. Ensure your MongoDB is running and `MONGODB_URI` (if used) is set in `server/.env` or environment variables.
2. From the `server` folder run:

```
npm run seed:products
```

This script will currently delete existing products and insert ~54 sample agricultural products (feeds, seeds, fertilizers, machinery, tools, equipment, and veterinary items). Use with caution in production environments.
