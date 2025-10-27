import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  _count?: {
    items: number;
  };
}

interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category: InventoryCategory;
  currentStock: number;
  minStock: number;
  maxStock?: number;
  unit: string;
  location?: string;
  supplier?: string;
  unitCost?: number;
  totalValue?: number;
  movements: InventoryMovement[];
}

interface InventoryMovement {
  id: string;
  type: 'IN' | 'OUT' | 'ADJUST' | 'RETURN';
  quantity: number;
  reason?: string;
  notes?: string;
  createdAt: string;
  performed: {
    id: string;
    name: string;
  };
  item?: {
    id: string;
    name: string;
    category?: {
      id: string;
      name: string;
    };
  };
  event?: {
    id: string;
    title: string;
  };
  ministry?: {
    id: string;
    name: string;
  };
}

interface Member {
  id: string;
  name: string;
}

const Inventory: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'items' | 'categories' | 'movements'>('items');
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  const [itemForm, setItemForm] = useState({
    categoryId: '',
    name: '',
    description: '',
    minStock: 0,
    maxStock: 0,
    unit: 'unidade',
    location: '',
    supplier: '',
    unitCost: 0
  });

  const [movementForm, setMovementForm] = useState({
    type: 'IN' as 'IN' | 'OUT' | 'ADJUST' | 'RETURN',
    quantity: 0,
    reason: '',
    notes: '',
    eventId: '',
    ministryId: '',
    performedBy: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, itemsRes, movementsRes, membersRes] = await Promise.all([
        axios.get('http://localhost:3001/api/inventory/categories'),
        axios.get('http://localhost:3001/api/inventory/items'),
        axios.get('http://localhost:3001/api/inventory/movements'),
        axios.get('http://localhost:3001/api/members')
      ]);

      setCategories(categoriesRes.data);
      setItems(itemsRes.data);
      setMovements(movementsRes.data);
      setMembers(membersRes.data);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/inventory/categories', categoryForm);
      fetchData();
      setShowCategoryForm(false);
      resetCategoryForm();
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/inventory/items', itemForm);
      fetchData();
      setShowItemForm(false);
      resetItemForm();
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await axios.post(`http://localhost:3001/api/inventory/items/${selectedItem.id}/movements`, movementForm);
      fetchData();
      setShowMovementForm(false);
      resetMovementForm();
    } catch (error) {
      console.error('Error recording movement:', error);
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: ''
    });
  };

  const resetItemForm = () => {
    setItemForm({
      categoryId: '',
      name: '',
      description: '',
      minStock: 0,
      maxStock: 0,
      unit: 'unidade',
      location: '',
      supplier: '',
      unitCost: 0
    });
  };

  const resetMovementForm = () => {
    setMovementForm({
      type: 'IN',
      quantity: 0,
      reason: '',
      notes: '',
      eventId: '',
      ministryId: '',
      performedBy: ''
    });
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'IN': return 'bg-green-100 text-green-800';
      case 'OUT': return 'bg-red-100 text-red-800';
      case 'ADJUST': return 'bg-yellow-100 text-yellow-800';
      case 'RETURN': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMovementTypeText = (type: string) => {
    switch (type) {
      case 'IN': return 'Entrada';
      case 'OUT': return 'Saída';
      case 'ADJUST': return 'Ajuste';
      case 'RETURN': return 'Devolução';
      default: return type;
    }
  };

  const getStockStatusColor = (current: number, min: number) => {
    if (current <= min) return 'bg-red-100 text-red-800';
    if (current <= min * 1.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockStatusText = (current: number, min: number) => {
    if (current <= min) return 'Estoque Baixo';
    if (current <= min * 1.5) return 'Estoque Médio';
    return 'Estoque Adequado';
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
          <h1 className="text-3xl font-bold text-gray-900">Controle de Estoque</h1>
          <p className="mt-2 text-gray-600">Gerenciamento de materiais e equipamentos da igreja</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('items')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'items'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Itens
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'categories'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Categorias
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'movements'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Movimentações
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'items' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Itens de Estoque</h2>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCategoryForm(true)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Nova Categoria
              </button>
              <button
                onClick={() => setShowItemForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Novo Item
              </button>
            </div>
          </div>

          {showItemForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Novo Item de Estoque</h3>
              <form onSubmit={handleItemSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoria</label>
                  <select
                    value={itemForm.categoryId}
                    onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Nome do Item</label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <textarea
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estoque Mínimo</label>
                  <input
                    type="number"
                    value={itemForm.minStock}
                    onChange={(e) => setItemForm({ ...itemForm, minStock: parseInt(e.target.value) || 0 })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estoque Máximo</label>
                  <input
                    type="number"
                    value={itemForm.maxStock}
                    onChange={(e) => setItemForm({ ...itemForm, maxStock: parseInt(e.target.value) || 0 })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unidade</label>
                  <select
                    value={itemForm.unit}
                    onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="unidade">Unidade</option>
                    <option value="kg">Kg</option>
                    <option value="litro">Litro</option>
                    <option value="pacote">Pacote</option>
                    <option value="caixa">Caixa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Custo Unitário (R$)</label>
                  <input
                    type="number"
                    value={itemForm.unitCost}
                    onChange={(e) => setItemForm({ ...itemForm, unitCost: parseFloat(e.target.value) || 0 })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Localização</label>
                  <input
                    type="text"
                    value={itemForm.location}
                    onChange={(e) => setItemForm({ ...itemForm, location: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    placeholder="Ex: Sala de materiais, Depósito A"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Fornecedor</label>
                  <input
                    type="text"
                    value={itemForm.supplier}
                    onChange={(e) => setItemForm({ ...itemForm, supplier: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowItemForm(false);
                      resetItemForm();
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.category.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.currentStock} {item.unit}
                      </div>
                      <div className="text-xs text-gray-500">
                        Mín: {item.minStock} {item.unit}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockStatusColor(item.currentStock, item.minStock)}`}>
                        {getStockStatusText(item.currentStock, item.minStock)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.totalValue ? `R$ ${item.totalValue.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowMovementForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Movimentar
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Categorias</h2>
            <button
              onClick={() => setShowCategoryForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Nova Categoria
            </button>
          </div>

          {showCategoryForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Nova Categoria</h3>
              <form onSubmit={handleCategorySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Nome da Categoria</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryForm(false);
                      resetCategoryForm();
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {category._count?.items || 0} itens
                  </span>
                </div>

                {category.description && (
                  <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                )}

                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                    Ver Itens
                  </button>
                  <button className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700">
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'movements' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Movimentações de Estoque</h2>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responsável
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movements.map((movement) => (
                  <tr key={movement.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {movement.item?.name || 'Item não encontrado'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {movement.item?.category?.name || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMovementTypeColor(movement.type)}`}>
                        {getMovementTypeText(movement.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{movement.performed.name}</div>
                      {movement.reason && (
                        <div className="text-sm text-gray-500">{movement.reason}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(movement.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Movement Modal */}
      {showMovementForm && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Nova Movimentação</h3>
              <button
                onClick={() => setShowMovementForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <h4 className="font-medium">{selectedItem.name}</h4>
              <p className="text-sm text-gray-600">
                Estoque atual: {selectedItem.currentStock} {selectedItem.unit}
              </p>
            </div>

            <form onSubmit={handleMovementSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Movimentação</label>
                  <select
                    value={movementForm.type}
                    onChange={(e) => setMovementForm({ ...movementForm, type: e.target.value as any })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  >
                    <option value="IN">Entrada</option>
                    <option value="OUT">Saída</option>
                    <option value="ADJUST">Ajuste</option>
                    <option value="RETURN">Devolução</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantidade</label>
                  <input
                    type="number"
                    value={movementForm.quantity}
                    onChange={(e) => setMovementForm({ ...movementForm, quantity: parseInt(e.target.value) || 0 })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Motivo</label>
                <input
                  type="text"
                  value={movementForm.reason}
                  onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  placeholder="Ex: Evento da igreja, manutenção, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Observações</label>
                <textarea
                  value={movementForm.notes}
                  onChange={(e) => setMovementForm({ ...movementForm, notes: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Responsável</label>
                <select
                  value={movementForm.performedBy}
                  onChange={(e) => setMovementForm({ ...movementForm, performedBy: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  required
                >
                  <option value="">Selecione o responsável</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowMovementForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Registrar Movimentação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
