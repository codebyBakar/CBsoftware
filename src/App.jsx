import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./components/register/Register";
import Login from "./components/login/Login";
import Dashboard from "./components/dashboard/Dashboard";
import PrivateRoute from "./components/private-route/PrivateRoute";
import AddProduct from "./components/products/AddProduct";
import AllProducts from "./components/products/AllProducts";
import EditProduct from "./components/products/EditProduct";
import AddCategory from "./components/categories/AddCategory";
import AllCategories from "./components/categories/AllCategories";
import EditCategory from "./components/categories/EditCategory";
import CreateOrder from "./components/POS-pages/CreateOrder";
import OrderSummary from "./components/POS-pages/OrderSummary";
import AllOrders from "./components/POS-pages/AllOrders";
import ViewOrder from "./components/POS-pages/ViewOrder";

function App(){

  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />


         <Route
          path="/add-product"
          element={
            <PrivateRoute>
              <AddProduct/>
            </PrivateRoute>
          }
        />

        <Route
          path="/all-products"
          element={
            <PrivateRoute>
              <AllProducts/>
            </PrivateRoute>
          }
        />


        <Route
          path="/edit-product/:id"
          element={
            <PrivateRoute>
              <EditProduct/>
            </PrivateRoute>
          }
        />

         <Route
       path="/add-category"
       element={
      <PrivateRoute>
      <AddCategory/>
       </PrivateRoute>
      }
        />

        <Route
       path="/all-categories"
      element={
     <PrivateRoute>
      <AllCategories/>
        </PrivateRoute>
     }
        />


        <Route
    path="/edit-category/:id"
     element={
    <PrivateRoute>
      <EditCategory />
    </PrivateRoute>
     }
    />

     <Route
          path="/create-order"
          element={
            <PrivateRoute>
              <CreateOrder />
            </PrivateRoute>
          }
        />

        <Route
          path="/order-summary"
          element={
            <PrivateRoute>
              <OrderSummary />
            </PrivateRoute>
          }
        />

        <Route
          path="/all-orders"
          element={
            <PrivateRoute>
              <AllOrders />
            </PrivateRoute>
          }
        />

        <Route
          path="/view-order/:id"
          element={
            <PrivateRoute>
              <ViewOrder />
            </PrivateRoute>
          }
        />

        



      </Routes>

      
    

    </BrowserRouter>
  );
}

export default App;