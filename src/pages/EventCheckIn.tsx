import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Event {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location?: string;
  maxAttendees?: number;
}

interface CheckIn {
  id: string;
  memberId?: string;
  visitorName?: string;
  checkInTime: string;
  checkOutTime?: string;
  checkedInBy: string;
  isVisitor: boolean;
  member?: {
    id: string;
    name: string;
  };
}

interface Member {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

const EventCheckIn: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showVisitorForm, setShowVisitorForm] = useState(false);

  const [visitorForm, setVisitorForm] = useState({
    name: '',
    notes: ''
  });

  useEffect(() => {
    fetchEvents();
    fetchMembers();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchCheckIns(selectedEvent.id);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/communication/events');
      // Filter events that are happening today or in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingEvents = response.data.filter((event: Event) => {
        const eventDate = new Date(event.startDate);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
      });

      setEvents(upcomingEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/members');
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckIns = async (eventId: string) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/communication/events/${eventId}/checkins`);
      setCheckIns(response.data);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
    }
  };

  const handleMemberCheckIn = async (memberId: string) => {
    if (!selectedEvent) return;

    try {
      await axios.post(`http://localhost:3001/api/communication/events/${selectedEvent.id}/checkin`, {
        memberId,
        checkedInBy: '1', // Current user ID
        notes: ''
      });
      fetchCheckIns(selectedEvent.id);
    } catch (error) {
      console.error('Error checking in member:', error);
    }
  };

  const handleVisitorCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    try {
      await axios.post(`http://localhost:3001/api/communication/events/${selectedEvent.id}/checkin`, {
        visitorName: visitorForm.name,
        checkedInBy: '1', // Current user ID
        notes: visitorForm.notes
      });
      fetchCheckIns(selectedEvent.id);
      setShowVisitorForm(false);
      setVisitorForm({ name: '', notes: '' });
    } catch (error) {
      console.error('Error checking in visitor:', error);
    }
  };

  const handleCheckOut = async (checkInId: string) => {
    if (!selectedEvent) return;

    try {
      await axios.put(`http://localhost:3001/api/communication/events/${selectedEvent.id}/checkin/${checkInId}/checkout`);
      fetchCheckIns(selectedEvent.id);
    } catch (error) {
      console.error('Error checking out:', error);
    }
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentAttendees = checkIns.filter(checkIn => !checkIn.checkOutTime).length;
  const totalCheckIns = checkIns.length;

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
          <h1 className="text-3xl font-bold text-gray-900">Check-in de Eventos</h1>
          <p className="mt-2 text-gray-600">Registre a presença de membros e visitantes</p>
        </div>
      </div>

      {/* Event Selection */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Selecionar Evento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedEvent?.id === event.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-medium text-gray-900">{event.title}</h3>
              <div className="text-sm text-gray-500 mt-2">
                <div>📅 {new Date(event.startDate).toLocaleDateString('pt-BR')}</div>
                <div>🕐 {new Date(event.startDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                {event.location && <div>📍 {event.location}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedEvent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Check-in Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Check-in: {selectedEvent.title}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowVisitorForm(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                  >
                    Visitante
                  </button>
                </div>
              </div>

              {/* Visitor Check-in Form */}
              {showVisitorForm && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium mb-4">Check-in de Visitante</h3>
                  <form onSubmit={handleVisitorCheckIn} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nome</label>
                      <input
                        type="text"
                        value={visitorForm.name}
                        onChange={(e) => setVisitorForm({ ...visitorForm, name: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Observações</label>
                      <textarea
                        value={visitorForm.notes}
                        onChange={(e) => setVisitorForm({ ...visitorForm, notes: e.target.value })}
                        rows={2}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowVisitorForm(false);
                          setVisitorForm({ name: '', notes: '' });
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Confirmar Check-in
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Member Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Membro
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite o nome ou email..."
                  className="w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>

              {/* Members List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredMembers.map((member) => {
                  const isCheckedIn = checkIns.some(checkIn =>
                    checkIn.memberId === member.id && !checkIn.checkOutTime
                  );

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isCheckedIn ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✅ Presente
                          </span>
                        ) : (
                          <button
                            onClick={() => handleMemberCheckIn(member.id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Check-in
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Attendance Summary */}
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Estatísticas</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Presentes agora:</span>
                  <span className="font-semibold text-green-600">{currentAttendees}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total de check-ins:</span>
                  <span className="font-semibold">{totalCheckIns}</span>
                </div>
                {selectedEvent.maxAttendees && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Capacidade:</span>
                    <span className="font-semibold">{selectedEvent.maxAttendees}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Current Attendees */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Presentes Agora</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {checkIns
                  .filter(checkIn => !checkIn.checkOutTime)
                  .map((checkIn) => (
                    <div key={checkIn.id} className="flex items-center justify-between p-2 border-b">
                      <div>
                        <div className="font-medium text-sm">
                          {checkIn.isVisitor ? checkIn.visitorName : checkIn.member?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(checkIn.checkInTime).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <button
                        onClick={() => handleCheckOut(checkIn.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Check-out
                      </button>
                    </div>
                  ))}
                {checkIns.filter(checkIn => !checkIn.checkOutTime).length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Nenhum participante presente no momento
                  </p>
                )}
              </div>
            </div>

            {/* Recent Check-ins */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Check-ins Recentes</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {checkIns.slice(0, 10).map((checkIn) => (
                  <div key={checkIn.id} className="flex items-center justify-between p-2 border-b">
                    <div>
                      <div className="font-medium text-sm">
                        {checkIn.isVisitor ? checkIn.visitorName : checkIn.member?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(checkIn.checkInTime).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${
                      checkIn.checkOutTime
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {checkIn.checkOutTime ? 'Finalizado' : 'Ativo'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCheckIn;
