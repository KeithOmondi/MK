

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
import UserLayout from "../components/User/UserLayout";
import UserDashboard from "../pages/User/UserDashboard";
import Cart from "../components/Cart/Cart";
import ManageProducts from "../pages/Supplier/ManageProducts";
import MyOrders from "../pages/User/MyOrders";
import Checkout from "../components/Checkout/Checkout";
import ThankYou from "../pages/ThankYou";
import OrderDetails from "../pages/User/OrderDetails";
import SupplierOrders from "../pages/Supplier/SupplierOrders";
import SupplierOrderDetails from "../pages/Supplier/SupplierOrderDetails";
import ForceChangePassword from "../pages/auth/ForceChangePassword";
import AdminUsers from "../pages/admin/AdminUsers";

// ------------------ USER ROUTES ------------------
export const userRoutes = [
  { path: "/dashboard", element: (
    <UserLayout>
      <UserDashboard />
    </UserLayout>
  ) },
  { path: "/user/orders", element: (
    <UserLayout>
      <MyOrders/>
    </UserLayout>
  ) },
  { path: "/user/orders/:id", element: (
    <UserLayout>
      <OrderDetails/>
    </UserLayout>
  ) },
  // ✅ Sensitive routes WITHOUT UserLayout
  {
    path: "/checkout",
    element: <Checkout />,  // No UserLayout here
  },
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
    {
        path: "/admin/customers",
        element: (
            <AdminLayout>
                <AdminUsers />
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
  {
    path: "/supplier/products",
    element: (
      <SupplierLayout>
        <ManageProducts />
      </SupplierLayout>
    ),
  },
  {
    path: "/supplier/orders",
    element: (
      <SupplierLayout>
        <SupplierOrders />
      </SupplierLayout>
    ),
  },
   {
    path: "/supplier/order/:id",
    element: (
      <SupplierLayout>
        <SupplierOrderDetails />
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
  { path: "/password/reset/:token", element: <ResetPassword /> },
  { path: "/force-change-password", element: <ForceChangePassword /> },
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
  { path: "/cart", element: <Cart /> },
  { path: "/thank-you", element: <ThankYou /> },
];

// ------------------ FALLBACK ------------------
export const notFoundRoute = { path: "*", element: <NotFound /> };
