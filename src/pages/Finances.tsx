import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Donation {
  id: string;
  amount: number;
  type: string;
  date: string;
  description?: string;
  member: {
    id: string;
    name: string;
  };
  ministry?: {
    id: string;
    name: string;
  };
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  ministry?: {
    id: string;
    name: string;
  };
}

interface FinancialSummary {
  totalDonations: number;
  totalExpenses: number;
  balance: number;
  donationsByType: Array<{
    type: string;
    _sum: { amount: number };
  }>;
  expensesByCategory: Array<{
    category: string;
    _sum: { amount: number };
  }>;
}

const Finances: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'donations' | 'expenses' | 'reports'>('donations');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [members, setMembers] = useState<Array<{ id: string; name: string }>>([]);
  const [ministries, setMinistries] = useState<Array<{ id: string; name: string }>>([]);

  const [donationForm, setDonationForm] = useState({
    memberId: '',
    amount: '',
    type: 'TITHE',
    date: new Date().toISOString().split('T')[0],
    description: '',
    ministryId: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    category: 'SUPPLIES',
    date: new Date().toISOString().split('T')[0],
    ministryId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [donationsRes, expensesRes, summaryRes, membersRes, ministriesRes] = await Promise.all([
        api.get('/api/finances/donations'),
        api.get('/api/finances/expenses'),
        api.get('/api/finances/reports/summary'),
        api.get('/api/members'),
        api.get('/api/ministries')
      ]);

      setDonations(donationsRes.data);
      setExpenses(expensesRes.data);
      setSummary(summaryRes.data);
      setMembers(membersRes.data.map((m: any) => ({ id: m.id, name: m.name })));
      setMinistries(ministriesRes.data.map((m: any) => ({ id: m.id, name: m.name })));
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDonationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/finances/donations', {
        ...donationForm,
        amount: parseFloat(donationForm.amount)
      });
      fetchData();
      setShowDonationForm(false);
      resetDonationForm();
    } catch (error) {
      console.error('Error creating donation:', error);
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/finances/expenses', {
        ...expenseForm,
        amount: parseFloat(expenseForm.amount)
      });
      fetchData();
      setShowExpenseForm(false);
      resetExpenseForm();
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  const resetDonationForm = () => {
    setDonationForm({
      memberId: '',
      amount: '',
      type: 'TITHE',
      date: new Date().toISOString().split('T')[0],
      description: '',
      ministryId: ''
    });
  };

  const resetExpenseForm = () => {
    setExpenseForm({
      description: '',
      amount: '',
      category: 'SUPPLIES',
      date: new Date().toISOString().split('T')[0],
      ministryId: ''
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão Financeira</h1>
          <p className="mt-2 text-gray-600">Controle de dízimos, ofertas e despesas</p>
        </div>
      </div>

      {/* Financial Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-green-500 rounded-full p-3">
                <span className="text-white text-xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Total de Doações</p>
                <p className="text-2xl font-bold text-green-900">{formatCurrency(summary.totalDonations)}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="bg-red-500 rounded-full p-3">
                <span className="text-white text-xl">💸</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-red-600">Total de Despesas</p>
                <p className="text-2xl font-bold text-red-900">{formatCurrency(summary.totalExpenses)}</p>
              </div>
            </div>
          </div>

          <div className={`border rounded-lg p-6 ${summary.balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
            <div className="flex items-center">
              <div className={`${summary.balance >= 0 ? 'bg-blue-500' : 'bg-orange-500'} rounded-full p-3`}>
                <span className="text-white text-xl">⚖️</span>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${summary.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Saldo</p>
                <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                  {formatCurrency(summary.balance)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('donations')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'donations'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Doações
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'expenses'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Despesas
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'reports'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Relatórios
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'donations' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Doações</h2>
            <button
              onClick={() => setShowDonationForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Nova Doação
            </button>
          </div>

          {showDonationForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Nova Doação</h3>
              <form onSubmit={handleDonationSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Membro</label>
                  <select
                    value={donationForm.memberId}
                    onChange={(e) => setDonationForm({ ...donationForm, memberId: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  >
                    <option value="">Selecione um membro</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Valor</label>
                  <input
                    type="number"
                    step="0.01"
                    value={donationForm.amount}
                    onChange={(e) => setDonationForm({ ...donationForm, amount: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <select
                    value={donationForm.type}
                    onChange={(e) => setDonationForm({ ...donationForm, type: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="TITHE">Dízimo</option>
                    <option value="OFFERING">Oferta</option>
                    <option value="SPECIAL_OFFERING">Oferta Especial</option>
                    <option value="BUILDING_FUND">Fundo de Construção</option>
                    <option value="MISSIONS">Missões</option>
                    <option value="OTHER">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data</label>
                  <input
                    type="date"
                    value={donationForm.date}
                    onChange={(e) => setDonationForm({ ...donationForm, date: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <input
                    type="text"
                    value={donationForm.description}
                    onChange={(e) => setDonationForm({ ...donationForm, description: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDonationForm(false);
                      resetDonationForm();
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Membro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ministério
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donations.map((donation) => (
                  <tr key={donation.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{donation.member.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {donation.type === 'TITHE' ? 'Dízimo' :
                         donation.type === 'OFFERING' ? 'Oferta' :
                         donation.type === 'SPECIAL_OFFERING' ? 'Oferta Especial' :
                         donation.type === 'BUILDING_FUND' ? 'Fundo Construção' :
                         donation.type === 'MISSIONS' ? 'Missões' : 'Outro'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(donation.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(donation.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {donation.ministry?.name || 'Geral'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Despesas</h2>
            <button
              onClick={() => setShowExpenseForm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Nova Despesa
            </button>
          </div>

          {showExpenseForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Nova Despesa</h3>
              <form onSubmit={handleExpenseSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <input
                    type="text"
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Valor</label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoria</label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="STAFF_SALARY">Salário Funcionários</option>
                    <option value="UTILITIES">Utilidades</option>
                    <option value="MAINTENANCE">Manutenção</option>
                    <option value="SUPPLIES">Suprimentos</option>
                    <option value="EVENTS">Eventos</option>
                    <option value="MISSIONS">Missões</option>
                    <option value="BUILDING">Construção</option>
                    <option value="INSURANCE">Seguro</option>
                    <option value="OTHER">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ministério</label>
                  <select
                    value={expenseForm.ministryId}
                    onChange={(e) => setExpenseForm({ ...expenseForm, ministryId: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="">Geral</option>
                    {ministries.map(ministry => (
                      <option key={ministry.id} value={ministry.id}>{ministry.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowExpenseForm(false);
                      resetExpenseForm();
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ministério
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        {expense.category === 'STAFF_SALARY' ? 'Salário' :
                         expense.category === 'UTILITIES' ? 'Utilidades' :
                         expense.category === 'MAINTENANCE' ? 'Manutenção' :
                         expense.category === 'SUPPLIES' ? 'Suprimentos' :
                         expense.category === 'EVENTS' ? 'Eventos' :
                         expense.category === 'MISSIONS' ? 'Missões' :
                         expense.category === 'BUILDING' ? 'Construção' :
                         expense.category === 'INSURANCE' ? 'Seguro' : 'Outro'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.ministry?.name || 'Geral'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Relatórios Financeiros</h2>

          {summary && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Doações por Tipo</h3>
                <div className="space-y-3">
                  {summary.donationsByType.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {item.type === 'TITHE' ? 'Dízimos' :
                         item.type === 'OFFERING' ? 'Ofertas' :
                         item.type === 'SPECIAL_OFFERING' ? 'Ofertas Especiais' :
                         item.type === 'BUILDING_FUND' ? 'Fundo Construção' :
                         item.type === 'MISSIONS' ? 'Missões' : 'Outros'}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(item._sum.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Despesas por Categoria</h3>
                <div className="space-y-3">
                  {summary.expensesByCategory.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {item.category === 'STAFF_SALARY' ? 'Salários' :
                         item.category === 'UTILITIES' ? 'Utilidades' :
                         item.category === 'MAINTENANCE' ? 'Manutenção' :
                         item.category === 'SUPPLIES' ? 'Suprimentos' :
                         item.category === 'EVENTS' ? 'Eventos' :
                         item.category === 'MISSIONS' ? 'Missões' :
                         item.category === 'BUILDING' ? 'Construção' :
                         item.category === 'INSURANCE' ? 'Seguros' : 'Outros'}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(item._sum.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Finances;
