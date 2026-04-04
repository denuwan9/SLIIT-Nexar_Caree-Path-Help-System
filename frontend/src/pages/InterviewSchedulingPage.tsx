import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Users, CheckCircle2, Bot, ChevronRight,
  Search, Plus, Trash2, Briefcase, BarChart3, Settings2, AlertCircle, RotateCcw, Zap, Minus, Filter, Pencil, X, Save
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  getEvents, getMyBookings, getEventStats, createCareerDayEvent,
  createNormalDayEvent, publishEvent, deleteEvent, updateEvent, bookSlot, cancelBooking
} from '../services/interviewService';
import type { IInterviewEvent, IMyBooking, IEventStats, ICompany, ISlot } from '../services/interviewService';

// ─────────────────────────────────────────────────────────────────────────────
// PREMIUM UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const TabButton = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-3.5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap
      ${active
        ? 'bg-[#151B2B] text-white shadow-inner border border-white/10'
        : 'text-slate-400 hover:text-white bg-transparent border border-transparent hover:bg-white/5 hover:border-white/5'}`}
  >
    <Icon size={14} className={active ? "text-blue-400" : ""} />
    {label}
  </button>
);

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-slate-100/50 hover:-translate-y-1 transition-all duration-500 flex flex-col items-center justify-center text-center h-full border border-slate-50/50">
    <div className={`w-14 h-14 flex items-center justify-center rounded-[1.25rem] ${color} mb-6 group-hover:scale-110 transition-transform duration-500`}>
      <Icon size={24} />
    </div>
    <span className="text-4xl md:text-[2.5rem] font-black text-[#0F172A] leading-none mb-3 tracking-tight">{value}</span>
    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">{title}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function StudentBrowseEvents({ onBookSuccess }: { onBookSuccess: () => void }) {
  const [events, setEvents] = useState<IInterviewEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<IInterviewEvent | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

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
      onBookSuccess(); // Switch to My Bookings tab
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to book slot');
    } finally {
      setBookingProgress(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-12 h-12 border-4 border-[#0F172A]/5 border-t-[#0F172A] rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Syncing Nexus Events...</p>
    </div>
  );

  if (selectedEvent) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8 pb-20">
        <button onClick={() => { setSelectedEvent(null); setBookingCompany(null); setBookingSlot(null); }} className="group flex items-center gap-3 text-[11px] font-black text-slate-400 hover:text-[#0F172A] uppercase tracking-widest transition-all">
          <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-slate-300 transition-colors">
            <ChevronRight size={14} className="rotate-180" />
          </div>
          Back to Events Timeline
        </button>

        <div className="bg-white p-10 md:p-14 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-full -z-0 opacity-50" />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="px-4 py-1.5 bg-[#0F172A] text-white text-[10px] font-black uppercase rounded-xl block w-fit tracking-[0.2em] shadow-lg shadow-slate-200">
                    {selectedEvent.eventType.replace('-', ' ')}
                  </span>
                  <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-1.5 rounded-xl border border-slate-100">
                    <Calendar size={12} className="text-blue-500" />
                    {new Date(selectedEvent.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-[#0F172A] uppercase tracking-tight leading-[1.1] mb-6">{selectedEvent.title}</h2>
                <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-2xl">{selectedEvent.description || 'Access unique professional opportunities through this curated interview event.'}</p>
              </div>
              <div className="bg-[#0F172A] p-8 rounded-[2rem] text-center min-w-[180px] shadow-2xl shadow-slate-300 transform hover:scale-105 transition-transform duration-500">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-3">Slot Allowance</p>
                <p className="text-5xl font-black text-white leading-none mb-2">{selectedEvent.maxBookingsPerStudent}</p>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Per Student</p>
              </div>
            </div>

            {selectedEvent.eventType === 'career-day' && !bookingCompany ? (
              <div className="mt-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Users size={18} className="text-[#0F172A]" />
                  </div>
                  <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">Step 1: Select Your Target Organization</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {selectedEvent.companies?.map(comp => (
                    <div key={comp._id} onClick={() => setBookingCompany(comp)} className="p-6 bg-white border border-slate-100 rounded-[2rem] cursor-pointer hover:border-[#0F172A] hover:shadow-xl hover:shadow-slate-100 transition-all duration-500 group/card relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-lg font-black text-[#0F172A] uppercase tracking-tight group-hover/card:text-blue-600 transition-colors">{comp.name}</h4>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg border border-emerald-100 uppercase tracking-widest">
                            {comp.slots.filter(s => s.status === 'available').length} Available
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">{comp.description || 'No description provided by organization.'}</p>
                      </div>
                      <div className="absolute bottom-0 right-0 w-16 h-16 bg-slate-50 rounded-tl-full opacity-50 group-hover/card:scale-110 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Clock size={18} className="text-[#0F172A]" />
                    </div>
                    <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">
                      {selectedEvent.eventType === 'career-day' ? `Step 2: Reserve Time with ${bookingCompany?.name}` : 'Reserve Your Interview Slot'}
                    </h3>
                  </div>
                  {selectedEvent.eventType === 'career-day' && (
                    <button onClick={() => { setBookingCompany(null); setBookingSlot(null); }} className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-[0.2em] flex items-center gap-2 transition-colors transition-all hover:translate-x-[-4px]">
                      <RotateCcw size={12} /> Reset Organization
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {(selectedEvent.eventType === 'career-day' ? bookingCompany?.slots : selectedEvent.slots)?.map(slot => {
                    const isAvailable = slot.status === 'available';
                    const isSelected = bookingSlot?._id === slot._id;
                    return (
                      <button
                        key={slot._id}
                        disabled={!isAvailable}
                        onClick={() => setBookingSlot(slot)}
                        className={`p-5 rounded-2xl border-2 transition-all duration-500 flex flex-col items-center justify-center gap-2 group
                           ${!isAvailable ? 'border-slate-50 bg-slate-50 opacity-40 cursor-not-allowed' :
                            isSelected ? 'border-[#0F172A] bg-[#0F172A] text-white scale-105 shadow-xl shadow-slate-300' :
                              'border-slate-100 hover:border-blue-400 hover:shadow-lg bg-white'}`}
                      >
                        <Clock size={16} className={isSelected ? 'text-blue-400' : 'text-slate-300 group-hover:text-[#0F172A] transition-colors'} />
                        <span className="text-sm font-black tracking-tight">{new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isAvailable ? (isSelected ? 'text-blue-200' : 'text-emerald-500') : 'text-slate-400'}`}>
                          {slot.status}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {bookingSlot && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-12 p-8 bg-[#F8FAFC] rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl shadow-slate-100">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                        <CheckCircle2 size={32} className="text-[#0F172A]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Selected Schedule</p>
                        <p className="font-black text-[#0F172A] text-2xl tracking-tight">
                          {new Date(bookingSlot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(bookingSlot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {bookingCompany && <p className="text-sm font-bold text-blue-600 mt-1 uppercase tracking-wider">with {bookingCompany.name}</p>}
                      </div>
                    </div>
                    <button
                      onClick={handleBook}
                      disabled={bookingProgress}
                      className="px-10 py-5 bg-[#0F172A] text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-slate-800 hover:scale-105 hover:shadow-2xl active:scale-95 transition-all duration-500 shadow-xl shadow-slate-200 disabled:opacity-50 w-full md:w-auto"
                    >
                      {bookingProgress ? 'Finalizing...' : 'Initialize Booking'}
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

  const filteredEvents = filterType === 'all' ? events : events.filter(e => e.eventType === filterType);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      {events.length === 0 ? (
        <div className="text-center p-20 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-50">
          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-[#0F172A] uppercase tracking-tight mb-2">Nexus Offline</h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">No upcoming recruitment windows or professional events detected at this time.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-tight ml-2">Active Windows</h3>
            <div className="flex flex-wrap items-center bg-white border border-slate-100 rounded-full p-1.5 shadow-sm">
              <div className="pl-3 pr-2 text-slate-400">
                <Filter size={16} />
              </div>
              <button onClick={() => setFilterType('all')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${filterType === 'all' ? 'bg-[#0F172A] text-white shadow-md shadow-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-[#0F172A]'}`}>All Viewing</button>
              <button onClick={() => setFilterType('career-day')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${filterType === 'career-day' ? 'bg-purple-600 text-white shadow-md shadow-purple-200' : 'text-slate-500 hover:bg-purple-50 hover:text-purple-600'}`}>Career Day</button>
              <button onClick={() => setFilterType('normal-day')} className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${filterType === 'normal-day' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`}>Normal Day</button>
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
              <p className="text-slate-500 font-medium">No active windows found for this filter.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((ev) => (
                <div key={ev._id} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 flex flex-col hover:border-blue-100 hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 group relative overflow-hidden h-full">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-0 opacity-40 group-hover:scale-125 transition-transform duration-700" />

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-8">
                      <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-sm ${ev.eventType === 'career-day' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                        {ev.eventType.replace('-', ' ')}
                      </span>
                      <span className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest bg-slate-50/50 px-3 py-1 rounded-lg">
                        <Calendar size={12} className="text-blue-400" />
                        {new Date(ev.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-[#0F172A] leading-tight mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 uppercase tracking-tight">{ev.title}</h3>
                    <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-8 flex-grow leading-relaxed">{ev.description || 'Access unique professional opportunities through Nexus.'}</p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 group-hover:bg-white transition-colors">
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">Window</p>
                        <p className="text-xs font-black text-[#0F172A]">{ev.startTime} — {ev.endTime}</p>
                      </div>
                      <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 group-hover:bg-white transition-colors">
                        <p className="text-[9px] text-blue-400 font-black uppercase tracking-[0.2em] mb-2">Availability</p>
                        <p className="text-xs font-black text-blue-700">{ev.availableSlots} Slots Left</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedEvent(ev)}
                      className="w-full py-4 bg-[#0F172A] text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:scale-[1.02] active:scale-95 transition-all duration-500 shadow-xl shadow-slate-200"
                    >
                      Enter Nexus Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(eventId, slotId, companyId || undefined);
      toast.success('Your interview slot has been released.');
      fetchBookings();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to cancel');
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-12 h-12 border-4 border-[#0F172A]/5 border-t-[#0F172A] rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Syncing Scheduled Slots...</p>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {bookings.length === 0 ? (
        <div className="text-center p-20 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-50">
          <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-[#0F172A] uppercase tracking-tight mb-2">Portfolio Clear</h3>
          <p className="text-slate-500 font-medium max-w-sm mx-auto">You haven't reserved any interview windows yet. Head to Browse Events to start.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bookings.map((b) => (
            <div key={b.slotId} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 flex flex-col shadow-sm hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform -z-0 opacity-40" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center gap-2 border border-emerald-100 shadow-sm">
                    <CheckCircle2 size={12} /> {b.slotStatus}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-50/50 px-3 py-1 border border-slate-100/50 rounded-lg uppercase tracking-widest">
                    {new Date(b.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  </span>
                </div>

                <h3 className="text-xl font-black text-[#0F172A] mb-2 leading-tight uppercase tracking-tight group-hover:text-blue-600 transition-colors">{b.eventTitle}</h3>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-8">{b.companyName || 'General Session'}</p>

                <div className="mt-auto p-5 bg-[#F8FAFC] rounded-2xl border border-slate-100 flex items-center justify-between mb-8 shadow-inner">
                  <div className="flex items-center gap-3 text-[#0F172A]">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-slate-100">
                      <Clock size={18} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Time Slot</p>
                      <p className="text-sm font-black tracking-tight">
                        {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleCancel(b.eventId, b.slotId, b.companyId)}
                  className="w-full py-4 bg-white border border-rose-100 text-rose-500 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-500 shadow-sm active:scale-95"
                >
                  Terminate Booking
                </button>
              </div>
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

  if (!stats) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-12 h-12 border-4 border-[#0F172A]/5 border-t-blue-500 rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Aggregating Nexus Analytics...</p>
    </div>
  );

  const utilization = Math.round((stats.totalBookings / (stats.totalSlots || 1)) * 100);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <StatCard title="Nexus Events" value={stats.totalEvents} icon={Calendar} color="bg-blue-50 text-blue-600" />
        <StatCard title="Live Windows" value={stats.publishedEvents} icon={CheckCircle2} color="bg-emerald-50 text-emerald-600" />
        <StatCard title="Total Capacity" value={stats.totalSlots} icon={Clock} color="bg-amber-50 text-amber-600" />
        <StatCard title="Active Reservations" value={stats.totalBookings} icon={Users} color="bg-purple-50 text-purple-600" />
      </div>

      <div className="bg-white p-10 md:p-14 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-full pointer-events-none opacity-50 -z-0" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#0F172A] flex items-center justify-center shadow-xl shadow-slate-300">
              <BarChart3 size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#0F172A] uppercase tracking-tight">Booking Analytics</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Real-time Interview Capacity</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-slate-500 text-lg font-medium leading-relaxed mb-8">
                The system is currently operating at <span className="text-[#0F172A] font-black">{utilization}% booking utilization</span>.
                We recommend opening additional interview slots if usage exceeds 85% to ensure sufficient availability for all students.
              </p>
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${utilization}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={`h-full rounded-full shadow-lg ${utilization > 80 ? 'bg-rose-500' : 'bg-blue-600'}`}
                />
              </div>
            </div>
            <div className="bg-[#F8FAFC] p-8 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Core Suggestion</p>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg ${utilization < 30 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {utilization < 30 ? <AlertCircle size={32} /> : <CheckCircle2 size={32} />}
              </div>
              <h4 className="text-lg font-black text-[#0F172A] uppercase tracking-tight mb-2">
                {utilization < 30 ? 'Needs Attention' : 'Healthy Engagement'}
              </h4>
              <p className="text-xs text-slate-500 font-medium">
                {utilization < 30
                  ? 'Encourage students to browse and book active interview sessions through the university portal.'
                  : 'The interview systems are showing robust booking interaction patterns today.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AdminCreateEvent({ onCreated }: { onCreated: () => void }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [eventType, setEventType] = useState<'career' | 'normal'>('career');

  const [formData, setFormData] = useState({
    title: '', eventDate: '', startTime: '09:00', endTime: '17:00',
    slotDurationMinutes: 30, maxBookingsPerStudent: 2,
    requireDifferentCompanies: true,
    companyName: '', maxCandidates: 50 // For normal day
  });

  const [companies, setCompanies] = useState([{ name: '', description: '', interviewers: [{ name: '', expertise: '' }] }]);

  const addInterviewer = (companyIndex: number) => {
    const updated = [...companies];
    updated[companyIndex].interviewers.push({ name: '', expertise: '' });
    setCompanies(updated);
  };

  const updateInterviewer = (cIdx: number, iIdx: number, field: 'name' | 'expertise', value: string) => {
    const updated = [...companies];
    updated[cIdx].interviewers[iIdx][field] = value;
    setCompanies(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const nameRegex = /^[A-Za-z0-9\s&()\/.,'"-]+$/;

    try {
      let currentErrors: { [key: string]: string } = {};

      if (!formData.title.trim()) currentErrors.title = 'Event title is required';
      else if (!nameRegex.test(formData.title.trim())) currentErrors.title = 'Operational Title can only contain characters';

      if (!formData.eventDate) currentErrors.eventDate = 'Event date is required';

      if (Object.keys(currentErrors).length > 0) {
        setErrors(currentErrors);
        setLoading(false);
        return toast.error('Please correct errors in the form');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(formData.eventDate);
      if (selectedDate < today) return toast.error('Event date cannot be in the past');

      if (eventType === 'career') {
        if (!formData.startTime || !formData.endTime) return toast.error('Start and End times are required');
        if (formData.endTime <= formData.startTime) return toast.error('End time must be after start time');
        if (companies.length > 20) return toast.error('Maximum 20 companies allowed');

        let companyErrors: { [key: string]: string } = {};
        const companyNames = companies.map((c, idx) => {
          const name = c.name.trim();
          if (!name) companyErrors[`company_${idx}_name`] = 'Organization name required';
          else if (!nameRegex.test(name)) companyErrors[`company_${idx}_name`] = 'Characters only';

          if (!c.description.trim()) companyErrors[`company_${idx}_desc`] = 'Description required';

          return name;
        });

        if (Object.keys(companyErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...companyErrors }));
          setLoading(false);
          return toast.error('Missing organization details');
        }

        const uniqueNames = new Set(companyNames.map(n => n.toLowerCase()));
        if (uniqueNames.size !== companyNames.length) return toast.error('Duplicate company names are not allowed');

        if (companies.some(c => c.interviewers.some(i => !i.name.trim() || !i.expertise.trim()))) {
          setLoading(false);
          return toast.error('All interviewer details must be completed');
        }

        const payloadCompanies = companies.map(c => ({
          name: c.name,
          description: c.description,
          interviewers: c.interviewers.filter(i => i.name.trim()).map(i => `${i.name} (${i.expertise})`)
        }));

        await createCareerDayEvent({ ...formData, companies: payloadCompanies });
        toast.success('Nexus Event Initialized (Draft)');
      } else {
        let normalErrors: { [key: string]: string } = {};
        if (!formData.startTime) normalErrors.startTime = 'Start time required';
        if (!formData.companyName.trim()) normalErrors.companyName = 'Company name required';
        else if (!nameRegex.test(formData.companyName.trim())) normalErrors.companyName = 'Characters only';

        if (Object.keys(normalErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...normalErrors }));
          setLoading(false);
          return toast.error('Form incomplete');
        }

        if (formData.maxCandidates < 1) return toast.error('Max candidates must be at least 1');

        await createNormalDayEvent({
          title: formData.title,
          companyName: formData.companyName,
          eventDate: formData.eventDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          slotDurationMinutes: formData.slotDurationMinutes,
          maxCandidates: formData.maxCandidates
        });
        toast.success('Quick Event Initialized (Draft)');
      }
      onCreated();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to initialize event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-50 rounded-[3rem] shadow-2xl shadow-slate-200/50 max-w-5xl mx-auto overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-full -z-0 opacity-40" />

      <div className="relative z-10">
        <div className="p-10 md:p-14 border-b border-slate-50 bg-[#F8FAFC]/50 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0F172A] flex items-center justify-center shadow-xl shadow-slate-300">
              <Plus size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-[#0F172A] tracking-tight uppercase">Event Architect</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Configure recruitment infrastructure</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-12">

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">

            <div className="md:col-span-2">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Recruitment Protocol</label>
              <div className="flex gap-4">
                {['career', 'normal'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEventType(type as any)}
                    className={`flex-1 py-4 px-6 rounded-2xl border-2 transition-all duration-500 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3
                        ${eventType === type
                          ? (type === 'career' ? 'bg-purple-600 border-purple-600 text-white shadow-xl shadow-purple-200' : 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200')
                          : (type === 'career' ? 'bg-white border-slate-100 text-slate-400 hover:border-purple-200 hover:text-purple-600 hover:bg-purple-50' : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50')}`}
                  >
                    {type === 'career' ? <Briefcase size={16} /> : <Zap size={16} />}
                    {type === 'career' ? 'Career Day' : 'Normal Day'}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Title</label>
              <input
                required type="text"
                list="event-titles"
                className={`w-full bg-[#F8FAFC] border-2 rounded-2xl px-6 py-4 text-sm font-bold text-[#0F172A] focus:outline-none focus:bg-white transition-all shadow-inner ${errors.title ? 'border-rose-400' : 'border-transparent focus:border-blue-400'}`}
                value={formData.title}
                onChange={e => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) setErrors(prev => { const n = { ...prev }; delete n.title; return n; });
                }}
                placeholder="e.g., NEXUS SPRING DRIVE 2026"
              />
              <datalist id="event-titles">
                <option value="Software Engineering" />
                <option value="Web Development" />
                <option value="Mobile Application Development" />
                <option value="Full Stack Development" />
                <option value="Frontend Development" />
                <option value="Backend Development" />
                <option value="Game Development" />
                <option value="Software Quality Assurance (QA)" />
                <option value="IT Project Management" />
                <option value="Product Management" />
                <option value="Business Analysis (BA)" />
                <option value="Systems Engineering" />
                <option value="Cloud Computing" />
                <option value="Cloud Engineering" />
                <option value="DevOps Engineering" />
                <option value="Cybersecurity" />
                <option value="Information Security" />
                <option value="Network Engineering" />
                <option value="Data Analysis" />
                <option value="Data Engineering" />
                <option value="Big Data Engineering" />
                <option value="Machine Learning Engineering" />
                <option value="Deep Learning Engineering" />
              </datalist>
              {errors.title && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1 ml-2 flex items-center gap-1"><AlertCircle size={10} /> {errors.title}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Scheduled Date</label>
              <input
                required type="date"
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-[#F8FAFC] border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-[#0F172A] focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner"
                value={formData.eventDate} onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Window</label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  required type="time"
                  className="w-full bg-[#F8FAFC] border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-[#0F172A] focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner"
                  value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                />
                {eventType === 'career' ? (
                  <input
                    required type="time"
                    className="w-full bg-[#F8FAFC] border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-[#0F172A] focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner"
                    value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  />
                ) : (
                  <div className="bg-slate-50 rounded-2xl flex items-center justify-center text-[10px] font-black text-slate-300 uppercase tracking-widest border-2 border-transparent">
                    Auto-Ending
                  </div>
                )}
              </div>
            </div>

            {eventType === 'normal' && (
              <div className="md:col-span-1 space-y-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Host Organization</label>
                <input
                  required type="text"
                  className={`w-full bg-[#F8FAFC] border-2 rounded-2xl px-6 py-4 text-sm font-bold text-[#0F172A] focus:outline-none focus:bg-white transition-all shadow-inner ${errors.companyName ? 'border-rose-400' : 'border-transparent focus:border-blue-400'}`}
                  value={formData.companyName}
                  onChange={e => {
                    setFormData({ ...formData, companyName: e.target.value });
                    if (errors.companyName) setErrors(prev => { const n = { ...prev }; delete n.companyName; return n; });
                  }}
                  placeholder="e.g., GLOBAL DYNAMICS"
                />
                {errors.companyName && <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mt-1 ml-2 flex items-center gap-1"><AlertCircle size={10} /> {errors.companyName}</p>}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Slot Quantization</label>
              <select className="w-full bg-[#F8FAFC] border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-[#0F172A] focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner appearance-none" value={formData.slotDurationMinutes} onChange={e => setFormData({ ...formData, slotDurationMinutes: parseInt(e.target.value) })}>
                <option value={15}>15 MIN — BLITZ</option>
                <option value={30}>30 MIN — STANDARD</option>
                <option value={45}>45 MIN — EXTENDED</option>
                <option value={60}>60 MIN — DEEP DIVE</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {eventType === 'career' ? 'Concurrency Limit' : 'Reservation Cap'}
              </label>
              <input required type="number" min="1" max={eventType === 'career' ? 5 : 500} className="w-full bg-[#F8FAFC] border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-[#0F172A] focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner" value={eventType === 'career' ? formData.maxBookingsPerStudent : formData.maxCandidates} onChange={e => setFormData({ ...formData, [eventType === 'career' ? 'maxBookingsPerStudent' : 'maxCandidates']: parseInt(e.target.value) })} />
            </div>
          </div>

          {eventType === 'career' && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Users size={20} className="text-blue-600" />
                  </div>
                  <h3 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">Organization Manifest</h3>
                </div>
                <span className="px-4 py-1.5 bg-slate-100 text-slate-500 font-black text-[10px] rounded-full uppercase tracking-widest">
                  {companies.length} / 20 NODES
                </span>
              </div>

              <div className="space-y-6">
                {companies.map((c, i) => (
                  <div key={i} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] relative group hover:border-blue-400 hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500 overflow-hidden shadow-xl shadow-slate-100">
                    <button type="button" onClick={() => setCompanies(companies.filter((_, idx) => idx !== i))} className="absolute top-6 right-6 text-rose-500 bg-white hover:bg-rose-50 p-3 rounded-2xl transition-all z-50 shadow-sm border border-rose-100 hover:border-rose-200 hover:scale-105 cursor-pointer flex items-center justify-center">
                      <Trash2 size={20} strokeWidth={2.5} />
                    </button>

                    <div className="grid md:grid-cols-12 gap-8 items-start relative z-10">
                      <div className="md:col-span-5 space-y-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Node {i + 1} Metadata</label>
                        <input
                          required placeholder="Organization Name" type="text"
                          className={`w-full bg-[#F8FAFC] border-2 rounded-xl px-4 py-3 text-sm font-bold text-[#0F172A] focus:outline-none focus:bg-white transition-all shadow-inner ${errors[`company_${i}_name`] ? 'border-rose-400' : 'border-transparent focus:border-blue-400'}`}
                          value={c.name}
                          onChange={e => {
                            const updated = [...companies]; updated[i].name = e.target.value; setCompanies(updated);
                            if (errors[`company_${i}_name`]) setErrors(prev => { const n = { ...prev }; delete n[`company_${i}_name`]; return n; });
                          }}
                        />
                        {errors[`company_${i}_name`] && <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-1 ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors[`company_${i}_name`]}</p>}
                        <textarea
                          required placeholder="Service Description / Focus Areas"
                          className={`w-full bg-[#F8FAFC] border-2 rounded-xl px-4 py-3 text-sm font-bold text-[#0F172A] focus:outline-none focus:bg-white transition-all shadow-inner min-h-[100px] resize-none ${errors[`company_${i}_desc`] ? 'border-rose-400' : 'border-transparent focus:border-blue-400'}`}
                          value={c.description}
                          onChange={e => {
                            const updated = [...companies]; updated[i].description = e.target.value; setCompanies(updated);
                            if (errors[`company_${i}_desc`]) setErrors(prev => { const n = { ...prev }; delete n[`company_${i}_desc`]; return n; });
                          }}
                        />
                        {errors[`company_${i}_desc`] && <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-1 ml-1 flex items-center gap-1"><AlertCircle size={10} /> {errors[`company_${i}_desc`]}</p>}
                      </div>

                      <div className="md:col-span-7 space-y-4">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Personnel</label>
                        <div className="space-y-3">
                          {c.interviewers.map((inv, iIdx) => (
                            <div key={iIdx} className="flex gap-2">
                              <input required placeholder="Name" type="text" className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-blue-400 transition-all shadow-sm" value={inv.name} onChange={e => updateInterviewer(i, iIdx, 'name', e.target.value)} />
                              <input required placeholder="Expertise" type="text" className="flex-1 bg-white border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold text-[blue-600] focus:outline-none focus:border-blue-400 transition-all shadow-sm" value={inv.expertise} onChange={e => updateInterviewer(i, iIdx, 'expertise', e.target.value)} />
                              {c.interviewers.length > 1 && (
                                <button type="button" onClick={() => {
                                  const updated = [...companies];
                                  updated[i].interviewers.splice(iIdx, 1);
                                  setCompanies(updated);
                                }} className="p-2 text-slate-300 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-xl transition-all border border-slate-100 hover:border-rose-200 shadow-sm flex items-center justify-center">
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={() => addInterviewer(i)} className="w-full py-3 bg-blue-50 text-blue-600 font-black text-[10px] rounded-xl uppercase tracking-widest hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                          <Plus size={14} /> Add Personnel
                        </button>
                      </div>
                    </div>
                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-400" />
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                {companies.length < 20 && (
                  <button type="button" onClick={() => setCompanies([...companies, { name: '', description: '', interviewers: [{ name: '', expertise: '' }] }])} className="flex-1 py-6 bg-white border-2 border-dashed border-blue-400 rounded-[2rem] text-xs font-black text-blue-500 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 transition-all duration-500 uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm">
                    <Plus size={18} /> Integrate New Organization Node
                  </button>
                )}
                {companies.length > 0 && (
                  <button type="button" onClick={() => setCompanies(companies.slice(0, -1))} className="flex-1 py-6 bg-[#F8FAFC] border-2 border-dashed border-slate-200 rounded-[2rem] text-xs font-black text-slate-400 hover:border-rose-400 hover:text-rose-500 hover:bg-rose-50/30 transition-all duration-500 uppercase tracking-widest flex items-center justify-center gap-3 shadow-sm">
                    <Minus size={18} /> Remove Organization Node
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="pt-12 border-t border-slate-50 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest max-w-xs leading-relaxed">Ensure all parameters comply with Nexus recruitment standards before initialization.</p>
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-5 bg-[#0F172A] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 hover:scale-[1.05] active:scale-95 transition-all duration-500 shadow-2xl shadow-slate-300 disabled:opacity-50 min-w-[240px]"
            >
              {loading ? 'Initializing Nexus...' : 'Initialize Nexus Event'}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: Edit Event Modal
// ─────────────────────────────────────────────────────────────────────────────

function AdminEditEventModal({ event, onClose, onSaved }: { event: IInterviewEvent; onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: event.title,
    eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : '',
    startTime: event.startTime || '09:00',
    endTime: event.endTime || '17:00',
    description: event.description || '',
    maxBookingsPerStudent: event.maxBookingsPerStudent ?? 2,
    maxCandidates: event.maxCandidates ?? 50,
    requireDifferentCompanies: event.requireDifferentCompanies ?? true,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.eventDate) return toast.error('Date is required');
    if (form.endTime <= form.startTime) return toast.error('End time must be after start time');

    setSaving(true);
    try {
      const payload: any = {
        title: form.title.trim(),
        eventDate: form.eventDate,
        startTime: form.startTime,
        endTime: form.endTime,
        description: form.description.trim() || undefined,
      };
      if (event.eventType === 'career-day') {
        payload.maxBookingsPerStudent = form.maxBookingsPerStudent;
        payload.requireDifferentCompanies = form.requireDifferentCompanies;
      } else {
        payload.maxCandidates = form.maxCandidates;
      }
      await updateEvent(event._id, payload);
      toast.success('Schedule updated successfully!');
      onSaved();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backdropFilter: 'blur(8px)', background: 'rgba(15,23,42,0.55)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 30 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/30 w-full max-w-2xl overflow-hidden relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-10 py-8 border-b border-slate-100 bg-[#F8FAFC]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <Pencil size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#0F172A] uppercase tracking-tight">Edit Schedule</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                {event.eventType.replace('-', ' ')} · {event.status}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-10 space-y-8">

          {/* Title */}
          <div className="space-y-2">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Title</label>
            <input
              required type="text"
              className="w-full bg-[#F8FAFC] border-2 border-transparent rounded-2xl px-5 py-3.5 text-sm font-bold text-[#0F172A] focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Event title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Description <span className="text-slate-300">(optional)</span></label>
            <textarea
              rows={2}
              className="w-full bg-[#F8FAFC] border-2 border-transparent rounded-2xl px-5 py-3.5 text-sm font-bold text-[#0F172A] focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner resize-none"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description of the event"
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Event Date</label>
              <input
                required type="date"
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-[#F8FAFC] border-2 border-transparent rounded-2xl px-5 py-3.5 text-sm font-bold text-[#0F172A] focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner"
                value={form.eventDate}
                onChange={e => setForm({ ...form, eventDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Start Time</label>
              <input
                required type="time"
                className="w-full bg-[#F8FAFC] border-2 border-transparent rounded-2xl px-5 py-3.5 text-sm font-bold text-[#0F172A] focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner"
                value={form.startTime}
                onChange={e => setForm({ ...form, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">End Time</label>
              <input
                required type="time"
                className="w-full bg-[#F8FAFC] border-2 border-transparent rounded-2xl px-5 py-3.5 text-sm font-bold text-[#0F172A] focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner"
                value={form.endTime}
                onChange={e => setForm({ ...form, endTime: e.target.value })}
              />
            </div>
          </div>

          {/* Booking limit */}
          <div className="space-y-2">
            {event.eventType === 'career-day' ? (
              <>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Booking Limit Per Student</label>
                <input
                  type="number" min={1} max={5} required
                  className="w-full bg-[#F8FAFC] border-2 border-transparent rounded-2xl px-5 py-3.5 text-sm font-bold text-[#0F172A] focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner"
                  value={form.maxBookingsPerStudent}
                  onChange={e => setForm({ ...form, maxBookingsPerStudent: parseInt(e.target.value) })}
                />
                <label className="flex items-center gap-3 mt-3 cursor-pointer group">
                  <div
                    onClick={() => setForm({ ...form, requireDifferentCompanies: !form.requireDifferentCompanies })}
                    className={`w-10 h-6 rounded-full transition-all duration-300 flex items-center px-1 ${
                      form.requireDifferentCompanies ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${form.requireDifferentCompanies ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] group-hover:text-[#0F172A] transition-colors">
                    Require Different Companies
                  </span>
                </label>
              </>
            ) : (
              <>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Max Candidates (Reservation Cap)</label>
                <input
                  type="number" min={1} max={500} required
                  className="w-full bg-[#F8FAFC] border-2 border-transparent rounded-2xl px-5 py-3.5 text-sm font-bold text-[#0F172A] focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-inner"
                  value={form.maxCandidates}
                  onChange={e => setForm({ ...form, maxCandidates: parseInt(e.target.value) })}
                />
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={14} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function AdminManageEvents() {
  const [events, setEvents] = useState<IInterviewEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<IInterviewEvent | null>(null);

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
      toast.success('Event officially synchronized with Nexus. Students can now book slots.');
      fetchEvents();
    } catch { toast.error('Failed to publish'); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm("Permanently purge " + title + " from Nexus records? This is irreversible.")) return;
    try {
      await deleteEvent(id);
      toast.success('Nexus record purged.');
      fetchEvents();
    } catch { toast.error('Failed to delete event'); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-12 h-12 border-4 border-[#0F172A]/5 border-t-amber-500 rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Accessing Data Nodes...</p>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {editingEvent && (
          <AdminEditEventModal
            key={editingEvent._id}
            event={editingEvent}
            onClose={() => setEditingEvent(null)}
            onSaved={() => { setEditingEvent(null); fetchEvents(); }}
          />
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {events.length === 0 ? (
          <div className="text-center p-20 bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-50">
            <h3 className="text-2xl font-black text-[#0F172A] uppercase tracking-tight mb-2">No Records</h3>
            <p className="text-slate-500 font-medium">Create a new recruitment window to populate Nexus.</p>
          </div>
        ) : events.map(ev => (
          <div key={ev._id} className="bg-white border border-slate-50 rounded-[2rem] p-8 flex flex-col md:flex-row gap-8 justify-between items-center hover:border-slate-100 hover:shadow-2xl hover:shadow-slate-50 transition-all duration-500 relative overflow-hidden group">
            <div className="flex-1 w-full relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border-2 ${ev.status === 'published' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : ev.status === 'cancelled' ? 'border-rose-100 bg-rose-50 text-rose-600' : 'border-amber-100 bg-amber-50 text-amber-600'}`}>
                  {ev.status}
                </span>
                <span className="text-[10px] font-black text-slate-400 border border-slate-100 bg-slate-50/50 px-3 py-1 rounded-lg uppercase tracking-widest">{ev.eventType.replace('-', ' ')}</span>
              </div>
              <h3 className="text-2xl font-black text-[#0F172A] leading-tight mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{ev.title}</h3>
              <p className="text-sm text-slate-500 font-bold mb-6 flex items-center gap-2">
                <Calendar size={14} className="text-blue-500" />
                {new Date(ev.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                <span className="text-slate-200">|</span>
                <Clock size={14} className="text-blue-500" />
                {ev.startTime} — {ev.endTime}
              </p>
              <div className="flex gap-8 text-[11px] uppercase font-black tracking-[0.1em]">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-slate-200" />
                  {ev.totalSlots} Total Slots
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  {ev.totalBookings} Active Reservations
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
              {ev.status === 'draft' && (
                <button
                  onClick={() => handlePublish(ev._id)}
                  className="flex-1 md:flex-none px-8 py-3 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-100"
                >
                  Synchronize
                </button>
              )}
              {ev.status !== 'cancelled' && (
                <button
                  onClick={() => setEditingEvent(ev)}
                  className="flex-1 md:flex-none px-6 py-3 bg-white border-2 border-blue-100 text-blue-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 justify-center"
                >
                  <Pencil size={14} />
                  Edit
                </button>
              )}
              <button
                onClick={() => handleDelete(ev._id, ev.title)}
                className="p-4 text-slate-300 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 rounded-2xl transition-all border border-transparent"
                title="Purge Record"
              >
                <Trash2 size={24} />
              </button>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-slate-50 rounded-tl-full -z-0 opacity-40 group-hover:scale-110 transition-transform duration-700" />
          </div>
        ))}
      </motion.div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function InterviewSchedulingPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(isAdmin ? 'dashboard' : 'browse');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0EEFF] via-[#F0F4FB] to-[#EDE8FE] font-main selection:bg-blue-100 selection:text-blue-900 relative overflow-hidden">
      {/* Decorative Background Orbs */}
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-15%] left-[-5%] w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed top-[40%] left-[50%] w-[400px] h-[400px] bg-purple-100/15 rounded-full blur-[80px] pointer-events-none" />

      {/* Dark Theme Standalone Header Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-50">
        <div className="bg-[#0B1121] rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-blue-900/10 border border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 w-fit">
              <Bot size={12} className="text-blue-400" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Nexus Network Active</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white flex flex-wrap items-center gap-x-3">
              Interview <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Scheduling</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Secure your perfect interview schedule. Our system turns available recruitment windows into an easy-to-follow plan.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02]">
                <div className="w-4 h-4 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <span className="text-[11px] font-bold text-slate-300">System: Online</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02]">
                <Zap size={14} className="text-blue-400" />
                <span className="text-[11px] font-bold text-slate-300">Powered by Nexus</span>
              </div>
            </div>
          </div>

          {/* Precision Navigation Tabs */}
          <div className="flex p-1.5 bg-[#050810] border border-white/5 rounded-[2.5rem] overflow-x-auto hide-scrollbar w-full lg:w-auto">
            {!isAdmin ? (
              <>
                <TabButton active={activeTab === 'browse'} onClick={() => setActiveTab('browse')} icon={Search} label="Browse Events" />
                <TabButton active={activeTab === 'my-bookings'} onClick={() => setActiveTab('my-bookings')} icon={Calendar} label="My Portfolio" />
              </>
            ) : (
              <>
                <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={BarChart3} label="Analytics" />
                <TabButton active={activeTab === 'create-event'} onClick={() => setActiveTab('create-event')} icon={Plus} label="Architect" />
                <TabButton active={activeTab === 'manage'} onClick={() => setActiveTab('manage')} icon={Settings2} label="Governance" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Evolution Area */}
      <main className="max-w-7xl mx-auto p-6 md:p-12 pb-32">
        <AnimatePresence mode="wait">
          {!isAdmin && activeTab === 'browse' && (
            <StudentBrowseEvents
              key="student-browse"
              onBookSuccess={() => {
                toast.success('Synchronization payload received. Redirecting to portfolio.');
                setActiveTab('my-bookings');
              }}
            />
          )}
          {!isAdmin && activeTab === 'my-bookings' && <StudentMyBookings key="student-bookings" />}

          {isAdmin && activeTab === 'dashboard' && <AdminDashboard key="admin-dashboard" />}
          {isAdmin && activeTab === 'create-event' && <AdminCreateEvent key="admin-create" onCreated={() => setActiveTab('manage')} />}
          {isAdmin && activeTab === 'manage' && <AdminManageEvents key="admin-manage" />}
        </AnimatePresence>
      </main>

      {/* Bot Interface Access */}
      {!isAdmin && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/mock-interview')}
          className="fixed bottom-10 right-10 bg-[#0F172A] text-white rounded-[2rem] p-6 shadow-2xl shadow-blue-900/40 flex items-center gap-5 hover:bg-blue-600 transition-all duration-500 z-50 group border border-blue-500/20"
        >
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:bg-white/20 transition-all duration-500 shadow-xl border border-white/10">
            <Bot size={32} className="text-white group-hover:rotate-12 transition-transform duration-500" />
          </div>
          <div className="text-left pr-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300 opacity-80 mb-1">Advanced Step</p>
            <p className="text-lg font-black tracking-tight flex items-center gap-2 uppercase">
              Mock Sim <ChevronRight size={20} className="group-hover:translate-x-2 transition-transform duration-500" />
            </p>
          </div>
        </motion.button>
      )}
    </div>
  );
}
