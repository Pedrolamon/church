import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';

//pages
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Families from './pages/Families';
import Groups from './pages/Groups';
import Ministries from './pages/Ministries';
import FamilyTree from './pages/FamilyTree';
import Finances from './pages/Finances';
import Communication from './pages/Communication';
import EventCheckIn from './pages/EventCheckIn';
import Volunteers from './pages/Volunteers';
import Inventory from './pages/Inventory';
import Login from './pages/Login';
import Register from './pages/Register';

//hooks 
import { useAuth } from './hooks/use-auth';



function App() {
  const { isAuth } = useAuth();

  return (
          <div className={`flex-1 ${isAuth ? 'lg:ml-64' : ''}`}>
            <main className="p-6">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/members"
                  element={
                    <ProtectedRoute>
                      <Members />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/families"
                  element={
                    <ProtectedRoute>
                      <Families />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/groups"
                  element={
                    <ProtectedRoute>
                      <Groups />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ministries"
                  element={
                    <ProtectedRoute>
                      <Ministries />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/finances"
                  element={
                    <ProtectedRoute requiredRole="lider">
                      <Finances />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/communication"
                  element={
                    <ProtectedRoute>
                      <Communication />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/volunteers"
                  element={
                    <ProtectedRoute>
                      <Volunteers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inventory"
                  element={
                    <ProtectedRoute requiredRole="lider">
                      <Inventory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkin"
                  element={
                    <ProtectedRoute>
                      <EventCheckIn />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/family-tree"
                  element={
                    <ProtectedRoute>
                      <FamilyTree />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
  );
}

export default App;
