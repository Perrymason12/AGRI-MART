import React, { useEffect, useMemo, useState, useCallback } from "react";
import Item from "../components/Item";
import { useAppContext } from "../context/AppContext";
import SearchInput from "../components/SearchInput";

const Collection = () => {
  const { products, searchQuery } = useAppContext();
  const [category, setCategory] = useState([]);
  const [type, setType] = useState([]);
  const [selectedSort, setSelectedSort] = useState("relevant");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [availableTypes, setAvailableTypes] = useState([]);
  const itemsPerPage = 8;

  //predefined category list
  const allCategories = useMemo(() => {
    const categories = products.map((product) => product.category);
    return [ ...new Set(categories)];
  }, [products]);

  // reusable function to toggle filter values
  const toggleFilter = (value, setState) => {
    setState((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  //dynamically update types based o specific categories
  useEffect(() => {
    const selectedCats = category.length > 0 ? category : allCategories;
    const filteredProds = products.filter((p) =>
      selectedCats.includes(p.category)
    );
    const typesSet = new Set(filteredProds.map((p) => p.type));
    const newAvailableTypes = [...typesSet].sort();
    setAvailableTypes(newAvailableTypes);

    // remove unavailable types from selection
    setType((prev) => prev.filter((t) => typesSet.has(t)));
  }, [category, products, allCategories]);

  // Apply filter like search , category , type and inStock

  const applyFilters = useCallback(() => {
    let filtered = [...products];
    //products that are in stock
    filtered = filtered.filter((p) => p.inStock);

    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (category.length) {
      filtered = filtered.filter((product) =>
        category.includes(product.category)
      );
    }

    if (type.length) {
      filtered = filtered.filter((product) => type.includes(product.type));
    }

    return filtered;
  }, [products, searchQuery, category, type]);

  // sorting logic based on price or relevance
  const applySorting = useCallback((productsList) => {
    switch (selectedSort) {
      case "low":
        return [...productsList].sort(
          (a, b) =>
            Math.min(...Object.values(a.price)) -
            Math.min(...Object.values(b.price))
        );

      case "high":
        return [...productsList].sort(
          (a, b) =>
            Math.min(...Object.values(b.price)) -
            Math.min(...Object.values(a.price))
        );

      default:
        return productsList;
    }
  }, [selectedSort]);

  // update filtered and sorted products whenever dependencies change
  useEffect(() => {
    let filtered = applyFilters();
    let sorted = applySorting(filtered);
    setFilteredProducts(sorted);
    setCurrentPage(1); // reset to first page when filters change
  }, [category, type, selectedSort, products, searchQuery, applyFilters, applySorting]);

  // handle pagination logic
  const getPaginatedProducts = ()=>{
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredProducts.slice(startIndex, endIndex)
  }

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  return (
    <div className="max-padd-container px-0! mt-22">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-16">
        {/*filter options */}
        <div className="w-full sm:min-w-72 bg-primary p-3 sm:p-4 pl-3 sm:pl-4 lg:pl-12 rounded-xl sm:rounded-r-xl">
          <SearchInput />
          <div className="px-3 sm:px-4 py-3 mt-2 bg-white rounded-xl">
            <h5 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Sort By Price</h5>
            <select onChange={(e)=>setSelectedSort(e.target.value)} className="border border-slate-900/10 outline-none text-gray-30 text-xs sm:text-sm medium-14 h-8 w-full px-2 rounded-md">
              <option value="relevant">Relevant</option>
              <option value="low">Low</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="px-3 sm:pl-5 py-3 mt-3 sm:mt-4 bg-white rounded-xl">
            <h5 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Categories</h5>
            <div className="flex flex-col gap-2 text-xs sm:text-sm font-light">
              {allCategories.map((cat) => (
                <label key={cat} className="flex gap-2 medium-14 text-gray-30 cursor-pointer">
                  <input onChange={(e)=>toggleFilter(e.target.value , setCategory)} type="checkbox" value={cat} 
                  checked = {category.includes(cat)}
                  className="w-4 h-4 mt-0.5" />
                  {cat}
                </label>
              ))}
            </div>
          </div>
          <div className="px-3 sm:pl-5 py-3 mt-3 sm:mt-4 bg-white rounded-xl">
            <h5 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Types</h5>
            <div className="flex flex-col gap-2 text-xs sm:text-sm font-light">
              {availableTypes.map((typ)=>(
                <label key={typ} className="flex gap-2 medium-14 text-gray-30 cursor-pointer">
                  <input onChange={(e)=>toggleFilter(e.target.value , setType)} type="checkbox"
                  value={typ} checked = {type.includes(typ)} className="w-4 h-4 mt-0.5"/>
                  {typ}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/*Right side - filtered Products */}
        <div className="max w-full sm:px-10 sm:pr-10">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {getPaginatedProducts().length > 0 ? (
              getPaginatedProducts().map((product) => (
                <Item product={product} key={product._id} />
              ))
            ) : (
              <p className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-3 xl:col-span-4 text-center capitalize text-sm sm:text-base text-gray-600 py-8">
                No products found for selected filters
              </p>
            )}
          </div>
          {/*pagination */}
          <div className="flexCenter flex-wrap mt-8 sm:mt-14 mb-6 sm:mb-10 gap-2 sm:gap-4">
            <button disabled={currentPage === 1}
            onClick={()=> setCurrentPage((prev)=> prev - 1)}
            className={`btn-secondary py-1.5! px-3! sm:py-2! text-xs sm:text-sm ${currentPage === 1 && "opacity-50 cursor-not-allowed"}`}>
              Previous
            </button>
            {Array.from({length: totalPages},(_, index)=>(
              <button key={index + 1} 
            onClick={()=> setCurrentPage(index + 1)}
            className={`btn-light py-1.5! px-2.5! sm:py-1! sm:px-3! text-xs sm:text-sm min-w-[32px] sm:min-w-[36px] ${currentPage === index + 1 && "bg-tertiary text-white"}`}>
                {index + 1}
              </button>
            ))}
            <button disabled={currentPage === totalPages}
            onClick={()=> setCurrentPage((prev)=> prev + 1)}
            className={`btn-secondary py-1.5! px-3! sm:py-2! text-xs sm:text-sm ${currentPage === totalPages && "opacity-50 cursor-not-allowed"}`}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;
