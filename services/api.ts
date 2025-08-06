import axios from "axios"
import type { Doctor, Appointment, User, Prescription, Medicine } from "@/types"

const API_BASE_URL = "http://localhost:4000"

// Test Credentials for Easy Testing - FIXED AND EXPANDED
export const TEST_CREDENTIALS = {
  patient: {
    email: "patient@example.com",
    password: "password",
    phone: "1234567890",
  },
  doctor: {
    email: "doctor@example.com",
    password: "password",
    phone: "9876543210",
  },
  // NEW: Dr. Priya Sharma credentials
  priya: {
    email: "priya.sharma@schedula.com",
    password: "password",
    phone: "9876543215",
  },
}

// FIXED: Enhanced Mock Users with proper mapping
const mockUsers: User[] = [
  {
    id: "patient1",
    name: "John Patient",
    email: "patient@example.com",
    phone: "1234567890",
    role: "patient",
    avatar: "/placeholder.svg?height=100&width=100&text=JP",
    createdAt: "2023-01-15T00:00:00Z",
  },
  {
    id: "doctor1",
    name: "Dr. Adarsh Babu",
    email: "doctor@example.com",
    phone: "9876543210",
    role: "doctor",
    avatar: "/placeholder.svg?height=100&width=100&text=AB",
    createdAt: "2023-01-15T00:00:00Z",
  },
  {
    id: "doctor2",
    name: "Dr. Priya Sharma",
    email: "priya.sharma@schedula.com",
    phone: "9876543215",
    role: "doctor",
    avatar: "/placeholder.svg?height=100&width=100&text=PS",
    createdAt: "2023-02-20T00:00:00Z",
  },
]

// FIXED: Enhanced Mock Doctors with proper IDs matching users
const mockDoctors: Doctor[] = [
  {
    id: "doctor1",
    name: "Dr. Adarsh Babu",
    email: "doctor@example.com",
    phone: "+91 9876543210",
    role: "doctor",
    specialization: "Ophthalmologist",
    qualification: "MBBS, MS (Ophthalmology), Fellowship in Retinal Surgery",
    experience: "10+",
    rating: 4.8,
    reviews: 4942,
    patients: "5,000+",
    about:
      "15+ years of experience in all aspects of ophthalmology, including non-invasive and interventional procedures. Fellow of Sanskara netralaya, chennai. Specialized in cataract surgery, retinal disorders, and pediatric ophthalmology.",
    services: ["Cataract Surgery", "Retinal Treatment", "Eye Consultation", "Pediatric Eye Care", "Laser Surgery"],
    availability: {
      days: "Monday to Friday",
      hours: "10:00 AM - 5:00 PM",
    },
    location: "Dombivali, Mumbai",
    consultationFee: 800,
    languages: ["English", "Hindi", "Marathi"],
    verified: true,
    hospitalAffiliation: "Apollo Hospitals, Mumbai",
    awards: ["Best Ophthalmologist 2023", "Excellence in Patient Care"],
    avatar: "/placeholder.svg?height=100&width=100&text=AB",
    createdAt: "2023-01-15T00:00:00Z",
  },
  {
    id: "doctor2",
    name: "Dr. Priya Sharma",
    email: "priya.sharma@schedula.com",
    phone: "+91 9876543215",
    role: "doctor",
    specialization: "Cardiologist",
    qualification: "MBBS, MD (Cardiology), DM (Interventional Cardiology)",
    experience: "8+",
    rating: 4.7,
    reviews: 3245,
    patients: "3,500+",
    about:
      "Experienced cardiologist with expertise in preventive cardiology and interventional procedures. Specialized in heart disease prevention, cardiac catheterization, and heart failure management. Published researcher with 25+ papers in international journals.",
    services: ["Heart Consultation", "ECG", "Echocardiography", "Cardiac Catheterization", "Angioplasty"],
    availability: {
      days: "Monday to Saturday",
      hours: "9:00 AM - 6:00 PM",
    },
    location: "Andheri, Mumbai",
    consultationFee: 1200,
    languages: ["English", "Hindi", "Gujarati"],
    verified: true,
    hospitalAffiliation: "Fortis Hospital, Mumbai",
    awards: ["Cardiology Excellence Award 2022", "Women in Medicine Award"],
    avatar: "/placeholder.svg?height=100&width=100&text=PS",
    createdAt: "2023-02-20T00:00:00Z",
  },
  {
    id: "doctor3",
    name: "Dr. Rajesh Patel",
    email: "rajesh.patel@schedula.com",
    phone: "+91 9876543212",
    role: "doctor",
    specialization: "Dermatologist",
    qualification: "MBBS, MD (Dermatology), Fellowship in Cosmetic Dermatology",
    experience: "12+",
    rating: 4.9,
    reviews: 2156,
    patients: "4,200+",
    about:
      "Specialist in skin disorders, cosmetic dermatology, and laser treatments. Expert in treating acne, psoriasis, eczema, and various skin conditions. Advanced training in aesthetic procedures and anti-aging treatments.",
    services: ["Skin Consultation", "Acne Treatment", "Laser Therapy", "Cosmetic Procedures", "Anti-aging Treatment"],
    availability: {
      days: "Tuesday to Sunday",
      hours: "11:00 AM - 7:00 PM",
    },
    location: "Koregaon Park, Pune",
    consultationFee: 1000,
    languages: ["English", "Hindi", "Marathi"],
    verified: true,
    hospitalAffiliation: "Ruby Hall Clinic, Pune",
    awards: ["Best Dermatologist Pune 2023", "Innovation in Cosmetic Dermatology"],
    avatar: "/placeholder.svg?height=100&width=100&text=RP",
    createdAt: "2023-03-10T00:00:00Z",
  },
]

// FIXED: Enhanced Mock Appointments with different statuses and proper sync
const mockAppointments: Appointment[] = [
  // Today's appointments
  {
    id: "apt1",
    doctorId: "doctor1",
    patientId: "patient1",
    patientName: "John Patient",
    patientPhone: "+91 1234567890",
    date: new Date().toISOString().split("T")[0], // Today
    timeSlot: "10:00 AM - 10:15 AM",
    status: "scheduled",
    symptoms: "Blurred vision and eye strain from prolonged computer use",
    consultationFee: 800,
    consultationType: "offline",
    tokenNumber: "T001",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    paymentStatus: "completed",
  },
  {
    id: "apt2",
    doctorId: "doctor2",
    patientId: "patient1",
    patientName: "John Patient",
    patientPhone: "+91 1234567890",
    date: new Date().toISOString().split("T")[0], // Today
    timeSlot: "2:00 PM - 2:15 PM",
    status: "scheduled",
    symptoms: "Chest pain and shortness of breath during exercise",
    consultationFee: 1200,
    consultationType: "online",
    tokenNumber: "T002",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    paymentStatus: "completed",
  },
  // Completed appointments
  {
    id: "apt3",
    doctorId: "doctor1",
    patientId: "patient1",
    patientName: "John Patient",
    patientPhone: "+91 1234567890",
    date: "2024-01-10",
    timeSlot: "11:00 AM - 11:15 AM",
    status: "completed",
    symptoms: "Regular eye checkup and vision screening",
    consultationFee: 800,
    consultationType: "offline",
    tokenNumber: "T003",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-10T11:30:00Z",
    paymentStatus: "completed",
    prescription: "Prescribed reading glasses and eye drops",
  },
  {
    id: "apt4",
    doctorId: "doctor2",
    patientId: "patient1",
    patientName: "John Patient",
    patientPhone: "+91 1234567890",
    date: "2024-01-08",
    timeSlot: "3:30 PM - 3:45 PM",
    status: "completed",
    symptoms: "High blood pressure monitoring",
    consultationFee: 1200,
    consultationType: "online",
    tokenNumber: "T004",
    createdAt: "2024-01-08T00:00:00Z",
    updatedAt: "2024-01-08T16:00:00Z",
    paymentStatus: "completed",
    prescription: "Prescribed BP medication and lifestyle changes",
  },
  // Cancelled appointments
  {
    id: "apt5",
    doctorId: "doctor3",
    patientId: "patient1",
    patientName: "John Patient",
    patientPhone: "+91 1234567890",
    date: "2024-01-05",
    timeSlot: "4:00 PM - 4:15 PM",
    status: "cancelled",
    symptoms: "Skin rash and irritation",
    consultationFee: 1000,
    consultationType: "offline",
    tokenNumber: "T005",
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-05T10:00:00Z",
    paymentStatus: "completed",
    cancelReason: "Patient had to travel urgently",
  },
  {
    id: "apt6",
    doctorId: "doctor1",
    patientId: "patient1",
    patientName: "John Patient",
    patientPhone: "+91 1234567890",
    date: "2024-01-03",
    timeSlot: "9:30 AM - 9:45 AM",
    status: "cancelled",
    symptoms: "Follow-up consultation",
    consultationFee: 800,
    consultationType: "online",
    tokenNumber: "T006",
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T08:00:00Z",
    paymentStatus: "completed",
    cancelReason: "Doctor had emergency surgery",
  },
  // Rescheduled appointments
  {
    id: "apt7",
    doctorId: "doctor1",
    patientId: "patient1",
    patientName: "Sarah Wilson",
    patientPhone: "+91 9876543211",
    date: getTomorrowDate(), // Tomorrow
    timeSlot: "2:30 PM - 2:45 PM",
    status: "rescheduled",
    symptoms: "doctor tooltip checker",
    consultationFee: 800,
    consultationType: "offline",
    tokenNumber: "T007",
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: new Date().toISOString(),
    paymentStatus: "completed",
    rescheduledBy: "patient",
    rescheduledAt: "2024-01-15T14:30:00Z",
    originalDate: "2024-01-15",
    originalTimeSlot: "10:00 AM - 10:15 AM",
    rescheduledCount: 1,
  },
  {
    id: "apt8",
    doctorId: "doctor2",
    patientId: "patient1",
    patientName: "Michael Brown",
    patientPhone: "+91 9876543212",
    date: getAfterTomorrowDate(), // Day after tomorrow
    timeSlot: "11:00 AM - 11:15 AM",
    status: "rescheduled",
    symptoms: "Heart palpitations and anxiety symptoms",
    consultationFee: 1200,
    consultationType: "online",
    tokenNumber: "T008",
    createdAt: "2024-01-14T00:00:00Z",
    updatedAt: new Date().toISOString(),
    paymentStatus: "completed",
    rescheduledBy: "doctor",
    rescheduledAt: "2024-01-16T09:15:00Z",
    originalDate: "2024-01-16",
    originalTimeSlot: "9:00 AM - 9:15 AM",
    rescheduledCount: 2,
  },
]

// Helper functions for dynamic dates
function getTomorrowDate(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split("T")[0]
}

function getAfterTomorrowDate(): string {
  const afterTomorrow = new Date()
  afterTomorrow.setDate(afterTomorrow.getDate() + 2)
  return afterTomorrow.toISOString().split("T")[0]
}

// FIXED: Proper API simulation with delays
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
})

// FIXED: Authentication Service with proper credential checking
export const authService = {
  login: async (credentials: { email: string; password: string; userType: "patient" | "doctor" }): Promise<{
    success: boolean
    user: User
  }> => {
    await delay(1000) // Simulate API call

    console.log("Login attempt:", credentials)

    try {
      // Check all test credentials
      const testCreds = Object.values(TEST_CREDENTIALS)
      const matchingCred = testCreds.find((cred) => cred.email === credentials.email)

      if (matchingCred && credentials.password === "password") {
        // Find the corresponding user
        const user = mockUsers.find((u) => u.email === credentials.email && u.role === credentials.userType)

        if (user) {
          console.log("Login successful:", user)
          return { success: true, user }
        }
      }

      console.log("No matching credentials found")
      throw new Error("Invalid credentials")
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    }
  },

  // FIXED: OTP verification with proper parameter order
  verifyOTP: async (
    phone: string,
    otp: string,
    userType: "patient" | "doctor",
  ): Promise<{
    success: boolean
    user: User
  }> => {
    await delay(1500)

    try {
      console.log("OTP verification:", { phone, otp, userType })

      // Check test phone numbers
      const testCreds = Object.values(TEST_CREDENTIALS)
      const matchingCred = testCreds.find((cred) => cred.phone === phone)

      if (matchingCred) {
        const user = mockUsers.find((u) => u.phone === phone && u.role === userType)

        if (user) {
          console.log("OTP verification successful:", user)
          return { success: true, user }
        }
      }

      throw new Error("Invalid phone number or OTP")
    } catch (error) {
      console.error("OTP verification failed:", error)
      throw error
    }
  },

  sendOTP: async (phone: string): Promise<{ success: boolean }> => {
    await delay(800)
    return { success: true }
  },

  signup: async (userData: {
    name: string
    email: string
    phone: string
    password: string
    userType: "patient" | "doctor"
  }): Promise<{
    success: boolean
    user: User
  }> => {
    await delay(1200)

    try {
      const newUser: User = {
        id: `${userData.userType}_${Date.now()}`,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.userType,
        avatar: `/placeholder.svg?height=100&width=100&text=${userData.name.charAt(0)}`,
        createdAt: new Date().toISOString(),
      }

      return { success: true, user: newUser }
    } catch (error) {
      console.error("Signup failed:", error)
      throw error
    }
  },
}

// FIXED: Doctor Service
export const doctorService = {
  getAllDoctors: async (): Promise<Doctor[]> => {
    await delay(800)
    try {
      const response = await api.get("/doctors")
      return response.data
    } catch (error) {
      console.warn("JSON Server not available, using mock data:", error)
      return mockDoctors
    }
  },

  getDoctorById: async (id: string): Promise<Doctor> => {
    await delay(500)
    try {
      const response = await api.get(`/doctors/${id}`)
      return response.data
    } catch (error) {
      console.warn("JSON Server not available, using mock data:", error)
      const doctor = mockDoctors.find((d) => d.id === id)
      if (!doctor) {
        throw new Error("Doctor not found")
      }
      return doctor
    }
  },

  searchDoctors: async (query: string, specialty?: string): Promise<Doctor[]> => {
    await delay(600)
    try {
      const response = await api.get(`/doctors?q=${query}&specialty=${specialty || ""}`)
      return response.data
    } catch (error) {
      console.warn("JSON Server not available, using mock data:", error)
      return mockDoctors.filter(
        (doctor) =>
          doctor.name.toLowerCase().includes(query.toLowerCase()) ||
          doctor.specialization.toLowerCase().includes(query.toLowerCase()) ||
          (specialty && doctor.specialization.toLowerCase().includes(specialty.toLowerCase())),
      )
    }
  },

  getDoctorStats: async (doctorId: string): Promise<any> => {
    await delay(600)
    try {
      const response = await api.get(`/doctors/${doctorId}/stats`)
      return response.data
    } catch (error) {
      console.warn("JSON Server not available, using mock data:", error)
      const localAppointments = JSON.parse(localStorage.getItem("appointments") || "[]")
      const allAppointments = [...mockAppointments, ...localAppointments]
      const doctorAppointments = allAppointments.filter((apt: Appointment) => apt.doctorId === doctorId)

      const today = new Date().toISOString().split("T")[0]

      return {
        totalAppointments: doctorAppointments.length,
        todayAppointments: doctorAppointments.filter(
          (apt: Appointment) => apt.date === today && apt.status === "scheduled",
        ).length,
        completedAppointments: doctorAppointments.filter((apt: Appointment) =>
          ["completed", "cancelled"].includes(apt.status),
        ).length,
        totalPatients: new Set(doctorAppointments.map((apt: Appointment) => apt.patientId)).size,
        averageRating: mockDoctors.find((d) => d.id === doctorId)?.rating || 0,
        totalReviews: mockDoctors.find((d) => d.id === doctorId)?.reviews || 0,
      }
    }
  },
}

// FIXED: Appointment Service with proper sync and reschedule functionality
export const appointmentService = {
  createAppointment: async (
    appointmentData: Omit<Appointment, "id" | "createdAt" | "updatedAt">,
  ): Promise<Appointment> => {
    await delay(1200)

    try {
      const response = await api.post("/appointments", {
        ...appointmentData,
        id: `apt_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      return response.data
    } catch (error) {
      console.warn("JSON Server not available, using localStorage:", error)
      const newAppointment: Appointment = {
        ...appointmentData,
        id: `apt_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const existingAppointments = JSON.parse(localStorage.getItem("appointments") || "[]")
      const updatedAppointments = [...existingAppointments, newAppointment]
      localStorage.setItem("appointments", JSON.stringify(updatedAppointments))

      // Dispatch real-time update event
      window.dispatchEvent(
        new CustomEvent("appointmentCreated", {
          detail: { appointment: newAppointment },
        }),
      )

      return newAppointment
    }
  },

  getAppointments: async (userId?: string, userRole?: string): Promise<Appointment[]> => {
    await delay(800)

    try {
      const response = await api.get(`/appointments?${userRole === "doctor" ? "doctorId" : "patientId"}=${userId}`)
      return response.data
    } catch (error) {
      console.warn("JSON Server not available, using mock data:", error)
      const localAppointments = JSON.parse(localStorage.getItem("appointments") || "[]")
      const allAppointments = [...mockAppointments, ...localAppointments]

      if (userRole === "doctor") {
        return allAppointments.filter((apt: Appointment) => apt.doctorId === userId)
      } else {
        return allAppointments.filter((apt: Appointment) => apt.patientId === userId)
      }
    }
  },

  // FIXED: Enhanced reschedule functionality
  updateAppointmentStatus: async (
    appointmentId: string,
    status: string,
    cancelReason?: string,
    newDate?: string,
    newTimeSlot?: string,
  ): Promise<void> => {
    await delay(800)

    try {
      const updateData: any = {
        status,
        updatedAt: new Date().toISOString(),
      }

      if (cancelReason) updateData.cancelReason = cancelReason
      if (newDate) updateData.date = newDate
      if (newTimeSlot) updateData.timeSlot = newTimeSlot

      await api.patch(`/appointments/${appointmentId}`, updateData)
    } catch (error) {
      console.warn("JSON Server not available, using localStorage:", error)

      // Update mock appointments
      const appointmentIndex = mockAppointments.findIndex((apt) => apt.id === appointmentId)
      if (appointmentIndex !== -1) {
        mockAppointments[appointmentIndex] = {
          ...mockAppointments[appointmentIndex],
          status: status as any,
          cancelReason,
          updatedAt: new Date().toISOString(),
          ...(newDate && { date: newDate }),
          ...(newTimeSlot && { timeSlot: newTimeSlot }),
        }
      }

      // Update localStorage
      const existingAppointments = JSON.parse(localStorage.getItem("appointments") || "[]")
      const updatedAppointments = existingAppointments.map((apt: Appointment) =>
        apt.id === appointmentId
          ? {
              ...apt,
              status,
              cancelReason,
              updatedAt: new Date().toISOString(),
              ...(newDate && { date: newDate }),
              ...(newTimeSlot && { timeSlot: newTimeSlot }),
            }
          : apt,
      )
      localStorage.setItem("appointments", JSON.stringify(updatedAppointments))

      // Dispatch real-time update event
      window.dispatchEvent(
        new CustomEvent("appointmentUpdated", {
          detail: { appointmentId, status, cancelReason, newDate },
        }),
      )
    }
  },

  // ENHANCED: Reschedule appointment with comprehensive tracking
  rescheduleAppointment: async (appointmentId: string, newDate: string, newTimeSlot: string, rescheduledBy: "doctor" | "patient" = "doctor"): Promise<void> => {
    await delay(1000)

    try {
      await api.patch(`/appointments/${appointmentId}`, {
        date: newDate,
        timeSlot: newTimeSlot,
        status: "rescheduled",
        rescheduledBy,
        rescheduledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.warn("JSON Server not available, using localStorage:", error)

      // Update mock appointments with enhanced tracking
      const appointmentIndex = mockAppointments.findIndex((apt) => apt.id === appointmentId)
      if (appointmentIndex !== -1) {
        const currentApt = mockAppointments[appointmentIndex]
        mockAppointments[appointmentIndex] = {
          ...currentApt,
          date: newDate,
          timeSlot: newTimeSlot,
          status: "rescheduled",
          rescheduledBy,
          rescheduledAt: new Date().toISOString(),
          originalDate: currentApt.originalDate || currentApt.date,
          originalTimeSlot: currentApt.originalTimeSlot || currentApt.timeSlot,
          rescheduledCount: (currentApt.rescheduledCount || 0) + 1,
          updatedAt: new Date().toISOString(),
        }
      }

      // Update localStorage with enhanced tracking
      const existingAppointments = JSON.parse(localStorage.getItem("appointments") || "[]")
      const updatedAppointments = existingAppointments.map((apt: Appointment) => {
        if (apt.id === appointmentId) {
          return {
            ...apt,
            date: newDate,
            timeSlot: newTimeSlot,
            status: "rescheduled",
            rescheduledBy,
            rescheduledAt: new Date().toISOString(),
            originalDate: apt.originalDate || apt.date,
            originalTimeSlot: apt.originalTimeSlot || apt.timeSlot,
            rescheduledCount: (apt.rescheduledCount || 0) + 1,
            updatedAt: new Date().toISOString(),
          }
        }
        return apt
      })
      localStorage.setItem("appointments", JSON.stringify(updatedAppointments))

      // Dispatch real-time update event
      window.dispatchEvent(
        new CustomEvent("appointmentRescheduled", {
          detail: { appointmentId, newDate, newTimeSlot },
        }),
      )
    }
  },

  getAvailableSlots: async (doctorId: string, date: string): Promise<string[]> => {
    await delay(400)

    try {
      const response = await api.get(`/appointments/slots?doctorId=${doctorId}&date=${date}`)
      return response.data
    } catch (error) {
      console.warn("JSON Server not available, using mock data:", error)
      const allSlots = [
        "9:00 AM - 9:15 AM",
        "9:15 AM - 9:30 AM",
        "9:30 AM - 9:45 AM",
        "9:45 AM - 10:00 AM",
        "10:00 AM - 10:15 AM",
        "10:15 AM - 10:30 AM",
        "10:30 AM - 10:45 AM",
        "10:45 AM - 11:00 AM",
        "11:00 AM - 11:15 AM",
        "11:15 AM - 11:30 AM",
        "11:30 AM - 11:45 AM",
        "11:45 AM - 12:00 PM",
        "2:00 PM - 2:15 PM",
        "2:15 PM - 2:30 PM",
        "2:30 PM - 2:45 PM",
        "2:45 PM - 3:00 PM",
        "3:00 PM - 3:15 PM",
        "3:15 PM - 3:30 PM",
        "3:30 PM - 3:45 PM",
        "3:45 PM - 4:00 PM",
        "4:00 PM - 4:15 PM",
        "4:15 PM - 4:30 PM",
        "4:30 PM - 4:45 PM",
        "4:45 PM - 5:00 PM",
      ]

      const localAppointments = JSON.parse(localStorage.getItem("appointments") || "[]")
      const allAppointments = [...mockAppointments, ...localAppointments]
      const bookedSlots = allAppointments
        .filter((apt: Appointment) => apt.doctorId === doctorId && apt.date === date && apt.status === "scheduled")
        .map((apt: Appointment) => apt.timeSlot)

      return allSlots.filter((slot) => !bookedSlots.includes(slot))
    }
  },
}

// PRESCRIPTION SERVICE
export const prescriptionService = {
  // Mock prescriptions data
  mockPrescriptions: [
    {
      id: "rx1",
      doctorId: "doctor1",
      patientId: "patient1",
      appointmentId: "apt1",
      patientName: "John Patient",
      patientPhone: "1234567890",
      medicines: [
        {
          id: "med1",
          name: "Paracetamol 500mg",
          dosage: "1 tablet",
          duration: "5 days",
          frequency: "Twice a day",
          notes: "After meals"
        },
        {
          id: "med2",
          name: "Amoxicillin 250mg",
          dosage: "1 capsule",
          duration: "7 days",
          frequency: "Three times a day",
          notes: "Complete the full course"
        }
      ],
      diagnosis: "Common Cold with mild fever",
      instructions: "Take plenty of rest, drink warm water, avoid cold foods",
      status: "active" as const,
      createdAt: "2024-12-15T10:00:00Z",
      updatedAt: "2024-12-15T10:00:00Z",
      appointmentDate: "2024-12-15",
      followUpDate: "2024-12-22"
    },
    {
      id: "rx2",
      doctorId: "doctor1",
      patientId: "patient2",
      appointmentId: "apt2",
      patientName: "Sarah Johnson",
      patientPhone: "9876543210",
      medicines: [
        {
          id: "med3",
          name: "Ibuprofen 400mg",
          dosage: "1 tablet",
          duration: "3 days",
          frequency: "Twice a day",
          notes: "With food to avoid stomach upset"
        }
      ],
      diagnosis: "Migraine headache",
      instructions: "Avoid stress, maintain regular sleep schedule",
      status: "completed" as const,
      createdAt: "2024-12-10T14:30:00Z",
      updatedAt: "2024-12-13T14:30:00Z",
      appointmentDate: "2024-12-10"
    }
  ],

  // Get all prescriptions for a doctor
  getPrescriptions: async (doctorId: string): Promise<any[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simulate API delay
    
    // Get from localStorage and mock data
    const localPrescriptions = JSON.parse(localStorage.getItem("prescriptions") || "[]")
    const allPrescriptions = [...prescriptionService.mockPrescriptions, ...localPrescriptions]
    
    return allPrescriptions
      .filter((prescription: any) => prescription.doctorId === doctorId)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  // Get prescriptions for a specific patient
  getPatientPrescriptions: async (patientId: string, doctorId: string): Promise<any[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    const localPrescriptions = JSON.parse(localStorage.getItem("prescriptions") || "[]")
    const allPrescriptions = [...prescriptionService.mockPrescriptions, ...localPrescriptions]
    
    return allPrescriptions.filter((prescription: any) => 
      prescription.patientId === patientId && prescription.doctorId === doctorId
    )
  },

  // Create new prescription
  createPrescription: async (prescriptionData: any): Promise<any> => {
    await new Promise((resolve) => setTimeout(resolve, 800))
    
    const newPrescription = {
      id: `rx_${Date.now()}`,
      ...prescriptionData,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const localPrescriptions = JSON.parse(localStorage.getItem("prescriptions") || "[]")
    const updatedPrescriptions = [...localPrescriptions, newPrescription]
    localStorage.setItem("prescriptions", JSON.stringify(updatedPrescriptions))

    return newPrescription
  },

  // Update prescription
  updatePrescription: async (prescriptionId: string, updates: any): Promise<any> => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    
    const localPrescriptions = JSON.parse(localStorage.getItem("prescriptions") || "[]")
    const allPrescriptions = [...prescriptionService.mockPrescriptions, ...localPrescriptions]
    
    const prescriptionIndex = allPrescriptions.findIndex((p: any) => p.id === prescriptionId)
    if (prescriptionIndex === -1) {
      throw new Error("Prescription not found")
    }

    const updatedPrescription = {
      ...allPrescriptions[prescriptionIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    // Only update if it's in localStorage (not mock data)
    const localIndex = localPrescriptions.findIndex((p: any) => p.id === prescriptionId)
    if (localIndex !== -1) {
      localPrescriptions[localIndex] = updatedPrescription
      localStorage.setItem("prescriptions", JSON.stringify(localPrescriptions))
    }

    return updatedPrescription
  },

  // Delete prescription
  deletePrescription: async (prescriptionId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    
    const localPrescriptions = JSON.parse(localStorage.getItem("prescriptions") || "[]")
    const filteredPrescriptions = localPrescriptions.filter((p: any) => p.id !== prescriptionId)
    localStorage.setItem("prescriptions", JSON.stringify(filteredPrescriptions))
  },

  // Search prescriptions
  searchPrescriptions: async (doctorId: string, query: string): Promise<any[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    const allPrescriptions = await prescriptionService.getPrescriptions(doctorId)
    
    if (!query.trim()) return allPrescriptions

    const searchTerm = query.toLowerCase()
    return allPrescriptions.filter((prescription: any) => 
      prescription.patientName.toLowerCase().includes(searchTerm) ||
      prescription.diagnosis?.toLowerCase().includes(searchTerm) ||
      prescription.medicines.some((med: any) => 
        med.name.toLowerCase().includes(searchTerm)
      )
    )
  },

  // Get prescription by ID
  getPrescriptionById: async (prescriptionId: string): Promise<any> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    const localPrescriptions = JSON.parse(localStorage.getItem("prescriptions") || "[]")
    const allPrescriptions = [...prescriptionService.mockPrescriptions, ...localPrescriptions]
    
    const prescription = allPrescriptions.find((p: any) => p.id === prescriptionId)
    if (!prescription) {
      throw new Error("Prescription not found")
    }
    
    return prescription
  }
}

export default api
