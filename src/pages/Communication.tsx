import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Message {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  status: string;
  sendToAll: boolean;
  scheduledAt?: string;
  sentAt?: string;
  sender: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  type: string;
  startDate: string;
  endDate: string;
  location?: string;
  maxAttendees?: number;
  organizer: {
    id: string;
    name: string;
  };
  ministry?: {
    id: string;
    name: string;
  };
  group?: {
    id: string;
    name: string;
  };
  attendees: Array<{
    id: string;
    status: string;
    member: {
      id: string;
      name: string;
    };
  }>;
}

const Communication: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'messages' | 'events' | 'calendar' | 'checkin'>('messages');
  const [messages, setMessages] = useState<Message[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [members, setMembers] = useState<Array<{ id: string; name: string }>>([]);
  const [ministries, setMinistries] = useState<Array<{ id: string; name: string }>>([]);
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([]);

  const [messageForm, setMessageForm] = useState({
    title: '',
    content: '',
    type: 'EMAIL',
    priority: 'NORMAL',
    sendToAll: false,
    memberIds: '',
    groupIds: '',
    ministryIds: '',
    scheduledAt: '',
    senderId: '1' // Default sender ID
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    type: 'SERVICE',
    startDate: '',
    endDate: '',
    location: '',
    maxAttendees: '',
    organizerId: '1', // Default organizer ID
    ministryId: '',
    groupId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [messagesRes, eventsRes, membersRes, ministriesRes, groupsRes] = await Promise.all([
        axios.get('http://localhost:3001/api/communication/messages'),
        axios.get('http://localhost:3001/api/communication/events'),
        axios.get('http://localhost:3001/api/members'),
        axios.get('http://localhost:3001/api/ministries'),
        axios.get('http://localhost:3001/api/groups')
      ]);

      setMessages(messagesRes.data);
      setEvents(eventsRes.data);
      setMembers(membersRes.data.map((m: any) => ({ id: m.id, name: m.name })));
      setMinistries(ministriesRes.data.map((m: any) => ({ id: m.id, name: m.name })));
      setGroups(groupsRes.data.map((g: any) => ({ id: g.id, name: g.name })));
    } catch (error) {
      console.error('Error fetching communication data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const messageData = {
        ...messageForm,
        memberIds: messageForm.sendToAll ? null : JSON.stringify(messageForm.memberIds.split(',').map(id => id.trim())),
        groupIds: messageForm.sendToAll ? null : JSON.stringify(messageForm.groupIds.split(',').map(id => id.trim())),
        ministryIds: messageForm.sendToAll ? null : JSON.stringify(messageForm.ministryIds.split(',').map(id => id.trim())),
        scheduledAt: messageForm.scheduledAt ? new Date(messageForm.scheduledAt) : null
      };

      await axios.post('http://localhost:3001/api/communication/messages', messageData);
      fetchData();
      setShowMessageForm(false);
      resetMessageForm();
    } catch (error) {
      console.error('Error creating message:', error);
    }
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const eventData = {
        ...eventForm,
        startDate: new Date(eventForm.startDate),
        endDate: new Date(eventForm.endDate),
        maxAttendees: eventForm.maxAttendees ? parseInt(eventForm.maxAttendees) : null
      };

      await axios.post('http://localhost:3001/api/communication/events', eventData);
      fetchData();
      setShowEventForm(false);
      resetEventForm();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const resetMessageForm = () => {
    setMessageForm({
      title: '',
      content: '',
      type: 'EMAIL',
      priority: 'NORMAL',
      sendToAll: false,
      memberIds: '',
      groupIds: '',
      ministryIds: '',
      scheduledAt: '',
      senderId: '1'
    });
  };

  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      type: 'SERVICE',
      startDate: '',
      endDate: '',
      location: '',
      maxAttendees: '',
      organizerId: '1',
      ministryId: '',
      groupId: ''
    });
  };

  const handleSendMessage = async (messageId: string) => {
    try {
      await axios.post(`http://localhost:3001/api/communication/messages/${messageId}/send`);
      fetchData();
    } catch (error) {
      console.error('Error sending message:', error);
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
          <h1 className="text-3xl font-bold text-gray-900">Comunicação</h1>
          <p className="mt-2 text-gray-600">Mensagens e calendário de eventos</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'messages'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Mensagens
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'events'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Eventos
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'calendar'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Calendário
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'messages' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Mensagens</h2>
            <button
              onClick={() => setShowMessageForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Nova Mensagem
            </button>
          </div>

          {showMessageForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Nova Mensagem</h3>
              <form onSubmit={handleMessageSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Título</label>
                  <input
                    type="text"
                    value={messageForm.title}
                    onChange={(e) => setMessageForm({ ...messageForm, title: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Conteúdo</label>
                  <textarea
                    value={messageForm.content}
                    onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                    rows={4}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <select
                    value={messageForm.type}
                    onChange={(e) => setMessageForm({ ...messageForm, type: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="NOTIFICATION">Notificação</option>
                    <option value="NEWSLETTER">Newsletter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prioridade</label>
                  <select
                    value={messageForm.priority}
                    onChange={(e) => setMessageForm({ ...messageForm, priority: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="LOW">Baixa</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={messageForm.sendToAll}
                      onChange={(e) => setMessageForm({ ...messageForm, sendToAll: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enviar para todos os membros</span>
                  </label>
                </div>
                {!messageForm.sendToAll && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Membros (IDs separados por vírgula)</label>
                      <input
                        type="text"
                        value={messageForm.memberIds}
                        onChange={(e) => setMessageForm({ ...messageForm, memberIds: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        placeholder="1,2,3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Grupos (IDs separados por vírgula)</label>
                      <input
                        type="text"
                        value={messageForm.groupIds}
                        onChange={(e) => setMessageForm({ ...messageForm, groupIds: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        placeholder="1,2,3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ministérios (IDs separados por vírgula)</label>
                      <input
                        type="text"
                        value={messageForm.ministryIds}
                        onChange={(e) => setMessageForm({ ...messageForm, ministryIds: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        placeholder="1,2,3"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Agendar para</label>
                  <input
                    type="datetime-local"
                    value={messageForm.scheduledAt}
                    onChange={(e) => setMessageForm({ ...messageForm, scheduledAt: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMessageForm(false);
                      resetMessageForm();
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
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remetente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {messages.map((message) => (
                  <tr key={message.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{message.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        message.type === 'EMAIL' ? 'bg-blue-100 text-blue-800' :
                        message.type === 'SMS' ? 'bg-green-100 text-green-800' :
                        message.type === 'NOTIFICATION' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {message.type === 'EMAIL' ? 'Email' :
                         message.type === 'SMS' ? 'SMS' :
                         message.type === 'NOTIFICATION' ? 'Notificação' : 'Newsletter'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        message.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                        message.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-800' :
                        message.status === 'SENT' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {message.status === 'DRAFT' ? 'Rascunho' :
                         message.status === 'SCHEDULED' ? 'Agendado' :
                         message.status === 'SENT' ? 'Enviado' : 'Falhou'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {message.sender.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {message.status === 'DRAFT' && (
                        <button
                          onClick={() => handleSendMessage(message.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Enviar
                        </button>
                      )}
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

      {activeTab === 'events' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Eventos</h2>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowEventForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Novo Evento
              </button>
              <button
                onClick={() => setActiveTab('checkin')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Check-in
              </button>
            </div>
          </div>

          {showEventForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Novo Evento</h3>
              <form onSubmit={handleEventSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Título</label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <select
                    value={eventForm.type}
                    onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="SERVICE">Culto</option>
                    <option value="MEETING">Reunião</option>
                    <option value="CONFERENCE">Conferência</option>
                    <option value="WORKSHOP">Oficina</option>
                    <option value="SOCIAL">Social</option>
                    <option value="BAPTISM">Batismo</option>
                    <option value="WEDDING">Casamento</option>
                    <option value="FUNERAL">Funeral</option>
                    <option value="OTHER">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Local</label>
                  <input
                    type="text"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data e Hora de Início</label>
                  <input
                    type="datetime-local"
                    value={eventForm.startDate}
                    onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data e Hora de Fim</label>
                  <input
                    type="datetime-local"
                    value={eventForm.endDate}
                    onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Máximo de Participantes</label>
                  <input
                    type="number"
                    value={eventForm.maxAttendees}
                    onChange={(e) => setEventForm({ ...eventForm, maxAttendees: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ministério</label>
                  <select
                    value={eventForm.ministryId}
                    onChange={(e) => setEventForm({ ...eventForm, ministryId: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="">Nenhum</option>
                    {ministries.map(ministry => (
                      <option key={ministry.id} value={ministry.id}>{ministry.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Grupo</label>
                  <select
                    value={eventForm.groupId}
                    onChange={(e) => setEventForm({ ...eventForm, groupId: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  >
                    <option value="">Nenhum</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEventForm(false);
                      resetEventForm();
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    event.type === 'SERVICE' ? 'bg-blue-100 text-blue-800' :
                    event.type === 'MEETING' ? 'bg-green-100 text-green-800' :
                    event.type === 'CONFERENCE' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.type === 'SERVICE' ? 'Culto' :
                     event.type === 'MEETING' ? 'Reunião' :
                     event.type === 'CONFERENCE' ? 'Conferência' :
                     event.type === 'WORKSHOP' ? 'Oficina' :
                     event.type === 'SOCIAL' ? 'Social' :
                     event.type === 'BAPTISM' ? 'Batismo' :
                     event.type === 'WEDDING' ? 'Casamento' :
                     event.type === 'FUNERAL' ? 'Funeral' : 'Outro'}
                  </span>
                </div>

                {event.description && (
                  <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                )}

                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="font-medium">📅</span>
                    <span className="ml-2">
                      {new Date(event.startDate).toLocaleDateString('pt-BR')} às {new Date(event.startDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {event.location && (
                    <div className="flex items-center">
                      <span className="font-medium">📍</span>
                      <span className="ml-2">{event.location}</span>
                    </div>
                  )}

                  <div className="flex items-center">
                    <span className="font-medium">👤</span>
                    <span className="ml-2">{event.organizer.name}</span>
                  </div>

                  <div className="flex items-center">
                    <span className="font-medium">👥</span>
                    <span className="ml-2">{event.attendees.length} participantes</span>
                  </div>
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

      {activeTab === 'calendar' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Calendário de Eventos</h2>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium mb-2">Calendário Interativo</h3>
              <p>Funcionalidade de calendário em desenvolvimento...</p>
              <p className="text-sm mt-2">Aqui será exibida uma visão de calendário com todos os eventos da igreja.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communication;
