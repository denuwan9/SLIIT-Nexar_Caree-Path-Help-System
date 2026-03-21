import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Users, CheckCircle2, Bot, ChevronRight,
  Search, Plus, Trash2, Briefcase, BarChart3, Settings2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  getEvents, getMyBookings, getEventStats, createCareerDayEvent,
  createNormalDayEvent, publishEvent, cancelEvent, bookSlot, cancelBooking
} from '../services/interviewService';
import type { IInterviewEvent, IMyBooking, IEventStats, ICompany, ISlot } from '../services/interviewService';

export default function InterviewSchedulingPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(isAdmin ? 'dashboard' : 'browse');

  return (
    <div className="min-h-screen bg-slate-50 font-main">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-20 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-cobalt-sliit uppercase tracking-[0.3em]">Module Active</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-success animate-pulse" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
              Interview <span className="text-cobalt-sliit">Command</span>
            </h1>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl overflow-x-auto hide-scrollbar">
            {!isAdmin ? (
              <>
                <TabButton active={activeTab === 'browse'} onClick={() => setActiveTab('browse')} icon={Search} label="Browse Events" />
                <TabButton active={activeTab === 'my-bookings'} onClick={() => setActiveTab('my-bookings')} icon={Calendar} label="My Bookings" />
              </>
            ) : (
              <>
                <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={BarChart3} label="Dashboard" />
                <TabButton active={activeTab === 'create-career'} onClick={() => setActiveTab('create-career')} icon={Plus} label="Career Day" />
                <TabButton active={activeTab === 'create-normal'} onClick={() => setActiveTab('create-normal')} icon={Plus} label="Urgent Hire" />
                <TabButton active={activeTab === 'manage'} onClick={() => setActiveTab('manage')} icon={Settings2} label="Manage Events" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          {!isAdmin && activeTab === 'browse' && <StudentBrowseEvents key="student-browse" />}
          {!isAdmin && activeTab === 'my-bookings' && <StudentMyBookings key="student-bookings" />}

          {isAdmin && activeTab === 'dashboard' && <AdminDashboard key="admin-dashboard" />}
          {isAdmin && activeTab === 'create-career' && <AdminCreateCareerDay key="admin-create-career" onCreated={() => setActiveTab('manage')} />}
          {isAdmin && activeTab === 'create-normal' && <AdminCreateNormalDay key="admin-create-normal" onCreated={() => setActiveTab('manage')} />}
          {isAdmin && activeTab === 'manage' && <AdminManageEvents key="admin-manage" />}
        </AnimatePresence>
      </main>

      {/* Floating Action Button for Mock Interview */}
      {!isAdmin && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/mock-interview')}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-4 shadow-xl shadow-indigo-500/20 flex items-center gap-3 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all z-50 group"
        >
          <div className="bg-white/20 p-2 rounded-xl group-hover:bg-white/30 transition-colors">
            <Bot size={24} className="text-white" />
          </div>
          <div className="text-left pr-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100 opacity-80 mb-0.5">Next Step</p>
            <p className="text-sm font-bold leading-none flex items-center gap-1">
              Mock Interview <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </p>
          </div>
        </motion.button>
      )}
    </div>
  );
}

const TabButton = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap
      ${active ? 'bg-white text-cobalt-sliit shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
  >
    <Icon size={14} className={active ? "text-cobalt-sliit" : ""} />
    {label}
  </button>
);


// ─────────────────────────────────────────────────────────────────────────────
// STUDENT COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function StudentBrowseEvents() {
  const [events, setEvents] = useState<IInterviewEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<IInterviewEvent | null>(null);

  // Booking wizard state
  const [bookingCompany, setBookingCompany] = useState<ICompany | null>(null);
  const [bookingSlot, setBookingSlot] = useState<ISlot | null>(null);
  const [bookingProgress, setBookingProgress] = useState(false);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedEvent || !bookingSlot) return;
    setBookingProgress(true);
    try {
      await bookSlot(selectedEvent._id, bookingSlot._id, bookingCompany?._id);
      toast.success('Interview slot booked successfully!');
      setSelectedEvent(null);
      setBookingCompany(null);
      setBookingSlot(null);
      fetchEvents(); // refresh availability
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to book slot');
    } finally {
      setBookingProgress(false);
    }
  };

  if (loading) return <div className="text-center p-12 text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Scanning Nexus...</div>;

  if (selectedEvent) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
        <button onClick={() => { setSelectedEvent(null); setBookingCompany(null); setBookingSlot(null); }} className="text-xs font-bold text-slate-500 hover:text-cobalt-sliit uppercase flex items-center gap-1 transition-colors">
          &larr; Back to Events
        </button>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
             <div className="flex items-start justify-between mb-6">
               <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-cobalt-sliit/10 text-cobalt-sliit text-[10px] font-black uppercase rounded block w-fit tracking-wider">
                      {selectedEvent.eventType.replace('-', ' ')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200 px-2 py-1 rounded">
                      {new Date(selectedEvent.eventDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{selectedEvent.title}</h2>
                  <p className="text-slate-500 text-sm mt-2">{selectedEvent.description || 'No description provided.'}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Max Bookings</p>
                  <p className="text-3xl font-black text-slate-900 leading-none">{selectedEvent.maxBookingsPerStudent}</p>
               </div>
             </div>

             {selectedEvent.eventType === 'career-day' && !bookingCompany ? (
               <div className="mt-8">
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-4">Step 1: Select a Company</h3>
                 <div className="grid md:grid-cols-2 gap-4">
                   {selectedEvent.companies?.map(comp => (
                     <div key={comp._id} onClick={() => setBookingCompany(comp)} className="p-4 border-2 border-slate-100 rounded-xl cursor-pointer hover:border-cobalt-sliit transition-colors hover:shadow-md group/card">
                       <div className="flex justify-between items-start mb-2">
                         <h4 className="font-black text-slate-800 uppercase">{comp.name}</h4>
                         <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded block">
                           {comp.slots.filter(s => s.status === 'available').length} SLOTS
                         </span>
                       </div>
                       <p className="text-xs text-slate-500 line-clamp-2">{comp.description}</p>
                     </div>
                   ))}
                 </div>
               </div>
             ) : (
               <div className="mt-8">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                      {selectedEvent.eventType === 'career-day' ? `Step 2: Select Time for ${bookingCompany?.name}` : 'Select Time Slot'}
                    </h3>
                    {selectedEvent.eventType === 'career-day' && (
                      <button onClick={() => { setBookingCompany(null); setBookingSlot(null); }} className="text-xs text-slate-500 hover:text-rose-500 underline font-semibold">Change Company</button>
                    )}
                 </div>

                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                   {(selectedEvent.eventType === 'career-day' ? bookingCompany?.slots : selectedEvent.slots)?.map(slot => {
                     const isAvailable = slot.status === 'available';
                     const isSelected = bookingSlot?._id === slot._id;
                     return (
                       <button
                         key={slot._id}
                         disabled={!isAvailable}
                         onClick={() => setBookingSlot(slot)}
                         className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1
                           ${!isAvailable ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed' :
                             isSelected ? 'border-cobalt-sliit bg-cobalt-sliit/5 text-cobalt-sliit scale-105 shadow-md' :
                             'border-slate-200 hover:border-cobalt-sliit hover:text-cobalt-sliit bg-white'}`}
                       >
                         <Clock size={16} className={isSelected ? 'text-cobalt-sliit' : 'text-slate-400'} />
                         <span className="text-xs font-bold">{new Date(slot.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                         <span className={`text-[9px] uppercase font-black ${isAvailable ? 'text-emerald-500' : 'text-slate-400'}`}>
                           {slot.status}
                         </span>
                       </button>
                     )
                   })}
                 </div>

                 {bookingSlot && (
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                     <div>
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Confirm Selection</p>
                       <p className="font-black text-slate-900 text-lg">
                         {new Date(bookingSlot.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {new Date(bookingSlot.endTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                       </p>
                       {bookingCompany && <p className="text-sm font-semibold text-cobalt-sliit mt-1">with {bookingCompany.name}</p>}
                     </div>
                     <button
                       onClick={handleBook}
                       disabled={bookingProgress}
                       className="px-8 py-3 bg-cobalt-sliit text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 w-full md:w-auto"
                     >
                       {bookingProgress ? 'Processing...' : 'Confirm Booking'}
                     </button>
                   </motion.div>
                 )}
               </div>
             )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {events.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-200">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">No Events Currently</h3>
          <p className="text-slate-500 text-sm mt-2">Check back later for upcoming career fairs or interview sessions.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div key={ev._id} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col hover:border-cobalt-sliit hover:shadow-xl transition-all group">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded ${ev.eventType === 'career-day' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {ev.eventType.replace('-', ' ')}
                </span>
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Calendar size={12} /> {new Date(ev.eventDate).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 leading-tight mb-2 group-hover:text-cobalt-sliit transition-colors line-clamp-2">{ev.title}</h3>
              <p className="text-slate-500 text-xs line-clamp-2 mb-4 flex-grow">{ev.description || 'No description available.'}</p>
              
              <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="bg-slate-50 p-2 rounded-lg text-center border border-slate-100">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Time</p>
                  <p className="text-xs font-black text-slate-800">{ev.startTime} - {ev.endTime}</p>
                </div>
                <div className="bg-emerald-50 p-2 rounded-lg text-center border border-emerald-100">
                  <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest mb-1">Available</p>
                  <p className="text-xs font-black text-emerald-700">{ev.availableSlots} Slots</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(ev)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase hover:bg-cobalt-sliit transition-colors tracking-wider"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}


function StudentMyBookings() {
  const [bookings, setBookings] = useState<IMyBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch (e) {
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (eventId: string, slotId: string, companyId: string | null) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(eventId, slotId, companyId || undefined);
      toast.success('Booking cancelled.');
      fetchBookings();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to cancel');
    }
  };

  if (loading) return <div className="text-center p-12 text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Scanning Nexus...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {bookings.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">No Bookings Yet</h3>
          <p className="text-slate-500 text-sm mt-2">Browse events and book your interview slots to see them here.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((b) => (
            <div key={b.slotId} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cobalt-sliit/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-wider rounded flex items-center gap-1">
                  <CheckCircle2 size={10} /> {b.slotStatus}
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 border border-slate-100 rounded uppercase tracking-wider">
                  {new Date(b.eventDate).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="text-sm font-black text-slate-900 mb-1 leading-tight">{b.eventTitle}</h3>
              <p className="text-xs text-slate-500 mb-4">{b.companyName}</p>
              
              <div className="mt-auto p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock size={16} className="text-cobalt-sliit" />
                  <span className="text-sm font-black">
                    {new Date(b.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - {new Date(b.endTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleCancel(b.eventId, b.slotId, b.companyId)}
                className="w-full py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-rose-500 hover:text-white transition-colors"
              >
                Cancel Booking
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function AdminDashboard() {
  const [stats, setStats] = useState<IEventStats | null>(null);

  useEffect(() => {
    getEventStats().then(setStats).catch(() => toast.error('Failed to load stats'));
  }, []);

  if (!stats) return <div className="text-center p-12 text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Events" value={stats.totalEvents} icon={Calendar} color="bg-blue-50 text-blue-600" />
          <StatCard title="Published" value={stats.publishedEvents} icon={CheckCircle2} color="bg-emerald-50 text-emerald-600" />
          <StatCard title="Total Slots" value={stats.totalSlots} icon={Clock} color="bg-amber-50 text-amber-600" />
          <StatCard title="Bookings" value={stats.totalBookings} icon={Users} color="bg-purple-50 text-purple-600" />
       </div>
       <div className="bg-white p-8 rounded-2xl border border-slate-200">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-4">System Overview</h2>
          <p className="text-sm text-slate-500">
            Current system load indicates {Math.round((stats.totalBookings / (stats.totalSlots || 1)) * 100)}% slot utilization across all configured events.
          </p>
       </div>
    </motion.div>
  );
}

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col items-center text-center">
    <div className={`p-3 rounded-xl ${color} mb-3`}><Icon size={24} /></div>
    <span className="text-3xl font-black text-slate-900 leading-none mb-1">{value}</span>
    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{title}</span>
  </div>
);

function AdminCreateCareerDay({ onCreated }: { onCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', eventDate: '', startTime: '09:00', endTime: '17:00',
    slotDurationMinutes: 30, maxBookingsPerStudent: 2, requireDifferentCompanies: true
  });
  const [companies, setCompanies] = useState([{ name: '', description: '' }, { name: '', description: '' }]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (companies.length < 2) return toast.error('At least 2 companies required');
    if (companies.some(c => !c.name.trim())) return toast.error('All companies must have names');

    setLoading(true);
    try {
      await createCareerDayEvent({ ...formData, companies });
      toast.success('Career Day event created (Draft)');
      onCreated();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm max-w-4xl mx-auto">
      <div className="bg-slate-900 p-6 text-white border-b-4 border-cobalt-sliit">
        <h2 className="text-xl font-black uppercase tracking-tight">Create Career Day</h2>
        <p className="text-slate-400 text-xs mt-1">Configure multi-company interview sessions. Slots will be auto-generated.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
             <div>
               <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Event Title</label>
               <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-cobalt-sliit" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. SE Career Fair 2026" />
             </div>
             <div>
               <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Event Date</label>
               <input required type="date" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-cobalt-sliit" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Start Time</label>
                 <input type="time" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
               </div>
               <div>
                 <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">End Time</label>
                 <input type="time" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
               </div>
             </div>
          </div>
          
          <div className="space-y-4">
            <div>
               <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Slot Duration (Mins)</label>
               <input type="number" min="10" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm" value={formData.slotDurationMinutes} onChange={e => setFormData({...formData, slotDurationMinutes: parseInt(e.target.value)})} />
            </div>
            <div>
               <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Max Bookings Per Student</label>
               <input type="number" min="1" max="5" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm" value={formData.maxBookingsPerStudent} onChange={e => setFormData({...formData, maxBookingsPerStudent: parseInt(e.target.value)})} />
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input type="checkbox" id="diffComp" checked={formData.requireDifferentCompanies} onChange={e => setFormData({...formData, requireDifferentCompanies: e.target.checked})} className="w-4 h-4 text-cobalt-sliit" />
              <label htmlFor="diffComp" className="text-xs font-bold text-slate-700">Require students to select different companies</label>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">Participating Companies</h3>
            <button type="button" onClick={() => setCompanies([...companies, { name: '', description: '' }])} className="text-[10px] font-bold uppercase text-cobalt-sliit hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
              <Plus size={12} /> Add Company
            </button>
          </div>
          <div className="space-y-3">
            {companies.map((c, i) => (
              <div key={i} className="flex gap-4 items-start bg-slate-50 p-4 border border-slate-200 rounded-xl">
                <div className="flex-1 space-y-3">
                  <input required placeholder="Company Name" type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm" value={c.name} onChange={e => { const updated = [...companies]; updated[i].name = e.target.value; setCompanies(updated); }} />
                  <input placeholder="Short Description (Optional)" type="text" className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500" value={c.description} onChange={e => { const updated = [...companies]; updated[i].description = e.target.value; setCompanies(updated); }} />
                </div>
                {companies.length > 2 && (
                  <button type="button" onClick={() => setCompanies(companies.filter((_, idx) => idx !== i))} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg mt-1">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full py-4 bg-cobalt-sliit text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50">
          {loading ? 'Processing...' : 'Generate Career Day Event'}
        </button>
      </form>
    </motion.div>
  );
}

function AdminCreateNormalDay({ onCreated }: { onCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', companyName: '', eventDate: '', startTime: '09:00', endTime: '17:00',
    slotDurationMinutes: 30, maxCandidates: 50
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createNormalDayEvent(formData);
      toast.success('Urgent Hire event created (Draft)');
      onCreated();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm max-w-2xl mx-auto">
      <div className="bg-emerald-800 p-6 text-white border-b-4 border-emerald-500">
        <h2 className="text-xl font-black uppercase tracking-tight">Create Urgent Hire (Normal Day)</h2>
        <p className="text-emerald-200 text-xs mt-1">Quick setup for a single company immediate hiring event.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div>
           <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Event Title</label>
           <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-emerald-500" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. WSO2 Urgent Software Eng Intake" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
           <div>
             <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Company Name</label>
             <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
           </div>
           <div>
             <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Event Date</label>
             <input required type="date" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} />
           </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div>
             <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Start Time</label>
             <input type="time" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
           </div>
           <div>
             <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">End Time</label>
             <input type="time" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
           </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div>
             <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Slot Duration (Mins)</label>
             <input type="number" min="10" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm" value={formData.slotDurationMinutes} onChange={e => setFormData({...formData, slotDurationMinutes: parseInt(e.target.value)})} />
           </div>
           <div>
             <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Max Candidates (Cap)</label>
             <input type="number" min="1" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm" value={formData.maxCandidates} onChange={e => setFormData({...formData, maxCandidates: parseInt(e.target.value)})} />
           </div>
        </div>

        <button type="submit" disabled={loading} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-emerald-700 transition-colors shadow-lg disabled:opacity-50 mt-4">
          {loading ? 'Processing...' : 'Generate Single-Company Event'}
        </button>
      </form>
    </motion.div>
  );
}

function AdminManageEvents() {
  const [events, setEvents] = useState<IInterviewEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getEvents(); // admin gets all, including drafts
      setEvents(data);
    } catch (e) { toast.error('Failed to load events'); }
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  const handlePublish = async (id: string) => {
    try {
      await publishEvent(id);
      toast.success('Event published! Students can now book slots.');
      fetchEvents();
    } catch { toast.error('Failed to publish'); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this entire event? This cannot be undone.')) return;
    try {
      await cancelEvent(id);
      toast.success('Event cancelled.');
      fetchEvents();
    } catch { toast.error('Failed to cancel'); }
  };

  if (loading) return <div className="text-center p-12 text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Scanning Nexus...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {events.map(ev => (
        <div key={ev._id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row gap-6 justify-between items-center hover:border-slate-300 transition-colors">
          <div className="flex-1 w-full relative">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded border ${ev.status === 'published' ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : ev.status === 'cancelled' ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-amber-200 bg-amber-50 text-amber-600'}`}>
                {ev.status}
              </span>
              <span className="text-[10px] font-bold text-slate-500 border border-slate-200 px-2 py-0.5 rounded">{ev.eventType.replace('-', ' ')}</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 leading-tight mb-1">{ev.title}</h3>
            <p className="text-xs text-slate-500 font-semibold mb-2">{new Date(ev.eventDate).toLocaleDateString()} | {ev.startTime} - {ev.endTime}</p>
            <div className="flex gap-4 text-[10px] uppercase font-bold text-slate-400">
               <span>{ev.totalSlots} Total Slots</span>
               <span className="text-cobalt-sliit">{ev.totalBookings} Booked</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {ev.status === 'draft' && (
              <button onClick={() => handlePublish(ev._id)} className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-700">Publish</button>
            )}
            {ev.status !== 'cancelled' && (
              <button onClick={() => handleCancel(ev._id)} className="flex-1 md:flex-none px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-rose-500 hover:text-white">Cancel</button>
            )}
          </div>
        </div>
      ))}
      {events.length === 0 && (
         <div className="text-center p-12 text-slate-500 font-bold uppercase tracking-widest text-xs">No Events Found</div>
      )}
    </motion.div>
  );
}
