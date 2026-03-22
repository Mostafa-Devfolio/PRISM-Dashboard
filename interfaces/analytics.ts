export interface IAnalytics {
  global: Global;
  fraudAndRisk: FraudAndRisk;
  liveOperations: LiveOperations;
  timeAndSla: TimeAndSla;
  geospatial: Geospatial;
  ecommerce: Ecommerce;
  transportation: Transportation;
  propertiesAndServices: PropertiesAndServices;
}

export interface Global {
  totalAdminRevenue: number;
  walletLiabilities: number;
  outstandingLoyaltyPoints: number;
}

export interface FraudAndRisk {
  flaggedUsers: any[];
  flaggedDrivers: any[];
}

export interface LiveOperations {
  stuckOrdersWarning: number;
  activeSupportTickets: number;
  liveFleet: LiveFleet;
}

export interface LiveFleet {
  offline: number;
  available: number;
  on_trip: number;
}

export interface TimeAndSla {
  averageDeliveryMinutes: string;
  driverCancellationRatePercent: string;
  orderRefundRatePercent: string;
}

export interface Geospatial {
  rideHeatmapLocations: any[];
  propertyRevenueByCity: PropertyRevenueByCity[];
}

export interface PropertyRevenueByCity {
  city: string;
  revenue: number;
}

export interface Ecommerce {
  overview: Overview;
  topVendorsByRevenue: TopVendorsByRevenue[];
  bestRatedVendors: BestRatedVendor[];
  mostSoldProducts: MostSoldProduct[];
  topCustomers: TopCustomer[];
  monthlyTrends: any[];
}

export interface Overview {
  grossVolume: number;
  adminCommission: number;
  vendorPayouts: number;
  totalDeliveryFees: number;
}

export interface TopVendorsByRevenue {
  id: number;
  name: string;
  rating: number;
  total_orders: number;
  total_revenue: number;
}

export interface BestRatedVendor {
  id: number;
  name: string;
  rating: number;
}

export interface MostSoldProduct {
  id: number;
  title: string;
  times_sold: number;
  revenue_generated: number;
}

export interface TopCustomer {
  id: number;
  username: string;
  email: string;
  total_orders: number;
  total_spent: number;
}

export interface Transportation {
  financials: Financials;
  topDrivers: any[];
  bestRatedDrivers: any[];
  moduleActivity: ModuleActivity;
}

export interface Financials {
  taxi: Taxi;
  courier: Courier;
}

export interface Taxi {
  grossVolume: number;
  adminRevenue: number;
  driverPayouts: number;
}

export interface Courier {
  grossVolume: number;
  adminRevenue: number;
}

export interface ModuleActivity {
  totalTaxiTrips: number;
  totalParcelDeliveries: number;
  totalBusTrips: number;
}

export interface PropertiesAndServices {
  financials: Financials2;
  topProperties: any[];
  bestRatedProperties: BestRatedProperty[];
  topWorkers: any[];
  popularServiceCategories: any[];
}

export interface Financials2 {
  properties: Properties;
  services: Services;
}

export interface Properties {
  grossVolume: number;
  adminRevenue: number;
  hostPayouts: number;
}

export interface Services {
  grossVolume: number;
  adminRevenue: number;
  workerPayouts: number;
}

export interface BestRatedProperty {
  id: number;
  name: string;
  property_type: string;
  city?: string;
  star_rating: number;
}
