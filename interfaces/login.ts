export interface ILogin {
  jwt: string;
  user: User;
  status: number;
  name: string;
  message: string;
  details: Details;
}

export interface User {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  password: string;
  resetPasswordToken: any;
  confirmationToken: any;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: any;
  accountType: string;
  phone: string;
  walletBalance: number;
  loyaltyPoints: number;
  isVip: boolean;
  role: Role;
  vendor: any;
}

export interface Role {
  id: number;
  documentId: string;
  name: string;
  description: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: any;
}

export interface Details {}
