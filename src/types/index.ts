export type UserRole = 'entrepreneur' | 'investor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  bio: string;
  isOnline?: boolean;
  createdAt: string;
}

export interface Entrepreneur extends User {
  role: 'entrepreneur';
  startupName: string;
  pitchSummary: string;
  fundingNeeded: string;
  industry: string;
  location: string;
  foundedYear: number;
  teamSize: number;
}

export interface Investor extends User {
  role: 'investor';
  investmentInterests: string[];
  investmentStage: string[];
  portfolioCompanies: string[];
  totalInvestments: number;
  minimumInvestment: string;
  maximumInvestment: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: string;
}

export interface CollaborationRequest {
  id: string;
  investorId: string;
  entrepreneurId: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  shared: boolean;
  url: string;
  ownerId: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  updateProfile: (userId: string, updates: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AvailabilitySlot {
  id: string;
  userId: string;
  startTime: string; // ISO datetime string
  endTime: string; // ISO datetime string
  dayOfWeek?: number; // 0-6 for recurring slots
  isRecurring?: boolean;
  createdAt: string;
}

export interface MeetingRequest {
  id: string;
  requesterId: string;
  requesteeId: string;
  slotId?: string; // If requesting a specific slot
  startTime: string; // ISO datetime string
  endTime: string; // ISO datetime string
  title: string;
  description: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  requesterId: string;
  requesteeId: string;
  startTime: string; // ISO datetime string
  endTime: string; // ISO datetime string
  title: string;
  description: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number; // in cents or smallest currency unit
  currency: string; // 'USD', 'EUR', etc.
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'deposit' | 'withdraw' | 'transfer' | 'funding' | 'payment';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number; // in cents
  currency: string;
  senderId?: string; // For transfers and funding
  receiverId?: string; // For transfers and funding
  description: string;
  status: TransactionStatus;
  metadata?: {
    dealId?: string;
    paymentMethod?: string;
    reference?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FundingDeal {
  id: string;
  investorId: string;
  entrepreneurId: string;
  amount: number; // in cents
  currency: string;
  equity: number; // percentage
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  description: string;
  createdAt: string;
  updatedAt: string;
}