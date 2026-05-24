import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ScrollToTop } from './components/ScrollToTop';
import { MainLayout } from './components/layout/MainLayout';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { CategoriesHubPage } from './pages/CategoriesHubPage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { CheckoutConfirmationPage } from './pages/CheckoutConfirmationPage';
import { PayPage } from './pages/PayPage';
import { AccountPage } from './pages/AccountPage';
import { AuthPage } from './pages/AuthPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { SellerGuard } from './seller/components/SellerGuard';
import { SellerLayout } from './seller/layout/SellerLayout';
import { DashboardPage } from './seller/pages/DashboardPage';
import { ProductsPage } from './seller/pages/ProductsPage';
import { ProductFormPage } from './seller/pages/ProductFormPage';
import { OrdersPage } from './seller/pages/OrdersPage';
import { OrderDetailPage } from './seller/pages/OrderDetailPage';
import { AnalyticsPage } from './seller/pages/AnalyticsPage';
import { SettingsPage } from './seller/pages/SettingsPage';
import { TariffsPage } from './seller/pages/TariffsPage';

export const router = createBrowserRouter([
  {
    element: <ScrollToTop />,
    children: [
      { path: '/privacy', element: <PrivacyPolicyPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/auth', element: <AuthPage /> },
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'categories', element: <CategoriesHubPage /> },
          { path: 'catalog', element: <CatalogPage /> },
          { path: 'product/:id', element: <ProductPage /> },
          { path: 'cart', element: <CartPage /> },
          { path: 'checkout', element: <CheckoutPage /> },
          { path: 'checkout/confirmation', element: <CheckoutConfirmationPage /> },
          { path: 'pay', element: <PayPage /> },
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
              { path: 'tariffs', element: <TariffsPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
