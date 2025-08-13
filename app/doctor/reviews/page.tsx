"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Star, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Filter,
  Calendar,
  ChevronDown,
  Search,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuthStore } from '@/store/authStore'
import { reviewService } from '@/services/api'
import type { Review, DoctorReviewStats } from '@/types'
import toast from 'react-hot-toast'
import moment from 'moment'

export default function DoctorReviewsPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<DoctorReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating-high' | 'rating-low'>('newest')

  useEffect(() => {
    if (user && user.role === 'doctor') {
      fetchReviews()
      fetchStats()
    }
  }, [user])

  const fetchReviews = async () => {
    try {
      const data = await reviewService.getDoctorReviews(user?.id || '')
      
      if (data.success) {
        setReviews(data.reviews)
      } else {
        throw new Error('Failed to fetch reviews')
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Failed to load reviews')
    }
  }

  const fetchStats = async () => {
    try {
      const data = await reviewService.getDoctorReviewStats(user?.id || '')
      
      if (data.success) {
        setStats(data.stats)
      } else {
        throw new Error('Failed to fetch stats')
      }
    } catch (error) {
      console.error('Error fetching review stats:', error)
      toast.error('Failed to load review statistics')
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    }

    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`${sizeClasses[size]} ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-slate-300'
        }`}
      />
    ))
  }

  const filteredAndSortedReviews = reviews
    .filter(review => {
      const matchesSearch = review.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           review.reviewText.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRating = filterRating === null || review.rating === filterRating
      return matchesSearch && matchesRating
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'rating-high':
          return b.rating - a.rating
        case 'rating-low':
          return a.rating - b.rating
        default:
          return 0
      }
    })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading reviews..." variant="gradient" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 pb-24">
      {/* Header */}
      <motion.div
        className="bg-gradient-to-r from-white/95 to-slate-50/95 backdrop-blur-xl shadow-2xl border-b border-white/20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/doctor/dashboard")}
                icon={<ArrowLeft className="w-4 h-4" />}
                className="hover:bg-slate-100 text-slate-700"
              >
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Patient Reviews
                </h1>
                <p className="text-slate-600">View and manage feedback from your patients</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card variant="glass" className="p-6 border-white/20 bg-white/90">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-medium">Average Rating</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.averageRating}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-white fill-current" />
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    {renderStars(Math.round(stats.averageRating), 'sm')}
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card variant="glass" className="p-6 border-white/20 bg-white/90">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-medium">Total Reviews</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.totalReviews}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mt-2">From verified patients</p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card variant="glass" className="p-6 border-white/20 bg-white/90">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-medium">5-Star Reviews</p>
                      <p className="text-3xl font-bold text-slate-900">{stats.ratingDistribution[5]}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mt-2">{stats.ratingPercentages[5]}% of total</p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card variant="glass" className="p-6 border-white/20 bg-white/90">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-medium">Happy Patients</p>
                      <p className="text-3xl font-bold text-slate-900">
                        {stats.ratingDistribution[4] + stats.ratingDistribution[5]}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mt-2">4+ star ratings</p>
                </Card>
              </motion.div>
            </div>
          )}

          {/* Rating Distribution */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card variant="glass" className="p-6 border-white/20 bg-white/90">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Rating Distribution</h3>
                <div className="space-y-4">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 w-20">
                        <span className="text-sm font-medium text-slate-700">{rating}</span>
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      </div>
                      <div className="flex-1 bg-slate-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${stats.ratingPercentages[rating as keyof typeof stats.ratingPercentages]}%` }}
                        />
                      </div>
                      <div className="w-20 text-right">
                        <span className="text-sm font-medium text-slate-700">
                          {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]} ({stats.ratingPercentages[rating as keyof typeof stats.ratingPercentages]}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card variant="glass" className="p-6 border-white/20 bg-white/90">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      placeholder="Search reviews..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <select
                    value={filterRating || ''}
                    onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  >
                    <option value="">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="rating-high">Highest Rating</option>
                    <option value="rating-low">Lowest Rating</option>
                  </select>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Reviews List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-6"
          >
            {filteredAndSortedReviews.length > 0 ? (
              filteredAndSortedReviews.map((review, index) => (
                <Card key={review.id} variant="glass" className="p-6 border-white/20 bg-white/90">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {review.patientName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{review.patientName}</h4>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {renderStars(review.rating, 'sm')}
                          </div>
                          <span className="text-slate-500 text-sm">
                            • {moment(review.appointmentDate).format("MMM DD, YYYY")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-slate-500 text-sm">
                      {moment(review.createdAt).format("MMM DD, YYYY")}
                    </span>
                  </div>
                  
                  <p className="text-slate-700 mb-4 leading-relaxed">{review.reviewText}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        review.rating >= 4 
                          ? 'bg-green-100 text-green-700' 
                          : review.rating >= 3 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {review.rating >= 4 ? 'Positive' : review.rating >= 3 ? 'Neutral' : 'Needs Attention'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {review.canEdit && (
                        <span className="text-amber-600 text-xs font-medium">
                          Patient can edit
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card variant="glass" className="p-12 text-center border-white/20 bg-white/90">
                <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Reviews Found</h3>
                <p className="text-slate-600">
                  {searchTerm || filterRating 
                    ? "No reviews match your current filters." 
                    : "You haven't received any patient reviews yet."}
                </p>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
