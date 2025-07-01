import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import toast from "react-hot-toast";

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and show message
      localStorage.removeItem("token");
      toast.error("Session expired. Please login again.");
      // Redirect to login page
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      toast.error("Access denied. You do not have permission for this action.");
    } else if (error.response?.status >= 500) {
      toast.error("Server error. Please try again later.");
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error("An error occurred. Please try again.");
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "client" | "freelancer" | "admin";
  profile?: {
    bio?: string;
    skills?: string[];
    hourlyRate?: number;
    rating?: number;
    totalReviews?: number;
    completedJobs?: number;
    totalEarnings?: number;
  };
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  skills: string[];
  budget: {
    min: number;
    max: number;
    type: "fixed" | "hourly";
  };
  duration: {
    value: number;
    unit: "hours" | "days" | "weeks" | "months";
  };
  experienceLevel: "entry" | "intermediate" | "expert";
  projectType: "one-time" | "ongoing";
  client: User;
  status: "open" | "in-progress" | "completed" | "cancelled";
  visibility: "public" | "private" | "invite-only";
  attachments: string[];
  location: {
    type: "remote" | "onsite" | "hybrid";
    address?: string;
    city?: string;
    country?: string;
  };
  isUrgent: boolean;
  isFeatured: boolean;
  views: number;
  proposalsCount: number;
  hiredFreelancer?: User;
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: User;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  job: Job;
  freelancer: User;
  coverLetter: string;
  proposedAmount: number;
  estimatedDuration: number;
  attachments: string[];
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  createdAt: string;
  updatedAt: string;
}

export interface Contract {
  id: string;
  job: Job;
  client: User;
  freelancer: User;
  proposal: Proposal;
  amount: number;
  startDate: string;
  endDate?: string;
  status: "active" | "completed" | "cancelled" | "disputed";
  milestones: Milestone[];
  totalHours?: number;
  totalAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  completedAt?: string;
}

export interface Message {
  id: string;
  contract: Contract;
  sender: User;
  content: string;
  attachments: string[];
  readAt?: string;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  contract: Contract;
  freelancer: User;
  date: string;
  hours: number;
  description: string;
  status: "pending" | "approved" | "rejected";
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
}

// Auth API
export const authAPI = {
  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    role: "freelancer" | "client";
  }) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.post("/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  updateProfile: async (profileData: Partial<User>) => {
    const response = await api.put("/auth/profile", profileData);
    return response.data;
  },

  changePassword: async (passwords: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await api.put("/auth/change-password", passwords);
    return response.data;
  },
};

// Jobs API
export const jobsAPI = {
  getJobs: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    budget?: { min?: number; max?: number };
    skills?: string[];
    experienceLevel?: string;
    projectType?: string;
    location?: string;
    search?: string;
  }) => {
    const response = await api.get("/jobs", { params });
    return response.data;
  },

  getJob: async (id: string) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  createJob: async (jobData: Partial<Job>) => {
    const response = await api.post("/jobs", jobData);
    return response.data;
  },

  updateJob: async (id: string, jobData: Partial<Job>) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  deleteJob: async (id: string) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  getMyJobs: async () => {
    const response = await api.get("/jobs/my-jobs");
    return response.data;
  },
};

// Proposals API
export const proposalsAPI = {
  getProposals: async (jobId?: string) => {
    const params = jobId ? { jobId } : {};
    const response = await api.get("/proposals", { params });
    return response.data;
  },

  getProposal: async (id: string) => {
    const response = await api.get(`/proposals/${id}`);
    return response.data;
  },

  createProposal: async (proposalData: {
    jobId: string;
    coverLetter: string;
    proposedAmount: number;
    estimatedDuration: number;
    attachments?: string[];
  }) => {
    const response = await api.post("/proposals", proposalData);
    return response.data;
  },

  updateProposal: async (id: string, proposalData: Partial<Proposal>) => {
    const response = await api.put(`/proposals/${id}`, proposalData);
    return response.data;
  },

  deleteProposal: async (id: string) => {
    const response = await api.delete(`/proposals/${id}`);
    return response.data;
  },

  acceptProposal: async (id: string) => {
    const response = await api.put(`/proposals/${id}/accept`);
    return response.data;
  },

  rejectProposal: async (id: string) => {
    const response = await api.put(`/proposals/${id}/reject`);
    return response.data;
  },

  withdrawProposal: async (id: string) => {
    const response = await api.put(`/proposals/${id}/withdraw`);
    return response.data;
  },
};

// Contracts API
export const contractsAPI = {
  getContracts: async () => {
    const response = await api.get("/contracts");
    return response.data;
  },

  getContract: async (id: string) => {
    const response = await api.get(`/contracts/${id}`);
    return response.data;
  },

  createContract: async (contractData: {
    proposalId: string;
    amount: number;
    startDate: string;
    endDate?: string;
  }) => {
    const response = await api.post("/contracts", contractData);
    return response.data;
  },

  updateContract: async (id: string, contractData: Partial<Contract>) => {
    const response = await api.put(`/contracts/${id}`, contractData);
    return response.data;
  },

  completeContract: async (id: string) => {
    const response = await api.put(`/contracts/${id}/complete`);
    return response.data;
  },

  cancelContract: async (id: string, reason?: string) => {
    const response = await api.put(`/contracts/${id}/cancel`, { reason });
    return response.data;
  },
};

// Messages API
export const messagesAPI = {
  getMessages: async (contractId: string) => {
    const response = await api.get(`/messages?contractId=${contractId}`);
    return response.data;
  },

  sendMessage: async (messageData: {
    contractId: string;
    content: string;
    attachments?: string[];
  }) => {
    const response = await api.post("/messages", messageData);
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.put(`/messages/${id}/read`);
    return response.data;
  },
};

// Time Tracking API
export const timeTrackingAPI = {
  getTimeEntries: async (contractId: string) => {
    const response = await api.get(`/time-tracking?contractId=${contractId}`);
    return response.data;
  },

  createTimeEntry: async (timeEntryData: {
    contractId: string;
    date: string;
    hours: number;
    description: string;
  }) => {
    const response = await api.post("/time-tracking", timeEntryData);
    return response.data;
  },

  updateTimeEntry: async (id: string, timeEntryData: Partial<TimeEntry>) => {
    const response = await api.put(`/time-tracking/${id}`, timeEntryData);
    return response.data;
  },

  deleteTimeEntry: async (id: string) => {
    const response = await api.delete(`/time-tracking/${id}`);
    return response.data;
  },

  approveTimeEntry: async (id: string) => {
    const response = await api.put(`/time-tracking/${id}/approve`);
    return response.data;
  },

  rejectTimeEntry: async (id: string, reason?: string) => {
    const response = await api.put(`/time-tracking/${id}/reject`, { reason });
    return response.data;
  },
};

// Payments API
export const paymentsAPI = {
  getWallet: async () => {
    const response = await api.get("/payments/wallet");
    return response.data;
  },

  getTransactions: async () => {
    const response = await api.get("/payments/transactions");
    return response.data;
  },

  addFunds: async (amount: number, paymentMethod: string) => {
    const response = await api.post("/payments/add-funds", {
      amount,
      paymentMethod,
    });
    return response.data;
  },

  withdrawFunds: async (amount: number, accountDetails: any) => {
    const response = await api.post("/payments/withdraw", {
      amount,
      accountDetails,
    });
    return response.data;
  },

  releasePayment: async (contractId: string, amount: number) => {
    const response = await api.post("/payments/release", {
      contractId,
      amount,
    });
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) => {
    const response = await api.get("/users", { params });
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, userData: Partial<User>) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// File Upload API
export const fileUploadAPI = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  uploadMultipleFiles: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    const response = await api.post("/upload/multiple", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export default api;
