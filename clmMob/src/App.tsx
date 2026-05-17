
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Menu from "@/pages/Menu";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import OrderConfirm from "@/pages/OrderConfirm";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import Profile from "@/pages/Profile";
import Addresses from "@/pages/Addresses";
import Settings from "@/pages/Settings";
import BottomNav from "@/components/BottomNav";

export default function App() {
  const hideBottomNavPaths = ['/menu/:tenantId/product/:productId', '/order/confirm', '/orders/:orderId'];

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu/:tenantId" element={<Menu />} />
        <Route path="/menu/:tenantId/product/:productId" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order/confirm" element={<OrderConfirm />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:orderId" element={<OrderDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/addresses" element={<Addresses />} />
        <Route path="/profile/settings" element={<Settings />} />
      </Routes>
      {!hideBottomNavPaths.some(path => {
        const pathRegex = new RegExp('^' + path.replace(/:\w+/g, '[^/]+') + '$');
        const location = window.location.pathname;
        return pathRegex.test(location);
      }) && <BottomNav />}
    </Router>
  );
}
