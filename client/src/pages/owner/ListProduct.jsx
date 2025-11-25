import React from 'react'
import toast from 'react-hot-toast'
import { useAppContext } from '../../context/AppContext'
import { api } from '../../utils/api'
import { dummyProducts } from '../../assets/data'

const ListProduct = () => {
  const { products, currency, fetchProducts, getToken } = useAppContext()

  const handleToggleStock = async (productId) => {
    try {
      let token = await getToken()
      let data = await api.toggleStock(productId, token)
      
      // If unauthorized, try to refresh token
      if (data && data.status === 401) {
        try {
          token = await getToken({ template: 'default' });
          if (token) {
            data = await api.toggleStock(productId, token);
          }
        } catch (refreshErr) {
          console.warn('Token refresh failed:', refreshErr);
        }
      }
      
      if (data && data.status === 401) {
        toast.error('Session expired. Please sign in again.');
        return;
      }
      
      if (data.success) {
        toast.success(`Product ${data.product.inStock ? 'in' : 'out of'} stock`)
        fetchProducts()
      }
    } catch (error) {
      toast.error(error.message || "Failed to toggle stock")
    }
  }
  
  const handleDelete = async (productId) => {
    if (!confirm('Delete this product?')) return;
    try {
      let token = await getToken();
      let data = await api.deleteProduct(productId, token);
      
      // If unauthorized, try to refresh token
      if (data && data.status === 401) {
        try {
          token = await getToken({ template: 'default' });
          if (token) {
            data = await api.deleteProduct(productId, token);
          }
        } catch (refreshErr) {
          console.warn('Token refresh failed:', refreshErr);
        }
      }
      
      if (data && data.status === 401) {
        toast.error('Session expired. Please sign in again.');
        return;
      }
      
      if (data.success) {
        toast.success('Product deleted');
        fetchProducts();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete product');
    }
  }

  const handleBulkUpload = async () => {
    if (!confirm('Bulk upload local dummy products to server? This will create many products.')) return;
    try {
      const token = await getToken();
      // Map dummyProducts to the server expected shape (title, description, images, sizes, prices, stock, category, type, popular)
      const payload = dummyProducts.map(p => ({
        title: p.title,
        description: p.description,
        images: p.images && p.images.length ? p.images : ['https://via.placeholder.com/400'],
        sizes: p.sizes || [],
        prices: p.sizes ? p.sizes.map(s => (p.price[s] || Object.values(p.price)[0])) : [],
        stock: p.stock ? Object.values(p.stock) : (p.sizes ? p.sizes.map(() => 50) : []),
        category: p.category || 'general',
        type: p.type || 'general',
        popular: !!p.popular
      }));

      const data = await api.bulkUpload(payload, token);
      if (data.success) {
        toast.success(`Uploaded ${data.count} products`);
        fetchProducts();
      } else {
        toast.error(data.message || 'Bulk upload failed');
      }
    } catch (error) {
      toast.error(error.message || 'Bulk upload error');
    }
  }
  const getPrice = (product) => {
    if (product.sizes && product.sizes.length > 0) {
      const firstSize = product.sizes[0]
      if (product.price instanceof Map) {
        return product.price.get(firstSize)
      }
      return product.price[firstSize] || Object.values(product.price)[0]
    }
    return 0
  }

  return (
    <div className='px-2 sm:px-6 py-12 m-2 h-[97vh] bg-primary overflow-y-scroll lg:w-11/12 rounded-xl'>
      <div className='flex flex-col gap-2 lg:w-11/12'>
        <div className='hidden sm:grid grid-cols-[1fr_3.5fr_1.5fr_1.5fr_1fr] items-center py-4 px-2 bg-secondary text-white bold-14 sm:bold-15 mb-1 rounded-xl'>
          <h5>Image</h5>
          <h5>Title</h5>
          <h5>Category</h5>
          <h5>Price</h5>
          <h5>InStock</h5>
        </div>
        {/*Product List */}
        <div className='flex items-center justify-end gap-2 mb-3'>
          <button onClick={handleBulkUpload} className='btn-secondary p-2 rounded'>Bulk upload local dummy products</button>
        </div>

        {products.map((product) => (
          <div key={product._id} className='grid grid-cols-1 sm:grid-cols-[1fr_3.5fr_1.5fr_1.5fr_1fr] items-center gap-3 p-3 sm:p-2 bg-white rounded-lg'>
            <div className='flex items-center gap-3 sm:block'>
              <img src={product.images[0]} alt="" className='w-16 h-16 sm:w-12 sm:h-12 bg-primary rounded object-cover' />
              <div className='sm:hidden'>
                <h5 className="text-sm font-semibold">{product.title}</h5>
                <p className="text-xs text-gray-600">{product.category}</p>
                <div className="text-sm font-semibold">From {currency}{getPrice(product)}</div>
              </div>
            </div>
            <h5 className="hidden sm:block text-sm font-semibold">{product.title}</h5>
            <p className="hidden sm:block text-sm font-semibold">{product.category}</p>
            <div className="hidden sm:block text-sm font-semibold">From {currency}{getPrice(product)}</div>
            <div className='flex items-center justify-between sm:justify-center'>
              <span className='sm:hidden text-sm font-semibold'>Stock:</span>
              <label className='relative inline-flex items-center cursor-pointer text-gray-900 gap-3'>
                <input 
                  type="checkbox" 
                  className='sr-only peer' 
                  checked={product.inStock}
                  onChange={() => handleToggleStock(product._id, product.inStock)}
                />
                <div className='w-10 h-6 bg-slate-300 rounded-full peer peer-checked:bg-secondary transition-colors duration-200'/>
                <span className='absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-transform'/>
              </label>
              <div className='flex gap-2 ml-2'>
                <button onClick={() => handleDelete(product._id)} className='text-red-600 hover:underline text-sm'>Delete</button>
                <a href={`/owner/add-product?edit=${product._id}`} className='text-blue-600 hover:underline text-sm'>Edit</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ListProduct
