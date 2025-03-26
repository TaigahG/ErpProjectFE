import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Invoices } from './pages/Invoices';
import { Reports } from './pages/Reports';
import { Login } from './pages/Login';
import { PrivateRoute } from './components/PrivateRoute';
import { Inventory } from './pages/inventory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/inventory" element={<Inventory />} />         
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;