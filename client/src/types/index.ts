export type Role = 'admin' | 'volunteer';

export type User = { id: number; email: string; role: Role; volunteerId?: number | null };

export type VolunteerStatus = 'active' | 'pending' | 'inactive';

export type Volunteer = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  dateOfBirth?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  skills: string[];
  interests: string[];
  languages: string[];
  availability: Record<string, unknown>;
  preferredDays?: string | null;
  preferredTimes?: string | null;
  previousExperience?: string | null;
  status: VolunteerStatus;
  totalHours: number;
  notes?: string | null;
  avatarUrl?: string | null;
  documentUrl?: string | null;
  createdAt: string;
};

export type EventStatus = 'draft' | 'open' | 'full' | 'completed' | 'cancelled';

export type Event = {
  id: number;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string | null;
  description?: string | null;
  requiredVolunteers: number;
  status: EventStatus;
  coordinator?: string | null;
  notes?: string | null;
  createdAt: string;
};

export type ShiftStatus = 'open' | 'full' | 'completed' | 'cancelled';

export type Shift = {
  id: number;
  eventId: number;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  requiredVolunteers: number;
  status: ShiftStatus;
  assignedVolunteerIds?: number[];
  openSpots?: number;
};

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export type Attendance = {
  id: number;
  volunteerId: number;
  eventId: number;
  shiftId?: number | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  totalHours: number;
  status: AttendanceStatus;
  notes?: string | null;
};

export type Message = {
  id: number;
  scope: 'individual' | 'event' | 'all';
  recipientVolunteerId?: number | null;
  recipientEventId?: number | null;
  subject: string;
  body: string;
  sentAt: string;
};

export type Settings = {
  id: number;
  organizationName: string;
  logoUrl?: string | null;
  volunteerStatuses: string[];
  eventCategories: string[];
  notificationsEnabled: boolean;
};

export type DashboardSummary = {
  totalVolunteers: number;
  activeVolunteers: number;
  pendingApplications: number;
  upcomingEvents: number;
  openShifts: number;
  totalHours: number;
  hoursByMonth: { month: string; hours: number }[];
  recentActivity: Attendance[];
};
