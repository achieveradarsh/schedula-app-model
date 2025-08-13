import { NextRequest, NextResponse } from 'next/server'

// Mock medical history data
const mockMedicalHistory = {
  'patient_001': {
    patientId: 'patient_001',
    patientName: 'John Doe',
    patientEmail: 'john.doe@email.com',
    patientPhone: '+1-555-0101',
    totalAppointments: 8,
    totalPrescriptions: 6,
    appointments: [
      {
        id: 'apt_001',
        date: '2025-08-10T09:00:00Z',
        doctorName: 'Dr. Priya Sharma',
        doctorId: 'doctor_001',
        status: 'completed',
        consultationType: 'General Consultation',
        diagnosis: 'Mild hypertension, seasonal allergies',
        prescription: {
          id: 'presc_001',
          medicines: [
            {
              id: 'med_001',
              name: 'Lisinopril',
              dosage: '10mg',
              frequency: 'Once daily',
              duration: '30 days',
              notes: 'Take in the morning with water'
            },
            {
              id: 'med_002',
              name: 'Cetirizine',
              dosage: '10mg',
              frequency: 'Once daily',
              duration: '15 days',
              notes: 'For allergy symptoms'
            }
          ],
          instructions: 'Monitor blood pressure daily. Return if symptoms persist.'
        }
      },
      {
        id: 'apt_008',
        date: '2025-07-25T14:30:00Z',
        doctorName: 'Dr. Priya Sharma',
        doctorId: 'doctor_001',
        status: 'completed',
        consultationType: 'Follow-up',
        diagnosis: 'Blood pressure under control, continue medication',
        prescription: {
          id: 'presc_008',
          medicines: [
            {
              id: 'med_015',
              name: 'Lisinopril',
              dosage: '10mg',
              frequency: 'Once daily',
              duration: '30 days',
              notes: 'Continue current dosage'
            }
          ],
          instructions: 'Good progress. Continue lifestyle modifications.'
        }
      },
      {
        id: 'apt_015',
        date: '2025-06-20T11:00:00Z',
        doctorName: 'Dr. Rajesh Kumar',
        doctorId: 'doctor_002',
        status: 'completed',
        consultationType: 'Cardiology Consultation',
        diagnosis: 'ECG normal, mild stress-related symptoms',
        prescription: {
          id: 'presc_015',
          medicines: [
            {
              id: 'med_025',
              name: 'Magnesium Supplement',
              dosage: '400mg',
              frequency: 'Once daily',
              duration: '60 days',
              notes: 'Take with food to avoid stomach upset'
            }
          ],
          instructions: 'Stress management techniques recommended. Regular exercise.'
        }
      },
      {
        id: 'apt_022',
        date: '2025-05-15T10:00:00Z',
        doctorName: 'Dr. Priya Sharma',
        doctorId: 'doctor_001',
        status: 'completed',
        consultationType: 'General Health Check',
        diagnosis: 'Overall health good, vitamin D deficiency detected',
        prescription: {
          id: 'presc_022',
          medicines: [
            {
              id: 'med_035',
              name: 'Vitamin D3',
              dosage: '2000 IU',
              frequency: 'Once daily',
              duration: '90 days',
              notes: 'Take with fatty meal for better absorption'
            }
          ],
          instructions: 'Increase sun exposure. Recheck vitamin D levels in 3 months.'
        }
      },
      {
        id: 'apt_030',
        date: '2025-04-10T16:00:00Z',
        doctorName: 'Dr. Sarah Wilson',
        doctorId: 'doctor_003',
        status: 'completed',
        consultationType: 'Dermatology Consultation',
        diagnosis: 'Mild eczema, dry skin condition',
        prescription: {
          id: 'presc_030',
          medicines: [
            {
              id: 'med_045',
              name: 'Hydrocortisone Cream',
              dosage: '1%',
              frequency: 'Twice daily',
              duration: '14 days',
              notes: 'Apply thin layer to affected areas'
            }
          ],
          instructions: 'Use gentle, fragrance-free moisturizers. Avoid hot showers.'
        }
      },
      {
        id: 'apt_038',
        date: '2025-03-05T13:30:00Z',
        doctorName: 'Dr. Priya Sharma',
        doctorId: 'doctor_001',
        status: 'completed',
        consultationType: 'General Consultation',
        diagnosis: 'Common cold, mild throat infection',
        prescription: {
          id: 'presc_038',
          medicines: [
            {
              id: 'med_055',
              name: 'Paracetamol',
              dosage: '500mg',
              frequency: 'Every 6 hours',
              duration: '5 days',
              notes: 'Take with food, maximum 4 tablets per day'
            },
            {
              id: 'med_056',
              name: 'Throat Lozenges',
              dosage: '1 lozenge',
              frequency: 'Every 2-3 hours',
              duration: '7 days',
              notes: 'For throat relief'
            }
          ],
          instructions: 'Rest, plenty of fluids. Return if fever persists beyond 3 days.'
        }
      }
    ]
  },
  'patient_002': {
    patientId: 'patient_002',
    patientName: 'Jane Smith',
    patientEmail: 'jane.smith@email.com',
    patientPhone: '+1-555-0102',
    totalAppointments: 5,
    totalPrescriptions: 4,
    appointments: [
      {
        id: 'apt_002',
        date: '2025-08-09T11:00:00Z',
        doctorName: 'Dr. Priya Sharma',
        doctorId: 'doctor_001',
        status: 'completed',
        consultationType: 'General Consultation',
        diagnosis: 'Migraine headaches, stress-related',
        prescription: {
          id: 'presc_002',
          medicines: [
            {
              id: 'med_003',
              name: 'Sumatriptan',
              dosage: '50mg',
              frequency: 'As needed',
              duration: '30 days',
              notes: 'Take at onset of migraine, max 2 per day'
            }
          ],
          instructions: 'Identify and avoid triggers. Consider stress management.'
        }
      },
      {
        id: 'apt_012',
        date: '2025-07-10T15:00:00Z',
        doctorName: 'Dr. Priya Sharma',
        doctorId: 'doctor_001',
        status: 'completed',
        consultationType: 'Follow-up',
        diagnosis: 'Migraine frequency reduced, continue treatment',
        prescription: {
          id: 'presc_012',
          medicines: [
            {
              id: 'med_020',
              name: 'Sumatriptan',
              dosage: '50mg',
              frequency: 'As needed',
              duration: '30 days',
              notes: 'Continue as prescribed'
            }
          ],
          instructions: 'Good improvement. Keep headache diary.'
        }
      }
    ]
  }
}

// GET /api/medical-history/[patientId] - Get complete medical history for a patient
export async function GET(
  request: NextRequest,
  { params }: { params: { patientId: string } }
) {
  try {
    const patientId = params.patientId
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Get patient's medical history
    const medicalHistory = mockMedicalHistory[patientId as keyof typeof mockMedicalHistory]

    if (!medicalHistory) {
      return NextResponse.json(
        { success: false, error: 'Patient not found or no medical history available' },
        { status: 404 }
      )
    }

    let filteredAppointments = medicalHistory.appointments

    // Apply date filters if provided
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      filteredAppointments = filteredAppointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date)
        return appointmentDate >= start && appointmentDate <= end
      })
    }

    // Sort appointments by date (most recent first)
    filteredAppointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const filteredHistory = {
      ...medicalHistory,
      appointments: filteredAppointments,
      filteredAppointments: filteredAppointments.length,
      dateRange: startDate && endDate ? { startDate, endDate } : null
    }

    return NextResponse.json({
      success: true,
      medicalHistory: filteredHistory
    })
  } catch (error) {
    console.error('Error fetching medical history:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch medical history' },
      { status: 500 }
    )
  }
}
