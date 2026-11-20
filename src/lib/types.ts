export type Role = "admin" | "customer";

export interface Me {
  id: string;
  name: string;
  email: string;
  image: string;
  phone: string;
  role: Role;
  isBlocked: boolean;
  createdAt?: string;
}

export interface Service {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image: string;
  status: "active" | "inactive";
  createdAt: string;
}

export type AppointmentStatus = "pending" | "confirmed" | "cancelled";
export type PaymentStatus = "unpaid" | "paid";

export interface Appointment {
  _id: string;
  serviceId: string;
  customerId: string;
  appointmentDate: string;
  timeSlot: string;
  message?: string;
  servicePrice: number;
  paymentStatus: PaymentStatus;
  status: AppointmentStatus;
  createdAt: string;
  service?: { _id: string; serviceName: string; category: string; image: string; duration: number; price: number; status: string };
  customer?: { _id: string; name: string; email: string; image?: string; phone?: string };
}

export interface Transaction {
  _id: string;
  appointmentId: string;
  amount: number;
  currency: string;
  stripeSessionId: string;
  status: "paid" | "failed";
  createdAt: string;
  appointmentDate?: string;
  timeSlot?: string;
  serviceName?: string;
  customer?: { _id: string; name: string; email: string; image?: string };
}
