export interface IUser {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider?: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  accountType?: string;
  phone?: string;
  walletBalance?: number;
  loyaltyPoints?: number;
  isVip?: boolean;
}
