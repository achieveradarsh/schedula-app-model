import { NextRequest, NextResponse } from 'next/server'

// Mock reviews data (in production, this would be a database)
let mockReviews = [
  {
    id: '1',
    appointmentId: 'apt_001',
    patientId: 'patient_001',
    doctorId: 'doctor_001',
    patientName: 'John Doe',
    doctorName: 'Dr. Priya Sharma',
    rating: 5,
    reviewText: 'Excellent doctor! Very professional and caring. The consultation was thorough and I felt heard.',
    createdAt: '2025-08-10T10:00:00Z',
    updatedAt: '2025-08-10T10:00:00Z',
    appointmentDate: '2025-08-10T09:00:00Z',
    canEdit: false
  },
  {
    id: '2',
    appointmentId: 'apt_002',
    patientId: 'patient_002',
    doctorId: 'doctor_001',
    patientName: 'Jane Smith',
    doctorName: 'Dr. Priya Sharma',
    rating: 4,
    reviewText: 'Great experience overall. Dr. Sharma was very knowledgeable and explained everything clearly.',
    createdAt: '2025-08-09T14:30:00Z',
    updatedAt: '2025-08-09T14:30:00Z',
    appointmentDate: '2025-08-09T11:00:00Z',
    canEdit: false
  },
  {
    id: '3',
    appointmentId: 'apt_003',
    patientId: 'patient_003',
    doctorId: 'doctor_002',
    patientName: 'Mike Johnson',
    doctorName: 'Dr. Rajesh Kumar',
    rating: 5,
    reviewText: 'Outstanding cardiologist! Very detailed examination and clear treatment plan.',
    createdAt: '2025-08-08T16:00:00Z',
    updatedAt: '2025-08-08T16:00:00Z',
    appointmentDate: '2025-08-08T15:00:00Z',
    canEdit: false
  }
]

// GET /api/reviews - Get reviews (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get('doctorId')
    const patientId = searchParams.get('patientId')
    const appointmentId = searchParams.get('appointmentId')

    let filteredReviews = mockReviews

    if (doctorId) {
      filteredReviews = filteredReviews.filter(review => review.doctorId === doctorId)
    }

    if (patientId) {
      filteredReviews = filteredReviews.filter(review => review.patientId === patientId)
    }

    if (appointmentId) {
      filteredReviews = filteredReviews.filter(review => review.appointmentId === appointmentId)
    }

    // Sort by date (most recent first)
    filteredReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      success: true,
      reviews: filteredReviews,
      total: filteredReviews.length
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { appointmentId, patientId, doctorId, patientName, doctorName, rating, reviewText } = body

    // Validate required fields
    if (!appointmentId || !patientId || !doctorId || !rating || !reviewText) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if review already exists for this appointment
    const existingReview = mockReviews.find(review => review.appointmentId === appointmentId)
    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review already exists for this appointment' },
        { status: 400 }
      )
    }

    // Create new review
    const newReview = {
      id: `review_${Date.now()}`,
      appointmentId,
      patientId,
      doctorId,
      patientName,
      doctorName,
      rating: Number(rating),
      reviewText,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      appointmentDate: body.appointmentDate || new Date().toISOString(),
      canEdit: true // Can edit within 24 hours
    }

    mockReviews.push(newReview)

    return NextResponse.json({
      success: true,
      review: newReview,
      message: 'Review submitted successfully'
    })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    )
  }
}

// PUT /api/reviews - Update an existing review
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { reviewId, rating, reviewText } = body

    const reviewIndex = mockReviews.findIndex(review => review.id === reviewId)
    if (reviewIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }

    const review = mockReviews[reviewIndex]
    
    // Check if review can still be edited (within 24 hours)
    const reviewAge = Date.now() - new Date(review.createdAt).getTime()
    const twentyFourHours = 24 * 60 * 60 * 1000
    
    if (reviewAge > twentyFourHours) {
      return NextResponse.json(
        { success: false, error: 'Review can only be edited within 24 hours' },
        { status: 400 }
      )
    }

    // Update review
    mockReviews[reviewIndex] = {
      ...review,
      rating: Number(rating) || review.rating,
      reviewText: reviewText || review.reviewText,
      updatedAt: new Date().toISOString(),
      canEdit: reviewAge < twentyFourHours
    }

    return NextResponse.json({
      success: true,
      review: mockReviews[reviewIndex],
      message: 'Review updated successfully'
    })
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    )
  }
}

// DELETE /api/reviews - Delete a review
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get('reviewId')

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      )
    }

    const reviewIndex = mockReviews.findIndex(review => review.id === reviewId)
    if (reviewIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }

    const review = mockReviews[reviewIndex]
    
    // Check if review can still be deleted (within 24 hours)
    const reviewAge = Date.now() - new Date(review.createdAt).getTime()
    const twentyFourHours = 24 * 60 * 60 * 1000
    
    if (reviewAge > twentyFourHours) {
      return NextResponse.json(
        { success: false, error: 'Review can only be deleted within 24 hours' },
        { status: 400 }
      )
    }

    // Delete review
    mockReviews.splice(reviewIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}
