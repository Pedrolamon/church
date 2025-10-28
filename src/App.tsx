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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuth } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="flex">
          {/* Sidebar - Only show when authenticated */}
          {isAuthenticated && (
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
              <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
                <h1 className="text-xl font-bold text-white">Sistema Igrejas</h1>
              </div>
              <nav className="mt-8">
                <a href="/" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600">
                  <span className="mx-3">Dashboard</span>
                </a>
                <a href="/members" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600">
                  <span className="mx-3">Membros</span>
                </a>
                <a href="/families" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600">
                  <span className="mx-3">Famílias</span>
                </a>
                <a href="/groups" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600">
                  <span className="mx-3">Grupos</span>
                </a>
                <a href="/ministries" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600">
                  <span className="mx-3">Ministérios</span>
                </a>
                <a href="/finances" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600">
                  <span className="mx-3">Finanças</span>
                </a>
                <a href="/communication" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600">
                  <span className="mx-3">Comunicação</span>
                </a>
                <a href="/volunteers" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600">
                  <span className="mx-3">Voluntários</span>
                </a>
                <a href="/inventory" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600">
                  <span className="mx-3">Estoque</span>
                </a>
                <a href="/checkin" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600">
                  <span className="mx-3">Check-in Eventos</span>
                </a>
                <a href="/family-tree" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-blue-600">
                  <span className="mx-3">Árvore Genealógica</span>
                </a>
              </nav>
            </div>
          )}

          {/* Main content */}
          <div className={`flex-1 ${isAuthenticated ? 'lg:ml-64' : ''}`}>
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
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && isAuthenticated && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>
    </Router>
  );
}

export default App;
