import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Sidebar from "./Component/Sidebar/Sidebar.jsx";
import Dashboard from "./Pages/dashboard/Dashboard.jsx";
import Contact from "./Pages/contact/Contact.jsx";
import Invoices from "./Pages/invoice/Invoices.jsx";
import NewInvoices from "./Pages/invoice/NewInvoices.jsx";
import Setting from './Pages/profile/Setting.jsx';
import AuthForm from "./Component/Auth/AuthForm.jsx";
import Home from "./Pages/home/Home.jsx";
import InvoiceDetails from "./Component/invoiceDetails/InvoiceDetails.jsx";
import About from "./Pages/about/About.jsx";
import Footer from "./Pages/footer/Footer.jsx";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // Check localStorage for token on component mount (or page reload)
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // PrivateRoute component to protect specific routes
  const PrivateRoute = ({ children }) => {
    return token ? children : <Navigate to="/" />;
  };

  return (
    <BrowserRouter>
      <Sidebar setToken={setToken}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={!token ? <Home/> : <Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<AuthForm setToken={setToken} />} />

          {/* Private Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <PrivateRoute>
                <Invoices />
              </PrivateRoute>
            }
          />
          <Route
            path="/new-invoice"
            element={
              <PrivateRoute>
                <NewInvoices />
              </PrivateRoute>
            }
          />
          <Route
            path="/setting"
            element={
              <PrivateRoute>
                <Setting />
              </PrivateRoute>
            }
          />
          <Route
            path="/invoice-details"
            element={
              <PrivateRoute>
                <InvoiceDetails />
              </PrivateRoute>
            }
          />
        </Routes>
      </Sidebar>
      <Footer/>

    </BrowserRouter>
  );
};

export default App;
