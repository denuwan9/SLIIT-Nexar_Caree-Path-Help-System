import api from '../api/axios';

// ─── Types ──────────────────────────────────────────────────────────
export interface ISlot {
  _id: string;
  startTime: string;
  endTime: string;
  bookedBy: string | null;
  status: 'available' | 'booked' | 'cancelled' | 'completed';
  notes?: string;
}

export interface ICompany {
  _id: string;
  name: string;
  description?: string;
  interviewers?: string[];
  slots: ISlot[];
}

export interface IInterviewEvent {
  _id: string;
  title: string;
  description?: string;
  eventType: 'career-day' | 'normal-day';
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  slotDurationMinutes: number;
  maxBookingsPerStudent: number;
  requireDifferentCompanies?: boolean;
  companies?: ICompany[];
  companyName?: string;
  slots?: ISlot[];
  maxCandidates?: number;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  targetYear?: number;
  targetMajor?: string;
  totalSlots?: number;
  availableSlots?: number;
  totalBookings?: number;
  organizer?: { firstName: string; lastName: string; email: string };
}

export interface IMyBooking {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventType: string;
  venue: string;
  eventStatus: string;
  companyId: string | null;
  companyName: string;
  slotId: string;
  startTime: string;
  endTime: string;
  slotStatus: string;
}

export interface IEventStats {
  totalEvents: number;
  publishedEvents: number;
  upcomingEvents: number;
  totalSlots: number;
  totalBookings: number;
}

// ─── Career Day Event payload ────────────────────────────────────────
export interface ICreateCareerDayPayload {
  title: string;
  description?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  slotDurationMinutes?: number;
  maxBookingsPerStudent?: number;
  requireDifferentCompanies?: boolean;
  companies: { name: string; description?: string; interviewers?: string[] }[];
  targetYear?: number;
  targetMajor?: string;
}

// ─── Normal Day Event payload ────────────────────────────────────────
export interface ICreateNormalDayPayload {
  title: string;
  description?: string;
  companyName: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  slotDurationMinutes?: number;
  maxCandidates?: number;
  targetYear?: number;
  targetMajor?: string;
}

// ─── API calls ───────────────────────────────────────────────────────

/** Get all events (admin gets all, student gets published only) */
export const getEvents = async (type?: 'career-day' | 'normal-day') => {
  const res = await api.get('/interviews/events', { params: type ? { type } : {} });
  return res.data.data.events as IInterviewEvent[];
};

/** Get a single event by ID */
export const getEventById = async (id: string) => {
  const res = await api.get(`/interviews/events/${id}`);
  return res.data.data.event as IInterviewEvent;
};

/** Admin: get analytics stats */
export const getEventStats = async () => {
  const res = await api.get('/interviews/events/stats');
  return res.data.data as IEventStats;
};

/** Admin: create Career Day event */
export const createCareerDayEvent = async (payload: ICreateCareerDayPayload) => {
  const res = await api.post('/interviews/events/career-day', payload);
  return res.data.data.event as IInterviewEvent;
};

/** Admin: create Normal Day event */
export const createNormalDayEvent = async (payload: ICreateNormalDayPayload) => {
  const res = await api.post('/interviews/events/normal-day', payload);
  return res.data.data.event as IInterviewEvent;
};

/** Admin: publish a draft event */
export const publishEvent = async (id: string) => {
  const res = await api.patch(`/interviews/events/${id}/publish`);
  return res.data.data.event as IInterviewEvent;
};

/** Admin: cancel an event */
export const cancelEvent = async (id: string) => {
  const res = await api.delete(`/interviews/events/${id}`);
  return res.data;
};

/** Admin: hard delete an event */
export const deleteEvent = async (id: string) => {
  const res = await api.delete(`/interviews/events/${id}/delete`);
  return res.data;
};

/** Admin: update editable fields of an event */
export const updateEvent = async (
  id: string,
  payload: {
    title?: string;
    description?: string;
    eventDate?: string;
    startTime?: string;
    endTime?: string;
    venue?: string;
    maxBookingsPerStudent?: number;
    maxCandidates?: number;
    requireDifferentCompanies?: boolean;
  }
) => {
  const res = await api.patch(`/interviews/events/${id}`, payload);
  return res.data.data.event as IInterviewEvent;
};

/** Student: book a slot (career-day needs companyId) */
export const bookSlot = async (eventId: string, slotId: string, companyId?: string) => {
  const res = await api.post(
    `/interviews/events/${eventId}/book/${slotId}`,
    companyId ? { companyId } : {}
  );
  return res.data;
};

/** Student: cancel a booking */
export const cancelBooking = async (eventId: string, slotId: string, companyId?: string) => {
  const res = await api.delete(
    `/interviews/events/${eventId}/book/${slotId}`,
    { data: companyId ? { companyId } : {} }
  );
  return res.data;
};

/** Student: get my bookings */
export const getMyBookings = async () => {
  const res = await api.get('/interviews/events/my-bookings');
  return res.data.data.bookings as IMyBooking[];
};
