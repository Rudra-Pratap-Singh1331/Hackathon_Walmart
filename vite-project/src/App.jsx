import AppLayout from "./Component/AppLayout";
import AllProducts from "./Component/AllProducts";
import Cart from "./Component/Cart";
import ProductDetail from "./Component/ProductDetails";
import Shoes from "./Component/Shoes";
import Furniture from "./Component/Furniture";
import Mobile from "./Component/Mobile";
import Laptop from "./Component/Laptop";
import Search from "./Component/Search";
import Login from "./Component/Login";          // ✅ Import Login
import Register from "./Component/Register"; // ✅ Import Register
import Grocery from "./Component/Grocery";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Navigate } from "react-router-dom";
import "./index.css";

function App() {
  const router = createBrowserRouter([
    // ✅ Login & Register pages (no layout/nav)
     {
    path: "/",
    element: <Navigate to="/login" />, // ✅ redirect root to /login
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { path: "/home", element: <AllProducts /> },
      { path: "/cart/:cartId", element: <Cart /> },
      { path: "/product/:id/:cartId", element: <ProductDetail /> },
      { path: "/shoes", element: <Shoes /> },
      { path: "/furniture", element: <Furniture /> },
      { path: "/mobile", element: <Mobile /> },
      { path: "/laptop", element: <Laptop /> },
      { path: "/grocery" , element: <Grocery/>},
      { path: "/search", element: <Search /> },

    ],
  },
])

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
