import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { AccountPage } from './pages/AccountPage';
import { SellerGuard } from './seller/components/SellerGuard';
import { SellerLayout } from './seller/layout/SellerLayout';
import { DashboardPage } from './seller/pages/DashboardPage';
import { ProductsPage } from './seller/pages/ProductsPage';
import { ProductFormPage } from './seller/pages/ProductFormPage';
import { OrdersPage } from './seller/pages/OrdersPage';
import { OrderDetailPage } from './seller/pages/OrderDetailPage';
import { AnalyticsPage } from './seller/pages/AnalyticsPage';
import { SettingsPage } from './seller/pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'catalog', element: <CatalogPage /> },
      { path: 'product/:id', element: <ProductPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'account', element: <AccountPage /> },
    ],
  },
  {
    path: '/seller',
    element: <SellerGuard />,
    children: [
      {
        element: <SellerLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'products', element: <ProductsPage /> },
          { path: 'products/new', element: <ProductFormPage /> },
          { path: 'products/:id/edit', element: <ProductFormPage /> },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'orders/:id', element: <OrderDetailPage /> },
          { path: 'analytics', element: <AnalyticsPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
]);
