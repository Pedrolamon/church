import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Group {
  id: string;
  name: string;
  description?: string;
  type: string;
  leader?: {
    id: string;
    name: string;
  };
  members: Array<{
    id: string;
    member: {
      id: string;
      name: string;
    };
  }>;
}

interface GroupMeeting {
  id: string;
  title: string;
  description?: string;
  meetingDate: string;
  location?: string;
  agenda?: string;
  notes?: string;
  group: {
    id: string;
    name: string;
    leader?: {
      id: string;
      name: string;
    };
    members?: Array<{
      id: string;
      memberId: string;
      member: {
        id: string;
        name: string;
      };
    }>;
  };
  attendance: Array<{
    id: string;
    status: string;
    member: {
      id: string;
      name: string;
    };
  }>;
}

interface Member {
  id: string;
  name: string;
  email?: string;
}

const Groups: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'groups' | 'meetings'>('groups');
  const [groups, setGroups] = useState<Group[]>([]);
  const [meetings, setMeetings] = useState<GroupMeeting[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<GroupMeeting | null>(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    type: 'CELL',
    leaderId: ''
  });

  const [meetingForm, setMeetingForm] = useState({
    groupId: '',
    title: '',
    description: '',
    meetingDate: '',
    location: '',
    agenda: [] as string[],
    notes: ''
  });

  const [attendanceForm, setAttendanceForm] = useState({
    presentMemberIds: [] as string[],
    absentMemberIds: [] as string[],
    lateMemberIds: [] as string[]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [groupsRes, meetingsRes, membersRes] = await Promise.all([
        api.get('/api/groups'),
        api.get('/api/groups/meetings'),
        api.get('/api/members')
      ]);

      setGroups(groupsRes.data);
      setMeetings(meetingsRes.data);
      setMembers(membersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedGroup) {
        await api.put(`/api/groups/${selectedGroup.id}`, groupForm);
      } else {
        await api.post('/api/groups', groupForm);
      }
      fetchData();
      setShowGroupForm(false);
      resetGroupForm();
    } catch (error) {
      console.error('Error saving group:', error);
    }
  };

  const handleMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const meetingData = {
        ...meetingForm,
        agenda: meetingForm.agenda
      };

      if (selectedMeeting) {
        await api.put(`/api/groups/meetings/${selectedMeeting.id}`, meetingData);
      } else {
        await api.post(`/api/groups/${meetingForm.groupId}/meetings`, meetingData);
      }
      fetchData();
      setShowMeetingForm(false);
      resetMeetingForm();
    } catch (error) {
      console.error('Error saving meeting:', error);
    }
  };

  const handleQuickAttendance = async (meetingId: string) => {
    try {
      await api.post(`/api/groups/meetings/${meetingId}/quick-attendance`, attendanceForm);
      fetchData();
      setShowAttendanceModal(false);
      resetAttendanceForm();
    } catch (error) {
      console.error('Error recording attendance:', error);
    }
  };

  const resetGroupForm = () => {
    setGroupForm({
      name: '',
      description: '',
      type: 'CELL',
      leaderId: ''
    });
    setSelectedGroup(null);
  };

  const resetMeetingForm = () => {
    setMeetingForm({
      groupId: '',
      title: '',
      description: '',
      meetingDate: '',
      location: '',
      agenda: [],
      notes: ''
    });
    setSelectedMeeting(null);
  };

  const resetAttendanceForm = () => {
    setAttendanceForm({
      presentMemberIds: [],
      absentMemberIds: [],
      lateMemberIds: []
    });
  };

  const handleAgendaChange = (agendaItems: string[]) => {
    setMeetingForm({
      ...meetingForm,
      agenda: agendaItems
    });
  };

  const handleAttendanceChange = (memberId: string, status: 'present' | 'absent' | 'late') => {
    const newForm = { ...attendanceForm };

    // Remove from all arrays first
    newForm.presentMemberIds = newForm.presentMemberIds.filter(id => id !== memberId);
    newForm.absentMemberIds = newForm.absentMemberIds.filter(id => id !== memberId);
    newForm.lateMemberIds = newForm.lateMemberIds.filter(id => id !== memberId);

    // Add to the appropriate array
    if (status === 'present') {
      newForm.presentMemberIds.push(memberId);
    } else if (status === 'absent') {
      newForm.absentMemberIds.push(memberId);
    } else if (status === 'late') {
      newForm.lateMemberIds.push(memberId);
    }

    setAttendanceForm(newForm);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CELL': return 'bg-blue-100 text-blue-800';
      case 'SMALL_GROUP': return 'bg-green-100 text-green-800';
      case 'YOUTH': return 'bg-purple-100 text-purple-800';
      case 'CHILDREN': return 'bg-pink-100 text-pink-800';
      case 'ADULTS': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'CELL': return 'Célula';
      case 'SMALL_GROUP': return 'Pequeno Grupo';
      case 'YOUTH': return 'Juventude';
      case 'CHILDREN': return 'Infantil';
      case 'ADULTS': return 'Adultos';
      default: return type;
    }
  };

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800';
      case 'ABSENT': return 'bg-red-100 text-red-800';
      case 'LATE': return 'bg-yellow-100 text-yellow-800';
      case 'EXCUSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceText = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'Presente';
      case 'ABSENT': return 'Ausente';
      case 'LATE': return 'Atrasado';
      case 'EXCUSED': return 'Justificado';
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
          <h1 className="text-3xl font-bold text-gray-900">Grupos e Reuniões</h1>
          <p className="mt-2 text-gray-600">Células, pequenos grupos e controle de reuniões</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'groups'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Grupos
          </button>
          <button
            onClick={() => setActiveTab('meetings')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'meetings'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Reuniões
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'groups' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Grupos</h2>
            <button
              onClick={() => setShowGroupForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Novo Grupo
            </button>
          </div>

          {showGroupForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                {selectedGroup ? 'Editar Grupo' : 'Novo Grupo'}
              </h3>
              <form onSubmit={handleGroupSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    value={groupForm.name}
                    onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <textarea
                    value={groupForm.description}
                    onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <select
                    value={groupForm.type}
                    onChange={(e) => setGroupForm({ ...groupForm, type: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="CELL">Célula</option>
                    <option value="SMALL_GROUP">Pequeno Grupo</option>
                    <option value="YOUTH">Juventude</option>
                    <option value="CHILDREN">Infantil</option>
                    <option value="ADULTS">Adultos</option>
                    <option value="OTHER">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Líder</label>
                  <select
                    value={groupForm.leaderId}
                    onChange={(e) => setGroupForm({ ...groupForm, leaderId: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="">Selecione um líder</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGroupForm(false);
                      resetGroupForm();
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
            {groups.map((group) => (
              <div key={group.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(group.type)}`}>
                    {getTypeText(group.type)}
                  </span>
                </div>

                {group.description && (
                  <p className="text-gray-600 text-sm mb-4">{group.description}</p>
                )}

                {group.leader && (
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span className="font-medium">Líder:</span>
                    <span className="ml-2">{group.leader.name}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Membros ({group.members.length})</h4>
                  {group.members.slice(0, 3).map((member) => (
                    <div key={member.id} className="text-sm text-gray-600">
                      • {member.member.name}
                    </div>
                  ))}
                  {group.members.length > 3 && (
                    <div className="text-sm text-gray-500">
                      +{group.members.length - 3} mais...
                    </div>
                  )}
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => setShowMeetingForm(true)}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
                  >
                    Nova Reunião
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

      {activeTab === 'meetings' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Reuniões</h2>
            <button
              onClick={() => setShowMeetingForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Nova Reunião
            </button>
          </div>

          {showMeetingForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">
                {selectedMeeting ? 'Editar Reunião' : 'Nova Reunião'}
              </h3>
              <form onSubmit={handleMeetingSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Grupo</label>
                  <select
                    value={meetingForm.groupId}
                    onChange={(e) => setMeetingForm({ ...meetingForm, groupId: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  >
                    <option value="">Selecione um grupo</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data e Hora</label>
                  <input
                    type="datetime-local"
                    value={meetingForm.meetingDate}
                    onChange={(e) => setMeetingForm({ ...meetingForm, meetingDate: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Título</label>
                  <input
                    type="text"
                    value={meetingForm.title}
                    onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <textarea
                    value={meetingForm.description}
                    onChange={(e) => setMeetingForm({ ...meetingForm, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Local</label>
                  <input
                    type="text"
                    value={meetingForm.location}
                    onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Observações</label>
                  <textarea
                    value={meetingForm.notes}
                    onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMeetingForm(false);
                      resetMeetingForm();
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
                    Reunião
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grupo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Presença
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {meetings.map((meeting) => (
                  <tr key={meeting.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{meeting.title}</div>
                      {meeting.location && (
                        <div className="text-sm text-gray-500">{meeting.location}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{meeting.group.name}</div>
                      {meeting.group.leader && (
                        <div className="text-sm text-gray-500">{meeting.group.leader.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(meeting.meetingDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {meeting.attendance.length} presentes
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedMeeting(meeting);
                          setShowAttendanceModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Presença
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

      {/* Attendance Modal */}
      {showAttendanceModal && selectedMeeting && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Registro de Presença</h3>
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <h4 className="font-medium">{selectedMeeting.title}</h4>
              <p className="text-sm text-gray-600">{selectedMeeting.group.name}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {attendanceForm.presentMemberIds.length}
                </div>
                <div className="text-sm text-gray-600">Presentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {attendanceForm.absentMemberIds.length}
                </div>
                <div className="text-sm text-gray-600">Ausentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {attendanceForm.lateMemberIds.length}
                </div>
                <div className="text-sm text-gray-600">Atrasados</div>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedMeeting.group.members?.map((groupMember) => (
                <div key={groupMember.memberId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{groupMember.member.name}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAttendanceChange(groupMember.memberId, 'present')}
                      className={`px-3 py-1 text-xs rounded ${
                        attendanceForm.presentMemberIds.includes(groupMember.memberId)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                      }`}
                    >
                      Presente
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(groupMember.memberId, 'late')}
                      className={`px-3 py-1 text-xs rounded ${
                        attendanceForm.lateMemberIds.includes(groupMember.memberId)
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-yellow-100'
                      }`}
                    >
                      Atrasado
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(groupMember.memberId, 'absent')}
                      className={`px-3 py-1 text-xs rounded ${
                        attendanceForm.absentMemberIds.includes(groupMember.memberId)
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-red-100'
                      }`}
                    >
                      Ausente
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleQuickAttendance(selectedMeeting.id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Salvar Presença
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
