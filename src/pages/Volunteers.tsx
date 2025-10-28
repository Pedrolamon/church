import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface ServiceArea {
  id: string;
  name: string;
  description?: string;
  ministry?: {
    id: string;
    name: string;
  };
  volunteers: Array<{
    id: string;
    member: {
      id: string;
      name: string;
    };
  }>;
}

interface Volunteer {
  id: string;
  member: {
    id: string;
    name: string;
    email?: string;
  };
  serviceArea: {
    id: string;
    name: string;
    ministry?: {
      id: string;
      name: string;
    };
  };
  availability?: string;
  skills?: string;
  experience?: string;
  status: string;
  assignments: Array<{
    id: string;
    task: string;
    date: string;
    status: string;
    event?: {
      id: string;
      title: string;
    };
  }>;
}

interface Member {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

const Volunteers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'areas' | 'volunteers' | 'assignments'>('areas');
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAreaForm, setShowAreaForm] = useState(false);
  const [showVolunteerForm, setShowVolunteerForm] = useState(false);
  const [selectedArea, setSelectedArea] = useState<ServiceArea | null>(null);

  const [areaForm, setAreaForm] = useState({
    name: '',
    description: '',
    ministryId: ''
  });

  const [volunteerForm, setVolunteerForm] = useState({
    memberId: '',
    serviceAreaId: '',
    availability: [] as string[],
    skills: [] as string[],
    experience: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [areasRes, volunteersRes, membersRes] = await Promise.all([
        api.get('/api/volunteers/service-areas'),
        api.get('/api/volunteers'),
        api.get('/api/members')
      ]);

      setServiceAreas(areasRes.data);
      setVolunteers(volunteersRes.data);
      setMembers(membersRes.data);
    } catch (error) {
      console.error('Error fetching volunteer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/volunteers/service-areas', areaForm);
      fetchData();
      setShowAreaForm(false);
      resetAreaForm();
    } catch (error) {
      console.error('Error creating service area:', error);
    }
  };

  const handleVolunteerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const volunteerData = {
        ...volunteerForm,
        availability: volunteerForm.availability,
        skills: volunteerForm.skills
      };

      await api.post('/api/volunteers', volunteerData);
      fetchData();
      setShowVolunteerForm(false);
      resetVolunteerForm();
    } catch (error) {
      console.error('Error registering volunteer:', error);
    }
  };

  const resetAreaForm = () => {
    setAreaForm({
      name: '',
      description: '',
      ministryId: ''
    });
  };

  const resetVolunteerForm = () => {
    setVolunteerForm({
      memberId: '',
      serviceAreaId: '',
      availability: [],
      skills: [],
      experience: ''
    });
  };

  const handleAvailabilityChange = (day: string, checked: boolean) => {
    if (checked) {
      setVolunteerForm({
        ...volunteerForm,
        availability: [...volunteerForm.availability, day]
      });
    } else {
      setVolunteerForm({
        ...volunteerForm,
        availability: volunteerForm.availability.filter(d => d !== day)
      });
    }
  };

  const handleSkillChange = (skill: string, checked: boolean) => {
    if (checked) {
      setVolunteerForm({
        ...volunteerForm,
        skills: [...volunteerForm.skills, skill]
      });
    } else {
      setVolunteerForm({
        ...volunteerForm,
        skills: volunteerForm.skills.filter(s => s !== skill)
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'ON_LEAVE': return 'bg-yellow-100 text-yellow-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Ativo';
      case 'INACTIVE': return 'Inativo';
      case 'ON_LEAVE': return 'De Licença';
      case 'SUSPENDED': return 'Suspenso';
      default: return status;
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Voluntários</h1>
          <p className="mt-2 text-gray-600">Áreas de serviço e coordenação de voluntários</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('areas')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'areas'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Áreas de Serviço
          </button>
          <button
            onClick={() => setActiveTab('volunteers')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'volunteers'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Voluntários
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'assignments'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Atribuições
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'areas' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Áreas de Serviço</h2>
            <button
              onClick={() => setShowAreaForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Nova Área
            </button>
          </div>

          {showAreaForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Nova Área de Serviço</h3>
              <form onSubmit={handleAreaSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Nome da Área</label>
                  <input
                    type="text"
                    value={areaForm.name}
                    onChange={(e) => setAreaForm({ ...areaForm, name: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <textarea
                    value={areaForm.description}
                    onChange={(e) => setAreaForm({ ...areaForm, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAreaForm(false);
                      resetAreaForm();
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
            {serviceAreas.map((area) => (
              <div key={area.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{area.name}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {area.volunteers.length} voluntários
                  </span>
                </div>

                {area.description && (
                  <p className="text-gray-600 text-sm mb-4">{area.description}</p>
                )}

                {area.ministry && (
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span className="font-medium">Ministério:</span>
                    <span className="ml-2">{area.ministry.name}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Voluntários:</h4>
                  {area.volunteers.slice(0, 3).map((volunteer) => (
                    <div key={volunteer.id} className="text-sm text-gray-600">
                      • {volunteer.member.name}
                    </div>
                  ))}
                  {area.volunteers.length > 3 && (
                    <div className="text-sm text-gray-500">
                      +{area.volunteers.length - 3} mais...
                    </div>
                  )}
                </div>

                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700">
                    Ver Detalhes
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

      {activeTab === 'volunteers' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Voluntários</h2>
            <button
              onClick={() => setShowVolunteerForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Novo Voluntário
            </button>
          </div>

          {showVolunteerForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Cadastrar Voluntário</h3>
              <form onSubmit={handleVolunteerSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Membro</label>
                  <select
                    value={volunteerForm.memberId}
                    onChange={(e) => setVolunteerForm({ ...volunteerForm, memberId: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700">Área de Serviço</label>
                  <select
                    value={volunteerForm.serviceAreaId}
                    onChange={(e) => setVolunteerForm({ ...volunteerForm, serviceAreaId: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  >
                    <option value="">Selecione uma área</option>
                    {serviceAreas.map(area => (
                      <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Disponibilidade</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo', 'Feriados'].map((day) => (
                      <label key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={volunteerForm.availability.includes(day)}
                          onChange={(e) => handleAvailabilityChange(day, e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="ml-2 text-sm">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Habilidades/Competências</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['Música', 'Infantil', 'Liderança', 'Comunicação', 'Técnico', 'Culinária', 'Limpeza', 'Organização'].map((skill) => (
                      <label key={skill} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={volunteerForm.skills.includes(skill)}
                          onChange={(e) => handleSkillChange(skill, e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="ml-2 text-sm">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Experiência Anterior</label>
                  <textarea
                    value={volunteerForm.experience}
                    onChange={(e) => setVolunteerForm({ ...volunteerForm, experience: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    placeholder="Descreva experiências anteriores em trabalho voluntário..."
                  />
                </div>

                <div className="md:col-span-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVolunteerForm(false);
                      resetVolunteerForm();
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Cadastrar
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
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Área
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Atribuições
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {volunteers.map((volunteer) => (
                  <tr key={volunteer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{volunteer.member.name}</div>
                      <div className="text-sm text-gray-500">{volunteer.member.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{volunteer.serviceArea.name}</div>
                      {volunteer.serviceArea.ministry && (
                        <div className="text-sm text-gray-500">{volunteer.serviceArea.ministry.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(volunteer.status)}`}>
                        {getStatusText(volunteer.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {volunteer.assignments.length} atribuições
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Ver Perfil
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

      {activeTab === 'assignments' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Atribuições de Voluntários</h2>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium mb-2">Sistema de Atribuições</h3>
              <p>Funcionalidade para atribuir tarefas e acompanhar o trabalho dos voluntários.</p>
              <p className="text-sm mt-2">Aqui será possível criar e gerenciar atribuições de trabalho para os voluntários.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Volunteers;
