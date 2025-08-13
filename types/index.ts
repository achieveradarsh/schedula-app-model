export interface LoginForm {
  emailOrMobile: string
  password?: string
}

export interface SignupForm {
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: "patient" | "doctor"
  avatar?: string
  profilePicture?: string
  verified?: boolean
  createdAt?: string
}

export interface Doctor {
  id: string
  name: string
  email: string
  phone: string
  role: "doctor"
  specialization: string
  qualification: string
  experience: string
  location: string
  consultationFee: number
  rating: number
  reviews: number
  patients: string
  about: string
  services: string[]
  availability: {
    days: string
    hours: string
  }
  verified: boolean
  hospitalAffiliation: string
  languages: string[]
  awards?: string[]
  avatar?: string
  createdAt?: string
}

export interface Appointment {
  id: string
  doctorId: string
  patientId: string
  patientName: string
  patientPhone: string
  date: string
  timeSlot: string
  status: "scheduled" | "completed" | "cancelled" | "rescheduled"
  symptoms: string
  consultationFee: number
  consultationType: "online" | "offline"
  tokenNumber: string
  paymentStatus: "pending" | "completed" | "failed"
  medicalDocuments?: string[]
  doctor?: Doctor
  cancelReason?: string
  prescription?: string
  createdAt?: string
  updatedAt?: string
  rescheduledBy?: "doctor" | "patient"
  rescheduledAt?: string
  originalDate?: string
  originalTimeSlot?: string
  rescheduledCount?: number
}

export interface AppointmentForm {
  patientName: string
  patientPhone: string
  symptoms: string
  date: string
  timeSlot: string
}

export interface TimeSlot {
  id: string
  time: string
  available: boolean
  type: "morning" | "afternoon" | "evening"
}

export interface PaymentDetails {
  consultationFee: number
  platformFee: number
  taxes: number
  total: number
}

export interface MedicalRecord {
  id: string
  patientId: string
  doctorId: string
  appointmentId: string
  date: string
  diagnosis: string
  treatment: string
  medications: string[]
  nextVisit?: string
  documents?: string[]
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "appointment" | "reminder" | "system"
  read: boolean
  createdAt: string
}

export interface Medicine {
  id: string
  name: string
  dosage: string
  duration: string
  frequency: string
  notes?: string
}

export interface Prescription {
  id: string
  doctorId: string
  patientId: string
  appointmentId: string
  patientName: string
  patientPhone: string
  medicines: Medicine[]
  diagnosis?: string
  instructions?: string
  status: "active" | "completed" | "cancelled"
  createdAt: string
  updatedAt: string
  appointmentDate: string
  followUpDate?: string
}

export interface PrescriptionForm {
  medicines: Medicine[]
  diagnosis: string
  instructions: string
  followUpDate?: string
}

export interface Review {
  id: string
  appointmentId: string
  patientId: string
  doctorId: string
  patientName: string
  doctorName: string
  rating: number // 1-5 stars
  reviewText: string
  createdAt: string
  updatedAt: string
  appointmentDate: string
  canEdit: boolean // true if within 24 hours
}

export interface ReviewForm {
  appointmentId: string
  rating: number
  reviewText: string
}

export interface DoctorReviewStats {
  doctorId: string
  totalReviews: number
  averageRating: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  ratingPercentages: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

export interface MedicalHistory {
  patientId: string
  patientName: string
  patientEmail: string
  patientPhone: string
  totalAppointments: number
  totalPrescriptions: number
  appointments: AppointmentHistoryItem[]
  dateRange?: {
    startDate: string
    endDate: string
  }
}

export interface AppointmentHistoryItem {
  id: string
  date: string
  doctorName: string
  doctorId: string
  status: string
  consultationType: string
  diagnosis?: string
  prescription?: {
    id: string
    medicines: Medicine[]
    instructions?: string
  }
}
