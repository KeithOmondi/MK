

// Existing imports (user, admin, auth, etc.)
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import CustomerService from "../pages/CustomerService";
import TodaysDeal from "../pages/TodaysDeal";
import Electronics from "../pages/Electronics";
import Fashion from "../pages/Fashion";
import Grocery from "../pages/Grocery";
import CategoryPage from "../pages/CategoryPage";
import ProductPage from "../pages/ProductPage";
//import UserLayout from "../components/User/UserLayout";
import AdminLayout from "../components/Admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import NotFound from "../pages/NotFound";
import SupplierLayout from "../components/Supplier/SupplierLayout";
import SupplierDashboard from "../pages/Supplier/SupplierDashboard";
import AdminOrders from "../pages/admin/AdminOrders";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminSuppliers from "../pages/admin/AdminSuppliers";
import SupplierApplicationForm from "../pages/SupplierApplicationForm";
import Signup from "../pages/auth/Register";
import VerifyOtp from "../pages/auth/VerifyOTP";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import AddProducts from "../pages/Supplier/AddProduct";

// ------------------ USER ROUTES ------------------
export const userRoutes = [
  { path: "/", element: <HomePage /> },
  { path: "/customer-service", element: <CustomerService /> },
  { path: "/deals", element: <TodaysDeal /> },
  { path: "/electronics", element: <Electronics /> },
  { path: "/fashion", element: <Fashion /> },
  { path: "/grocery", element: <Grocery /> },
  { path: "/category/:category", element: <CategoryPage /> },
  { path: "/category/:category/:subcategory", element: <CategoryPage /> },
  { path: "/product/:id", element: <ProductPage /> },
  { path: "/community", element: <SupplierApplicationForm /> },
];

// ------------------ ADMIN ROUTES ------------------
export const adminRoutes = [
  {
    path: "/admin/dashboard",
    element: (
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    ),    
  },
  {
        path: "/admin/orders",
        element: (
            <AdminLayout>
                <AdminOrders />
            </AdminLayout>
        )
    },
    {
        path: "/admin/products",
        element: (
            <AdminLayout>
                <AdminProducts />
            </AdminLayout>
        )
    },
    {
        path: "/admin/suppliers",
        element: (
            <AdminLayout>
                <AdminSuppliers />
            </AdminLayout>
        )
    },
];

// ------------------ SUPPLIER ROUTES ------------------
export const supplierRoutes = [
  {
    path: "/supplier/dashboard",
    element: (
      <SupplierLayout>
        <SupplierDashboard />
      </SupplierLayout>
    ),
  },
  {
    path: "/supplier/products/add",
    element: (
      <SupplierLayout>
        <AddProducts />
      </SupplierLayout>
    ),
  },
];

// ------------------ AUTH ROUTES ------------------
export const authRoutes = [
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <Signup /> },
  { path: "/verify-otp", element: <VerifyOtp /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/password/reset/:id", element: <ResetPassword /> },
];

// ------------------ FALLBACK ------------------
export const notFoundRoute = { path: "*", element: <NotFound /> };
