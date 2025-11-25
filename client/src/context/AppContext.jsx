/* eslint-disable react-refresh/only-export-components */
import { useUser, useAuth } from "@clerk/clerk-react";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../utils/api";
import { API_BASE_URL } from "../utils/constants";
import { dummyProducts } from "../assets/data";

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState(() => {
    try {
      const raw = localStorage.getItem('plp_cart');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [method, setMethod] = useState("COD");
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [authAvailable, setAuthAvailable] = useState(true); // whether auth/token is usable
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY || "$";
  const delivery_charges = 10; //10 dollars

  // Clerk - with error handling
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken, isLoaded: authLoaded } = useAuth();
  
  // Handle Clerk loading errors
  useEffect(() => {
    if (userLoaded && authLoaded && !user) {
      // Clerk is loaded but user is not signed in - this is normal
      setAuthAvailable(true);
    }
  }, [userLoaded, authLoaded, user]);

  // Helper function to make authenticated API requests
  const apiRequest = async (endpoint, options = {}) => {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    });
    return response.json();
  };

  // Ensure we can get a valid token; if not, set authAvailable false and return null
  const ensureAuth = async (forceRefresh = false) => {
    try {
      // Force token refresh if requested
      const token = forceRefresh 
        ? await getToken({ template: 'default' }) 
        : await getToken();
      
      if (!token) {
        setAuthAvailable(false);
        return null;
      }
      // optimistic: assume token works; caller should handle 401s
      setAuthAvailable(true);
      return token;
    } catch (err) {
      console.warn('ensureAuth: unable to get token', err);
      setAuthAvailable(false);
      return null;
    }
  };

  // Sync user with backend
  useEffect(() => {
    const syncUser = async () => {
      if (user) {
        try {
          const token = await getToken();
          const data = await api.getUser(token);
          if (data.success) {
            setIsOwner(data.user.isOwner || data.user.role === 'owner');
          }
        } catch (error) {
          console.error('Error syncing user:', error);
        }
      }
    };
    syncUser();
  }, [user, getToken]);

  // FETCH ALL PRODUCTS
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      if (data && data.success && Array.isArray(data.products) && data.products.length > 0) {
        // Prefer local images from dummyProducts when available: match by normalized title
        const normalize = (s = '') => s.toString().trim().replace(/\s+/g, ' ').toLowerCase();
        const localMap = new Map();
        dummyProducts.forEach(dp => localMap.set(normalize(dp.title), dp.images));

        const merged = data.products.map(p => {
          const key = normalize(p.title);
          if (localMap.has(key)) {
            // replace images with local asset refs so UI shows bundled images
            return { ...p, images: localMap.get(key) };
          }
          return p;
        });

        setProducts(merged);
      } else {
        // fallback to local dummy products when API returns empty or on unexpected response
        setProducts(dummyProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
      // fallback to local dummy products on network/error
      setProducts(dummyProducts);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load cart from backend
  const loadCart = useCallback(async () => {
    // If no signed-in user or auth not available, keep local cart
    if (!user) return;
    try {
      const token = await ensureAuth();
      if (!token) {
        // leave cartItems as localStorage state
        return;
      }
      let data = await api.getCart(token);
      if (data && data.status === 401) {
        // try refreshing token once with force refresh
        const refreshed = await ensureAuth(true);
        if (refreshed && refreshed !== token) {
          data = await api.getCart(refreshed);
        }
        if (data && data.status === 401) {
          setAuthAvailable(false);
          // Clear invalid token state
          toast.error('Session expired. Please sign in again.');
          return;
        }
      }
      if (data && data.success && data.cart) {
        const cartData = {};
        data.cart.items.forEach(item => {
          const productId = item.productId._id || item.productId;
          cartData[productId] = cartData[productId] || {};
          cartData[productId][item.size] = item.quantity;
        });
        setCartItems(cartData);
        persistLocalCart(cartData);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }, [user, getToken]);

  // Load addresses
  const loadAddresses = useCallback(async () => {
    // If user not signed in, load local addresses
    if (!user) {
      try {
        const raw = localStorage.getItem('plp_addresses');
        setAddresses(raw ? JSON.parse(raw) : []);
      } catch {
        setAddresses([]);
      }
      return;
    }

    try {
      const token = await ensureAuth();
      if (!token) {
        // fallback to local addresses when auth unavailable
        const raw = localStorage.getItem('plp_addresses');
        setAddresses(raw ? JSON.parse(raw) : []);
        return;
      }

      let data = await api.getAddresses(token);
      if (data && data.status === 401) {
        // Force token refresh
        const refreshed = await ensureAuth(true);
        if (refreshed && refreshed !== token) {
          data = await api.getAddresses(refreshed);
        }
        if (data && data.status === 401) {
          setAuthAvailable(false);
          const raw = localStorage.getItem('plp_addresses');
          setAddresses(raw ? JSON.parse(raw) : []);
          toast.error('Session expired. Please sign in again.');
          return;
        }
      }

      if (data && data.success) {
        setAddresses(data.addresses);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  }, [user, getToken]);

  // Add Product to cart
  const persistLocalCart = (cart) => {
    try {
      localStorage.setItem('plp_cart', JSON.stringify(cart));
    } catch {
      // ignore storage errors
    }
  };

  const addToCart = async (itemId, size, quantity = 1) => {
    if (!size) return toast.error('Please select a size first');

    // Validate product ID format (MongoDB ObjectId should be 24 hex characters)
    if (!itemId || typeof itemId !== 'string') {
      console.error('Invalid product ID:', itemId);
      toast.error('Invalid product ID. Please refresh the page and try again.');
      return false;
    }

    // Check if it's a valid MongoDB ObjectId format (24 hex characters)
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    if (!objectIdPattern.test(itemId)) {
      console.error('Product ID is not a valid MongoDB ObjectId:', itemId);
      toast.error('This product cannot be added to cart. Please ensure products are loaded from the database.');
      return false;
    }

    // Guest flow: store cart in localStorage
    if (!user) {
      // safe deep clone fallback
      const cartData = JSON.parse(JSON.stringify(cartItems || {}));
      cartData[itemId] = cartData[itemId] || {};
      cartData[itemId][size] = (cartData[itemId][size] || 0) + quantity;
      setCartItems(cartData);
      persistLocalCart(cartData);
      toast.success('Product added to cart');
      return true;
    }

    // Authenticated user: sync with server
    try {
      const token = await getToken();
      let data = await api.addToCart(itemId, size, quantity, token);
      // If unauthorized try to refresh token and retry once
      if (data && data.status === 401 && token) {
        try {
          // Force token refresh
          const refreshed = await getToken({ template: 'default' });
          if (refreshed && refreshed !== token) {
            data = await api.addToCart(itemId, size, quantity, refreshed);
          }
        } catch (refreshErr) {
          console.warn('Token refresh failed:', refreshErr);
          // Continue to fallback handling
        }
      }

      // If still unauthorized, fall back to local cart and ask user to sign in
      if (data && data.status === 401) {
        const cartData = JSON.parse(JSON.stringify(cartItems || {}));
        cartData[itemId] = cartData[itemId] || {};
        cartData[itemId][size] = (cartData[itemId][size] || 0) + quantity;
        setCartItems(cartData);
        persistLocalCart(cartData);
        toast.error('Session expired — added to local cart. Please sign in again to persist.');
        return false;
      }

      if (data && data.success) {
        // Build local cart from server response
        const cartData = {};
        (data.cart.items || []).forEach((item) => {
          const pid = item.productId && item.productId._id ? item.productId._id : item.productId;
          cartData[pid] = cartData[pid] || {};
          cartData[pid][item.size] = item.quantity;
        });
        setCartItems(cartData);
        persistLocalCart(cartData);
        toast.success('Product added to cart');
        return true;
      } else if (data && data.message) {
        // Show backend error message (e.g., "Product is out of stock", "Invalid size")
        toast.error(data.message);
        console.error('Add to cart error response:', data);
        return false;
      } else if (data && !data.success) {
        // Generic failure
        toast.error(data.message || 'Failed to add to cart');
        console.error('Add to cart failed:', data);
        return false;
      } else if (data && data.error) {
        // Error with details
        toast.error(data.message || data.error || 'Failed to add to cart');
        console.error('Add to cart error:', data);
        return false;
      }
    } catch (error) {
      console.error('Add to cart exception:', error);
      toast.error(error.message || 'Failed to add to cart');
      return false;
    }
    console.warn('Add to cart: unexpected response format', data);
    toast.error('Unexpected error adding to cart');
    return false;
  };

  // Get Cart Count
  const getCartCount = () => {
    let count = 0;
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        count += cartItems[itemId][size]
      }
    }
    return count
  }

  // Update Cart Quantity
  const updateQuantity = async (itemId, size, quantity) => {
    // Guest: update local cart
    if (!user) {
      const cartData = structuredClone(cartItems);
      if (!cartData[itemId]) return;
      if (quantity === 0) {
        delete cartData[itemId][size];
        if (Object.keys(cartData[itemId]).length === 0) delete cartData[itemId];
        toast.success('Item removed from cart');
      } else {
        cartData[itemId] = cartData[itemId] || {};
        cartData[itemId][size] = quantity;
      }
      setCartItems(cartData);
      persistLocalCart(cartData);
      return;
    }

    try {
      const token = await getToken();
      let data = await api.updateCartItem(itemId, size, quantity, token);
      
      // If unauthorized, try to refresh token
      if (data && data.status === 401 && token) {
        try {
          // Force token refresh
          const refreshed = await getToken({ template: 'default' });
          if (refreshed && refreshed !== token) {
            data = await api.updateCartItem(itemId, size, quantity, refreshed);
          }
        } catch (refreshErr) {
          console.warn('Token refresh failed:', refreshErr);
          // Continue to error handling
        }
      }

      if (data && data.status === 401) {
        toast.error('Session expired — please sign in again to update your cart.');
        // Fallback to local cart update
        const cartData = structuredClone(cartItems);
        if (quantity === 0 && cartData[itemId]) {
          delete cartData[itemId][size];
          if (Object.keys(cartData[itemId]).length === 0) delete cartData[itemId];
          setCartItems(cartData);
          persistLocalCart(cartData);
        }
        return;
      }

      if (data && data.success && data.cart) {
        // Build local cart from server response
        const cartData = {};
        (data.cart.items || []).forEach((item) => {
          const pid = item.productId && item.productId._id ? item.productId._id : item.productId;
          cartData[pid] = cartData[pid] || {};
          cartData[pid][item.size] = item.quantity;
        });
        setCartItems(cartData);
        persistLocalCart(cartData);
        
        if (quantity === 0) {
          toast.success('Item removed from cart');
        }
      } else if (data && data.message) {
        // Show backend error message
        toast.error(data.message);
        console.error('Update cart error response:', data);
      } else if (data && !data.success) {
        // Generic failure
        toast.error(data.message || 'Failed to update cart');
        console.error('Update cart failed:', data);
      } else {
        // Fallback: update local state even if response format is unexpected
        const cartData = structuredClone(cartItems);
        if (quantity === 0) {
          if (cartData[itemId]) {
            delete cartData[itemId][size];
            if (Object.keys(cartData[itemId]).length === 0) delete cartData[itemId];
            toast.success('Item removed from cart');
          }
        } else {
          cartData[itemId] = cartData[itemId] || {};
          cartData[itemId][size] = quantity;
        }
        setCartItems(cartData);
        persistLocalCart(cartData);
      }
    } catch (error) {
      console.error('Update cart exception:', error);
      toast.error(error.message || 'Failed to update cart');
      
      // Fallback: update local state on error
      try {
        const cartData = structuredClone(cartItems);
        if (quantity === 0 && cartData[itemId]) {
          delete cartData[itemId][size];
          if (Object.keys(cartData[itemId]).length === 0) delete cartData[itemId];
          setCartItems(cartData);
          persistLocalCart(cartData);
          toast.error('Removed locally, but failed to sync with server. Please refresh.');
        }
      } catch (fallbackError) {
        console.error('Fallback update failed:', fallbackError);
      }
    }
  }

  //get Cart Amount
  const getCartAmount = () => {
    let total = 0
    for (const itemId in cartItems) {
      const product = products.find(p => p._id === itemId)
      if (!product) continue
      const priceMap = product.price instanceof Map ? product.price : new Map(Object.entries(product.price));
      for (const size in cartItems[itemId]) {
        const price = priceMap.get(size) || product.price[size];
        if (price) {
          total += price * cartItems[itemId][size]
        }
      }
    }
    return total
  }

  useEffect(() => {
    fetchProducts();
    if (user) {
      loadCart();
      loadAddresses();
    }
  }, [user, fetchProducts, loadCart, loadAddresses]);

  const value = {
    navigate,
    user,
    products,
    currency,
    fetchProducts,
    searchQuery,
    setSearchQuery,
    cartItems,
    setCartItems,
    method,
    setMethod,
    delivery_charges,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    isOwner,
    setIsOwner,
    loading,
    addresses,
    loadAddresses,
    apiRequest,
    getToken
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
