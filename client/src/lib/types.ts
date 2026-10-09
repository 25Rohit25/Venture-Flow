export type UserRole = 'FOUNDER' | 'INVESTOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export type IndustryType = 'FINTECH' | 'HEALTHTECH' | 'EDTECH' | 'SAAS' | 'ECOMMERCE' | 'OTHER';
export type StageType = 'IDEA' | 'MVP' | 'EARLY_REVENUE' | 'GROWTH';
export type StartupStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Startup {
  _id: string;
  founderId: {
    _id: string;
    name: string;
  } | string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  industry: IndustryType;
  stage: StageType;
  targetAmount: number;
  location?: string;
  status: StartupStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type InterestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN';

export interface Interest {
  _id: string;
  startupId: Startup | string;
  investorId: {
    _id: string;
    name: string;
  } | string;
  message: string;
  status: InterestStatus;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  _id: string;
  startupId: Startup;
  investorId: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface FounderDashboardData {
  stats: {
    totalStartups: number;
    publishedStartups: number;
    draftStartups: number;
    archivedStartups: number;
    pendingInterests: number;
    acceptedInterests: number;
    declinedInterests: number;
    totalInterestsReceived: number;
  };
  recentInterests: Interest[];
  activityLast7Days: Array<{ date: string; count: number }>;
}

export interface InvestorDashboardData {
  stats: {
    totalSubmitted: number;
    pending: number;
    accepted: number;
    declined: number;
    withdrawn: number;
    savedBookmarks: number;
  };
  recentInterests: Interest[];
  savedStartups: Bookmark[];
  activityLast7Days: Array<{ date: string; count: number }>;
}
