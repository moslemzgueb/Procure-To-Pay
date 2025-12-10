import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RequisitionForm from './pages/RequisitionForm';
import BudgetForm from './pages/BudgetForm';
import BudgetList from './pages/BudgetList';
import PaymentList from './pages/PaymentList';
import PaymentForm from './pages/PaymentForm';
import BatchUpload from './pages/BatchUpload';
import PaymentDetail from './pages/PaymentDetail';
import EntityList from './pages/EntityList';
import VendorList from './pages/VendorList';
import UserManagement from './pages/UserManagement';
import MyTasks from './pages/MyTasks';
import AdminSettings from './pages/AdminSettings';
import { useAuth } from './context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/new-requisition" element={
          <PrivateRoute>
            <RequisitionForm />
          </PrivateRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/my-tasks" element={
          <PrivateRoute>
            <MyTasks />
          </PrivateRoute>
        } />
        <Route path="/budgets" element={
          <PrivateRoute>
            <BudgetList />
          </PrivateRoute>
        } />
        <Route path="/budgets/new" element={
          <PrivateRoute>
            <BudgetForm />
          </PrivateRoute>
        } />
        <Route path="/budgets/:id" element={
          <PrivateRoute>
            <BudgetForm />
          </PrivateRoute>
        } />
        <Route path="/payments" element={
          <PrivateRoute>
            <PaymentList />
          </PrivateRoute>
        } />
        <Route path="/payments/new" element={
          <PrivateRoute>
            <PaymentForm />
          </PrivateRoute>
        } />
        <Route path="/payments/upload" element={
          <PrivateRoute>
            <BatchUpload />
          </PrivateRoute>
        } />
        <Route path="/payments/:id" element={
          <PrivateRoute>
            <PaymentDetail />
          </PrivateRoute>
        } />
        <Route path="/entities" element={
          <PrivateRoute>
            <EntityList />
          </PrivateRoute>
        } />
        <Route path="/vendors" element={
          <PrivateRoute>
            <VendorList />
          </PrivateRoute>
        } />
        <Route path="/validators" element={
          <PrivateRoute>
            <UserManagement />
          </PrivateRoute>
        } />
        <Route path="/users" element={
          <PrivateRoute>
            <UserManagement />
          </PrivateRoute>
        } />
        <Route path="/admin/settings" element={
          <PrivateRoute>
            <AdminSettings />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
