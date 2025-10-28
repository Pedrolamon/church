import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface DashboardStats {
  totalMembers: number;
  totalFamilies: number;
  totalGroups: number;
  totalMinistries: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    totalFamilies: 0,
    totalGroups: 0,
    totalMinistries: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [membersRes, familiesRes, groupsRes, ministriesRes] = await Promise.all([
          api.get('/members'),
          api.get('/families'),
          api.get('/groups'),
          api.get('/ministries')
        ]);

        setStats({
          totalMembers: membersRes.data.length,
          totalFamilies: familiesRes.data.length,
          totalGroups: groupsRes.data.length,
          totalMinistries: ministriesRes.data.length
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total de Membros',
      value: stats.totalMembers,
      icon: '👥',
      color: 'bg-blue-500'
    },
    {
      title: 'Total de Famílias',
      value: stats.totalFamilies,
      icon: '🏠',
      color: 'bg-green-500'
    },
    {
      title: 'Total de Grupos',
      value: stats.totalGroups,
      icon: '👥',
      color: 'bg-purple-500'
    },
    {
      title: 'Total de Ministérios',
      value: stats.totalMinistries,
      icon: '⛪',
      color: 'bg-red-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Visão geral do sistema de gestão de igrejas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${card.color} rounded-full p-3`}>
                <span className="text-2xl">{card.icon}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Atividades Recentes</h2>
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span>Sistema inicializado com sucesso</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span>Banco de dados configurado</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <span>APIs REST implementadas</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Funcionalidades</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Cadastro completo de membros
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Organização por famílias
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Gestão de grupos e ministérios
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Árvore genealógica
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
