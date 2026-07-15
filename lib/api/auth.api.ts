import { API } from './axios';
import { setCookie, eraseCookie } from '../utils';

// ─── Login ────────────────────────────────────────────────────────────────────
export const loginApi = async (credentials: { email: string; password: string }) => {
  const response = await API.post('/login', credentials);
  const data = response.data;

  // Persist the JWT so the request interceptor can attach it automatically
  if (data?.data?.token) {
    localStorage.setItem('authToken', data.data.token);
    setCookie('authToken', data.data.token, 7);
  }

  return data;
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPasswordApi = async (payload: { email: string }) => {
  const response = await API.post('/forgot-password', payload);
  return response.data;
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────
export const verifyOtpApi = async (payload: { email: string; otp: number }) => {
  const response = await API.post('/verify-otp', payload);
  const data = response.data;

  // Store the resetToken returned after successful OTP verification
  if (data?.data?.resetToken) {
    localStorage.setItem('resetToken', data.data.resetToken);
    setCookie('resetToken', data.data.resetToken, 1);
  }

  return data;
};

// ─── Reset Password ───────────────────────────────────────────────────────────
export const resetPasswordApi = async (payload: {
  resetToken: string;
  password: string;
}) => {
  const response = await API.post('/reset-password', payload);
  return response.data;
};

// ─── Update Password (authenticated admin) ────────────────────────────────────
export const updatePasswordApi = async (payload: {
  currentPassword: string;
  newPassword: string;
}) => {
  const response = await API.put('/update-password', payload);
  return response.data;
};

// ─── Logout (local-only) ──────────────────────────────────────────────────────
export const logoutApi = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('resetToken');
  eraseCookie('authToken');
  eraseCookie('resetToken');
};

// ─── Get Profile ──────────────────────────────────────────────────────────────
export const getProfileApi = async () => {
  const response = await API.get('/profile');
  return response.data;
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardData {
  totalUsers: number;
  activeUsers: number;
  attendance: {
    currentlyAtVenues: number;
    todayCheckIns: number;
  };
  analytics: {
    newUsersThisWeek: number;
    venueVisitsThisWeek: number;
    messagesThisWeek: number;
    friendRequestsThisWeek: number;
  };
}

export const getDashboardApi = async (): Promise<DashboardData> => {
  const response = await API.get('/dashboard');
  return response.data?.data as DashboardData;
};

// ─── Activity Trends ──────────────────────────────────────────────────────────
export type TrendPeriod = 'daily' | 'weekly' | 'monthly';

export interface TrendPoint {
  date: string | null;
  newUsers?: number;
  venueVisits?: number;
  messages?: number;
}

export interface ActivityTrendsData {
  period: TrendPeriod;
  trends: TrendPoint[];
}

export const getActivityTrendsApi = async (
  period: TrendPeriod = 'daily'
): Promise<ActivityTrendsData> => {
  const response = await API.get(`/activity-trends?period=${period}`);
  return response.data?.data as ActivityTrendsData;
};

// ─── User Management ──────────────────────────────────────────────────────────
export interface UserProfilePicture {
  _id: string;
  location: string;
  mimetype: string;
  size: number;
}

export interface AdminUser {
  _id: string;
  name: string | null;
  email: string;
  profilePicture: UserProfilePicture | null;
  dob: string | null;
  gender: string | null;
  createdAt: string;
  updatedAt: string;
  role: string;
  isEmailVerified: boolean;
  isProfileCompleted: boolean;
  isDeactivatedByAdmin: boolean;
  banReason: string | null;
  bannedAt: string | null;
}

export interface UsersResponse {
  success: boolean;
  message: string;
  data: AdminUser[];
  pagination: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export const getUsersApi = async (
  page = 1,
  limit = 10,
  filter = "all",
  search = ""
): Promise<UsersResponse> => {
  const params: any = { page, limit };
  if (filter && filter !== "all") {
    params.filter = filter;
  }
  if (search) {
    params.search = search;
  }
  const response = await API.get('/users', { params });
  return response.data;
};

export const getUserByIdApi = async (
  id: string
): Promise<{ success: boolean; message: string; data: AdminUser }> => {
  const response = await API.get(`/users/${id}`);
  return response.data;
};

export const deleteUserApi = async (id: string): Promise<any> => {
  const response = await API.delete(`/users/${id}`);
  return response.data;
};

export const banUserApi = async (
  id: string,
  reason: string
): Promise<any> => {
  const response = await API.patch(`/users/${id}/ban`, {
    reason,
  });
  return response.data;
};

export const unbanUserApi = async (
  id: string
): Promise<any> => {
  const response = await API.patch(`/users/${id}/unban`);
  return response.data;
};

export const updateUserApi = async (
  id: string,
  payload: Partial<AdminUser>
): Promise<any> => {
  const response = await API.put(`/users/${id}`, payload);
  return response.data;
};

export const createUserApi = async (
  payload: any
): Promise<any> => {
  const response = await API.post(`/users`, payload);
  return response.data;
};

// ─── User Activity ────────────────────────────────────────────────────────────
export type ActivityFilter = "history" | "friends" | "message";

export interface ActivityPagination {
  itemsPerPage: number;
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

// history filter
export interface AttendanceItem {
  _id: string;
  venue: {
    _id: string;
    placeId: string;
    name: string;
    address: string;
  };
  venueName: string;
  isActive: boolean;
  joinAt: string;
  leftAt: string | null;
  checkInTime: string;
  checkoutTime: string | null;
}

export interface HistoryActivityResponse {
  data: AttendanceItem[];
  pagination: ActivityPagination;
}

// friends filter
export interface FriendItem {
  _id: string;
  name: string | null;
  email: string;
  profilePicture: UserProfilePicture | null;
  dob: string | null;
  gender: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface FriendsActivityResponse {
  data: FriendItem[];
  totalFriends: number;
  pagination: ActivityPagination;
}

// message filter
export interface MessageItem {
  _id: string;
  content: string;
  type: string;
  timestamp: string;
  createdAt: string;
  chatRoom: {
    _id: string;
    name: string | null;
    isGroup: boolean;
  };
}

export interface MessagesActivityResponse {
  data: MessageItem[];
  totalMessages: number;
  pagination: ActivityPagination;
}

export type ActivityResponseData =
  | HistoryActivityResponse
  | FriendsActivityResponse
  | MessagesActivityResponse;

export const getUserActivityApi = async (
  id: string,
  filter: ActivityFilter = "history",
  page = 1,
  limit = 20
): Promise<{ success: boolean; message: string; data: ActivityResponseData }> => {
  const response = await API.get(
    `/users/${id}/activity?filter=${filter}&page=${page}&limit=${limit}`
  );
  return response.data;
};

// ─── Reports Management ───────────────────────────────────────────────────────
export interface ReportParty {
  _id: string;
  name: string | null;
  email: string;
  profilePicture: any;
}

export interface AdminReport {
  _id: string;
  reportedBy: ReportParty | null;
  reported: {
    _id: string;
    name: string | null;
    email?: string;
    profilePicture?: any;
  } | null;
  type: string;
  targetModel: string;
  action: string;
  reason: string;
  status: string;
  isBlocked: boolean;
  isReported: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReportsResponse {
  success: boolean;
  message: string;
  data: AdminReport[];
  pagination: {
    itemsPerPage: number;
    currentPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export const getReportsApi = async (
  page = 1,
  limit = 10,
  search = "",
  status = "",
  action = "",
  type = ""
): Promise<ReportsResponse> => {
  const params: any = { page, limit };
  if (search) params.search = search;
  if (status) params.status = status;
  if (action) params.action = action;
  if (type) params.type = type;

  const response = await API.get('/reports', { params });
  return response.data;
};

export const getReportByIdApi = async (
  id: string
): Promise<{ success: boolean; message: string; data: AdminReport }> => {
  const response = await API.get(`/reports/${id}`);
  return response.data;
};

export interface UpdateReportPayload {
  action: "accept" | "reject";
  status: "resolve";
  banUser?: boolean;
  reason: string;
}

export const updateReportApi = async (
  id: string,
  payload: UpdateReportPayload
): Promise<any> => {
  const response = await API.patch(`/reports/${id}`, payload);
  return response.data;
};