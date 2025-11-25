import React from "react";
import Header from "./components/Header.jsx";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Collection from "./pages/Collection.jsx";
import Footer from "./components/Footer.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Blog from "./pages/Blog.jsx";
import BlogDetail from "./pages/BlogDetail.jsx";
import Contact from "./pages/Contact.jsx";
import Cart from "./pages/Cart.jsx";
import AddressForm from "./pages/AddressForm.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import TrackOrder from "./pages/TrackOrder.jsx";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/owner/Sidebar.jsx";
import Dashboard from "./pages/owner/Dashboard.jsx";
import AddProduct from "./pages/owner/AddProduct.jsx";
import ListProduct from "./pages/owner/ListProduct.jsx";

const App = () => {
  const location = useLocation()
  const isOwnerPath = location.pathname.includes('owner')


  return (
    <main className="overflow-hidden text-tertiary">
      {!isOwnerPath &&<Header />}
      <Toaster position="bottom-right"/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/collection/:productId" element={<ProductDetails />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/address-form" element={<AddressForm />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/track-order/:orderId" element={<TrackOrder />} />
        <Route path="/owner" element = {<Sidebar />}>
            <Route index element = {<Dashboard/>}/>
            <Route path="/owner/add-product" element = {<AddProduct/>}/>
            <Route path="/owner/list-product" element = {<ListProduct/>}/>
        </Route>
      </Routes>
      {!isOwnerPath && <Footer />}
    </main>
  );
};

export default App;
