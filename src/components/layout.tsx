import { useState } from 'react';

//pages
import Navbar from './Navbar';



export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
      <div className="min-h-screen bg-gray-50">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="flex">
         (
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
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )
      </div>
      </div>
  );
}

