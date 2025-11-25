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
    <div className="max-padd-container mt-16 md:mt-20 lg:mt-22">
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-8 xl:gap-10 mb-12 md:mb-14 lg:mb-16">
        {/*filter options */}
        <div className="w-full lg:w-auto lg:min-w-[240px] lg:max-w-[260px] xl:min-w-[250px] xl:max-w-[270px] bg-primary p-3 md:p-4 lg:p-5 pl-3 md:pl-5 lg:pl-6 xl:pl-7 rounded-xl lg:rounded-r-xl lg:sticky lg:top-24 lg:h-fit">
          <SearchInput />
          <div className="px-3 md:px-4 py-3 md:py-4 mt-2 bg-white rounded-xl">
            <h5 className="text-sm md:text-base font-semibold mb-3 md:mb-4">Sort By Price</h5>
            <select onChange={(e)=>setSelectedSort(e.target.value)} className="border border-slate-900/10 outline-none text-gray-30 text-sm md:text-base medium-14 h-9 md:h-10 w-full px-3 rounded-md cursor-pointer hover:border-slate-900/20 transition-colors">
              <option value="relevant">Relevant</option>
              <option value="low">Low</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="px-3 md:pl-4 lg:pl-5 py-3 md:py-4 mt-3 md:mt-4 bg-white rounded-xl">
            <h5 className="text-sm md:text-base font-semibold mb-3 md:mb-4">Categories</h5>
            <div className="flex flex-col gap-2 md:gap-2.5 text-sm font-light max-h-[300px] md:max-h-[400px] overflow-y-auto custom-scrollbar">
              {allCategories.map((cat) => (
                <label key={cat} className="flex gap-2.5 md:gap-3 medium-14 text-gray-30 cursor-pointer hover:text-tertiary transition-colors py-1">
                  <input onChange={(e)=>toggleFilter(e.target.value , setCategory)} type="checkbox" value={cat} 
                  checked = {category.includes(cat)}
                  className="w-4 h-4 md:w-5 md:h-5 mt-0.5 cursor-pointer accent-secondary" />
                  <span className="select-none">{cat}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="px-3 md:pl-4 lg:pl-5 py-3 md:py-4 mt-3 md:mt-4 bg-white rounded-xl">
            <h5 className="text-sm md:text-base font-semibold mb-3 md:mb-4">Types</h5>
            <div className="flex flex-col gap-2 md:gap-2.5 text-sm font-light max-h-[300px] md:max-h-[400px] overflow-y-auto custom-scrollbar">
              {availableTypes.map((typ)=>(
                <label key={typ} className="flex gap-2.5 md:gap-3 medium-14 text-gray-30 cursor-pointer hover:text-tertiary transition-colors py-1">
                  <input onChange={(e)=>toggleFilter(e.target.value , setType)} type="checkbox"
                  value={typ} checked = {type.includes(typ)} className="w-4 h-4 md:w-5 md:h-5 mt-0.5 cursor-pointer accent-secondary"/>
                  <span className="select-none">{typ}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/*Right side - filtered Products */}
        <div className="flex-1 w-full min-w-0">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8">
            {getPaginatedProducts().length > 0 ? (
              getPaginatedProducts().map((product) => (
                <Item product={product} key={product._id} />
              ))
            ) : (
              <p className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-3 xl:col-span-3 text-center capitalize text-sm sm:text-base text-gray-600 py-8">
                No products found for selected filters
              </p>
            )}
          </div>
          {/*pagination */}
          <div className="flexCenter flex-wrap mt-10 md:mt-14 lg:mt-16 xl:mt-20 mb-6 md:mb-8 lg:mb-10 xl:mb-12 gap-3 md:gap-4">
            <button disabled={currentPage === 1}
            onClick={()=> setCurrentPage((prev)=> prev - 1)}
            className={`btn-secondary py-2! px-4! md:py-2.5! md:px-5! text-xs sm:text-sm md:text-base transition-all hover:scale-105 ${currentPage === 1 && "opacity-50 cursor-not-allowed hover:scale-100"}`}>
              Previous
            </button>
            {Array.from({length: totalPages},(_, index)=>(
              <button key={index + 1} 
            onClick={()=> setCurrentPage(index + 1)}
            className={`btn-light py-2! px-3! md:py-2.5! md:px-4! text-xs sm:text-sm md:text-base min-w-[36px] md:min-w-[40px] lg:min-w-[44px] transition-all hover:scale-105 ${currentPage === index + 1 && "bg-tertiary text-white hover:scale-100"}`}>
                {index + 1}
              </button>
            ))}
            <button disabled={currentPage === totalPages}
            onClick={()=> setCurrentPage((prev)=> prev + 1)}
            className={`btn-secondary py-2! px-4! md:py-2.5! md:px-5! text-xs sm:text-sm md:text-base transition-all hover:scale-105 ${currentPage === totalPages && "opacity-50 cursor-not-allowed hover:scale-100"}`}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Collection;
