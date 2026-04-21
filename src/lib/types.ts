


export interface Car {
  id: string;
  carType: string;
  imageUrl: string;
  imageHint: string;
  capacity: number;
  oneWayRate: number;
  roundTripRate: number;
  airportTransferRate: number;
  driverAllowance: number;
  description: string;
}

export interface Customer {
  name: string;
  mobile: string;
  email: string;
  uid: string | null;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  pickupLocation: string;
  dropLocation: string;
  status: BookingStatus;
  carType?: string;
  estimatedFare?: number;
  customer?: Customer;
  driverId?: string;
  createdAt: Date | string;
  car?: Car;
  passengers?: number;
  pickupDate?: string;
  pickupTime?: string;
  driverName?: string;
  driverNo?: string;
  carNo?: string;
  rideType?: string;
  tollCharges?: string | number;
  taxes?: string; // Serialized TaxItem[]
  subTotal?: number;
  tax?: string; // Legacy field, can be removed later
}

export interface Driver {
  id: string;
  name: string;
  vehicle: string;
  phone: string;
  totalBookings: number;
  lastSeen: Date;
}

export interface WebLogin {
  id: string;
  userId: string;
  photoUrl?: string;
  deviceName: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  location: string;
  ipAddress: string;
  timestamp: Date;
  timeSpent: string;
}

export interface CustomerDetail {
  id: string; 
  name: string;
  email: string;
  phone: string;
  bookingsCount: number;
  lastSeen?: Date;
  uid: string;
}

export interface RedirectLinking {
    id: string;
    page: string;
    link: string;
    clicks: number;
}

export interface Location {
    lat: number;
    lng: number;
}


export interface ContactDetails {
  phone: string;
  email: string;
  whatsapp: string;
  instagram: string;
  facebook?: string;
  enquiryWhatsappMessage: string;
  emailSubject: string;
  emailBody: string;
}

export interface UserReport {
    id?: string; // Firestore ID
    reportId: string;
    timestamp: Date;
    name: string;
    email: string;
    mobile: string;
    category: 'driver' | 'payment' | 'service' | 'missing';
    report: string;
    bookingId?: string;
    vehicleNumber?: string;
    driverMobile?: string;
    tripDate?: string;
    paymentNumber?: string;
    transactionId?: string;
    paymentDate?: string;
}

export interface UserFeedback {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  feedback: string;
  rating: number;
}

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  isBanner?: boolean;
  redirectUrl?: string;
  objectFit?: 'cover' | 'contain';
  bgColor?: string;
  duration?: number;
  startDate?: string;
  endDate?: string;
};

export interface TripPlan {
  id: string;
  timestamp: Date;
  name: string;
  phone: string;
  email: string;
  carType: string;
  passengers: string;
  from: string;
  to: string;
  numberOfDays?: string;
}

export interface StatePermitCharge {
    state: string;
    charge: string | number;
    capacity?: number;
}

export interface TaxItem {
    id: string;
    name: string;
    value: string | number;
    enabled: boolean;
}

export interface TaxesAndCharges {
  tollCharges: string | number;
  taxes: TaxItem[];
  statePermitCharges: StatePermitCharge[];
}

export interface InclusionsExclusions {
  inclusions: string[];
  exclusions: string[];
}

export type ButtonRedirectAction = 'whatsapp' | 'email' | 'instagram' | 'phone' | 'facebook';

export interface ButtonSettings {
    enquireNowAction: ButtonRedirectAction;
}

export interface TollPlaza {
    "Plaza Code": number;
    "Plaza Name": string;
    "Latitude": number;
    "Longitude": number;
    [key: string]: any;
}

export interface UserRole {
    uid: string;
    email: string;
    name: string;
    role: 'Admin' | 'Sub-Admin';
    permissions: string[];
}

export interface Offer {
    id: string;
    title: string;
    description: string;
    code: string;
    offerType: 'coupon' | 'admin';
    targetAudience?: 'all' | 'signed-in';
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
}
    
    