import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";
import { assets } from "../../assets/data";
import { api } from "../../utils/api";

const AddProduct = () => {
  const [images, setImages] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
  });
  const [inputs, setInputs] = useState({
    title: "",
    description: "",
    category: "",
    type: "",
    popular: false,
  });

  const [sizePrices, setSizePrices] = useState([]);
  const [newSize, setNewSize] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newType, setNewType] = useState("");
  const [useNewCategory, setUseNewCategory] = useState(false);
  const [useNewType, setUseNewType] = useState(false);

  const { products = [], getToken, fetchProducts } = useAppContext();
  const allCategories = Array.from(new Set(products.map((p) => p?.category).filter(Boolean)));
  const allTypes = Array.from(new Set(products.map((p) => p?.type).filter(Boolean)));

  const addSizePrice = ()=>{
    if(!newSize || !newPrice){
      toast.error("Please enter size and price ")
      return
    }
    if(sizePrices.some((sp)=> sp.size === newSize)){
      toast.error("Size already exists")
      return
    }
    setSizePrices([...sizePrices, {size: newSize, price: parseFloat(newPrice)}])
    setNewSize("")
    setNewPrice("")
  }

  const removeSizePrice = (size)=>{
    setSizePrices(sizePrices.filter((sp)=>sp.size !== size))
  }

  // (products, getToken, fetchProducts already obtained above)

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Determine final category and type values
    const finalCategory = useNewCategory ? newCategory.trim() : inputs.category;
    const finalType = useNewType ? newType.trim() : inputs.type;
    
    if (!inputs.title || !inputs.description || !finalCategory || !finalType) {
      toast.error("Please fill all required fields");
      return;
    }
    
    if (useNewCategory && !newCategory.trim()) {
      toast.error("Please enter a category name");
      return;
    }
    
    if (useNewType && !newType.trim()) {
      toast.error("Please enter a type name");
      return;
    }
    if (sizePrices.length === 0) {
      toast.error("Please add at least one size and price");
      return;
    }
    if (!images[1]) {
      toast.error("Please add at least one image");
      return;
    }

    setLoading(true);
    try {
      let token = await getToken();
      const formData = new FormData();
      formData.append('title', inputs.title);
      formData.append('description', inputs.description);
      formData.append('category', finalCategory);
      formData.append('type', finalType);
      formData.append('popular', inputs.popular);
      formData.append('sizes', JSON.stringify(sizePrices.map(sp => sp.size)));
      formData.append('prices', JSON.stringify(sizePrices.map(sp => sp.price)));
      
      Object.keys(images).forEach(key => {
        if (images[key]) {
          formData.append('images', images[key]);
        }
      });

      let data = await api.addProduct(formData, token);
      
      // If unauthorized, try to refresh token and retry
      if (data && data.status === 401) {
        try {
          token = await getToken({ template: 'default' });
          if (token) {
            // Recreate formData with new token
            const newFormData = new FormData();
            newFormData.append('title', inputs.title);
            newFormData.append('description', inputs.description);
            newFormData.append('category', finalCategory);
            newFormData.append('type', finalType);
            newFormData.append('popular', inputs.popular);
            newFormData.append('sizes', JSON.stringify(sizePrices.map(sp => sp.size)));
            newFormData.append('prices', JSON.stringify(sizePrices.map(sp => sp.price)));
            Object.keys(images).forEach(key => {
              if (images[key]) {
                newFormData.append('images', images[key]);
              }
            });
            data = await api.addProduct(newFormData, token);
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
        toast.success("Product added successfully!");
        // Reset form
        setInputs({ title: "", description: "", category: "", type: "", popular: false });
        setSizePrices([]);
        setImages({ 1: null, 2: null, 3: null, 4: null });
        setNewCategory("");
        setNewType("");
        setUseNewCategory(false);
        setUseNewType(false);
        fetchProducts();
      } else {
        toast.error(data.message || "Failed to add product");
      }
    } catch (error) {
      toast.error(error.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return(
    <div className="px-2 sm:px-6 py-12 m-2 h-[97vh] bg-primary overflow-y-scroll lg:w-11/12 rounded-xl">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
        <div className="w-full">
          <h5 className="h5">Product Name</h5>
          <input 
            type="text" 
            placeholder="type here..." 
            value={inputs.title}
            onChange={(e) => setInputs({...inputs, title: e.target.value})}
            className="px-3 py-1.5 ring-1 ring-slate-900/10 rounded-lg bg-white text-gray-600 medium-14 mt-1 w-full" 
            required
          />
        </div>
        <div className="w-full">
          <h5 className="h5">Product Description</h5>
          <textarea 
            placeholder="Type here...." 
            value={inputs.description}
            onChange={(e) => setInputs({...inputs, description: e.target.value})}
            className="px-3 py-1.5 ring-1 ring-slate-900/10 rounded-lg bg-white text-gray-600 medium-14 mt-1 w-full" 
            rows="4"
            required
          />
        </div>
        <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center justify-between mb-1">
                <h5 className="h5">Category</h5>
                <button
                  type="button"
                  onClick={() => {
                    setUseNewCategory(!useNewCategory);
                    if (!useNewCategory) {
                      setInputs({...inputs, category: ""});
                    } else {
                      setNewCategory("");
                    }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  {useNewCategory ? "Use Existing" : "Add New"}
                </button>
              </div>
              {useNewCategory ? (
                <input
                  type="text"
                  placeholder="Enter new category..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="px-3 py-1.5 ring-1 ring-slate-900/10 rounded-lg bg-white text-gray-600 medium-14 mt-1 w-full"
                  required
                />
              ) : (
                <select 
                  value={inputs.category}
                  onChange={(e) => setInputs({...inputs, category: e.target.value})}
                  className="px-3 py-1.5 ring-1 ring-slate-900/10 rounded-lg bg-white text-gray-600 medium-14 mt-1 w-full"
                  required
                >
                  <option value="">Select Category</option>
                  {allCategories.map((cat, index)=>(
                    <option key={index} value={cat}>{cat}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center justify-between mb-1">
                <h5 className="h5">Type</h5>
                <button
                  type="button"
                  onClick={() => {
                    setUseNewType(!useNewType);
                    if (!useNewType) {
                      setInputs({...inputs, type: ""});
                    } else {
                      setNewType("");
                    }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  {useNewType ? "Use Existing" : "Add New"}
                </button>
              </div>
              {useNewType ? (
                <input
                  type="text"
                  placeholder="Enter new type..."
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="px-3 py-1.5 ring-1 ring-slate-900/10 rounded-lg bg-white text-gray-600 medium-14 mt-1 w-full"
                  required
                />
              ) : (
                <select 
                  value={inputs.type}
                  onChange={(e) => setInputs({...inputs, type: e.target.value})}
                  className="px-3 py-1.5 ring-1 ring-slate-900/10 rounded-lg bg-white text-gray-600 medium-14 mt-1 w-full"
                  required
                >
                  <option value="">Select Type</option>
                  {allTypes.map((t, index)=>(
                    <option key={index} value={t}>{t}</option>
                  ))}
                </select>
              )}
            </div>
        </div>
        {/*Size and Price Pairs */}
        <div className="w-full mt-4">
              <h5 className="h5">Sizes and Prices</h5>
              <div className="flex gap-4 mt-2">
                <input onChange={(e)=>setNewSize(e.target.value)} value={newSize} type="text" placeholder="Size (e.g. 50kg)" className="px-3 py-1.5 ring-1 ring-slate-900/10 rounded-lg bg-white text-gray-600 medium-14 w-32" />

                <input onChange={(e)=>setNewPrice(e.target.value)} value={newPrice} type="number" placeholder="Price" className="px-3 py-1.5 ring-1 ring-slate-900/10 rounded-lg bg-white text-gray-600 medium-14 w-32" />
                <button type="button" onClick={addSizePrice} className="btn-secondary font-semibold p-1.5 rounded-lg">Add</button>
              </div>
              <div className="mt-2 space-y-2">
                {sizePrices.map((sp, index)=>(
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="medium-14">{sp.size}: ${sp.price}</span>
                    <button type="button" onClick={()=> removeSizePrice(sp.size)} className="text-red-500 hover:text-red-700">Remove</button>
                  </div>
                ))}
              </div>
        </div>
        {/*Images */}
        <div className="flex gap-2 mt-2 flex-wrap">
          {Object.keys(images).map((key)=>(
            <label key={key} htmlFor={`productImage${key}`} className="ring-1 ring-slate-900/10 overflow-hidden rounded-lg cursor-pointer">
              <input onChange={(e)=>setImages({...images, [key]: e.target.files[0]})} type="file" accept="image/*" id={`productImage${key}`} hidden/>
              <div className="h-20 w-24 sm:h-24 sm:w-28 bg-white flexCenter">
                <img src={images[key]? URL.createObjectURL(images[key]): assets.uploadIcon} alt="" className="w-full h-full overflow-hidden object-contain" />
              </div>
            </label>
          ))}
        </div>
        <div className="flex gap-2 mt-3 items-center">
          <h5 className="h5">Add to Popular</h5>
          <input type="checkbox" checked={inputs.popular} onChange={(e)=> setInputs({...inputs, popular: e.target.checked})} />
          </div>
          <button type="submit" disabled={loading} className="btn-secondary font-semibold mt-3 p-2 w-full sm:max-w-36 rounded-xl">
            {loading ? "Adding...":"Add Product"}
          </button>
      </form>
    </div>
  )
};

export default AddProduct;
