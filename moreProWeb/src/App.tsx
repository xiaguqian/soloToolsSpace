import { useState, useEffect } from 'react';
import { TabBar } from './components/TabBar';
import { SelectTenantPage } from './pages/SelectTenantPage';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { useStore } from './store';
import { Tenant, Product, Order } from './api';

type Page =
  | 'select-tenant'
  | 'login'
  | 'home'
  | 'products'
  | 'product-detail'
  | 'cart'
  | 'checkout'
  | 'order-success'
  | 'orders'
  | 'order-detail';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('select-tenant');
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderSuccessNo, setOrderSuccessNo] = useState('');
  const [refreshOrders, setRefreshOrders] = useState(false);
  
  const { tenant, cart } = useStore();

  useEffect(() => {
    if (tenant) {
      setCurrentPage('home');
    }
  }, [tenant]);

  const handleSelectTenant = (tenant: Tenant) => {
    setCurrentPage('home');
    setActiveTab('home');
  };

  const handleLoginSuccess = () => {
    setCurrentPage('home');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'home') {
      setCurrentPage('home');
    } else if (tab === 'products') {
      setCurrentPage('products');
      setSelectedCategory('');
    } else if (tab === 'cart') {
      setCurrentPage('cart');
    } else if (tab === 'profile') {
      setCurrentPage('profile');
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product-detail');
  };

  const handleSearch = () => {
    setCurrentPage('products');
    setActiveTab('products');
    setSelectedCategory('');
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage('products');
    setActiveTab('products');
  };

  const handleAddToCartSuccess = () => {
    setCurrentPage('cart');
    setActiveTab('cart');
  };

  const handleCheckout = () => {
    setCurrentPage('checkout');
  };

  const handleOrderSuccess = (orderNo: string) => {
    setOrderSuccessNo(orderNo);
    setCurrentPage('order-success');
  };

  const handleViewOrders = () => {
    setRefreshOrders((prev) => !prev);
    setCurrentPage('orders');
  };

  const handleOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setCurrentPage('order-detail');
  };

  const handleRefreshOrder = () => {
    setRefreshOrders((prev) => !prev);
    if (selectedOrder) {
      setSelectedOrder({ ...selectedOrder });
    }
  };

  const handleGoHome = () => {
    setCurrentPage('home');
    setActiveTab('home');
  };

  const handleBack = () => {
    switch (currentPage) {
      case 'product-detail':
        setCurrentPage(activeTab === 'products' ? 'products' : 'home');
        break;
      case 'checkout':
        setCurrentPage('cart');
        setActiveTab('cart');
        break;
      case 'order-success':
        setCurrentPage('home');
        setActiveTab('home');
        break;
      case 'orders':
        setCurrentPage('home');
        setActiveTab('home');
        break;
      case 'order-detail':
        setCurrentPage('orders');
        break;
      case 'login':
        setCurrentPage('select-tenant');
        break;
      default:
        setCurrentPage('home');
        setActiveTab('home');
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const showTabBar = ['home', 'products', 'cart', 'profile'].includes(currentPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {currentPage === 'select-tenant' && (
        <SelectTenantPage onSelect={handleSelectTenant} />
      )}

      {currentPage === 'login' && (
        <LoginPage onSuccess={handleLoginSuccess} onBack={handleBack} />
      )}

      {currentPage === 'home' && (
        <>
          <HomePage
            onProductClick={handleProductClick}
            onSearch={handleSearch}
            onCategoryClick={handleCategoryClick}
          />
          {showTabBar && (
            <TabBar activeTab={activeTab} onTabChange={handleTabChange} cartCount={cartCount} />
          )}
        </>
      )}

      {currentPage === 'products' && (
        <>
          <ProductsPage
            onProductClick={handleProductClick}
            initialCategory={selectedCategory}
          />
          {showTabBar && (
            <TabBar activeTab={activeTab} onTabChange={handleTabChange} cartCount={cartCount} />
          )}
        </>
      )}

      {currentPage === 'product-detail' && selectedProduct && (
        <ProductDetailPage
          product={selectedProduct}
          onBack={handleBack}
          onAddToCartSuccess={handleAddToCartSuccess}
        />
      )}

      {currentPage === 'cart' && (
        <>
          <CartPage onCheckout={handleCheckout} />
          {showTabBar && (
            <TabBar activeTab={activeTab} onTabChange={handleTabChange} cartCount={cartCount} />
          )}
        </>
      )}

      {currentPage === 'checkout' && (
        <CheckoutPage onBack={handleBack} onSuccess={handleOrderSuccess} />
      )}

      {currentPage === 'order-success' && (
        <OrderSuccessPage
          orderNo={orderSuccessNo}
          onGoHome={handleGoHome}
          onViewOrder={handleViewOrders}
        />
      )}

      {currentPage === 'orders' && (
        <OrdersPage onBack={handleBack} onOrderDetail={handleOrderDetail} />
      )}

      {currentPage === 'order-detail' && selectedOrder && (
        <OrderDetailPage
          order={selectedOrder}
          onBack={handleBack}
          onRefresh={handleRefreshOrder}
        />
      )}

      {currentPage === 'profile' && (
        <>
          <ProfilePage
            onLogin={() => setCurrentPage('login')}
            onViewOrders={handleViewOrders}
          />
          {showTabBar && (
            <TabBar activeTab={activeTab} onTabChange={handleTabChange} cartCount={cartCount} />
          )}
        </>
      )}
    </div>
  );
}