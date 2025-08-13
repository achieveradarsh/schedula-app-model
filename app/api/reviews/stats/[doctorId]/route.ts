import { NextRequest, NextResponse } from 'next/server'

// GET /api/reviews/stats/[doctorId] - Get review statistics for a doctor
export async function GET(
  request: NextRequest,
  { params }: { params: { doctorId: string } }
) {
  try {
    const doctorId = params.doctorId

    // Fetch reviews from the main reviews endpoint
    const reviewsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/reviews?doctorId=${doctorId}`)
    const reviewsData = await reviewsResponse.json()

    if (!reviewsData.success) {
      throw new Error('Failed to fetch reviews')
    }

    const reviews = reviewsData.reviews

    // Calculate statistics
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / totalReviews 
      : 0

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    reviews.forEach((review: any) => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++
    })

    // Convert to percentages
    const ratingPercentages = Object.keys(ratingDistribution).reduce((acc, rating) => {
      const ratingKey = parseInt(rating) as 1 | 2 | 3 | 4 | 5
      const count = ratingDistribution[ratingKey]
      acc[ratingKey] = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
      return acc
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })

    const stats = {
      doctorId,
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      ratingDistribution: ratingDistribution,
      ratingPercentages: ratingPercentages,
      recentReviews: reviews.slice(0, 5) // Get 5 most recent reviews
    }

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Error fetching review stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch review statistics' },
      { status: 500 }
    )
  }
}
