"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Receipt, Download } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import type { PaymentDetails } from "@/types"

interface PaymentInvoiceProps {
  paymentDetails: PaymentDetails
  doctorName: string
  appointmentDate: string
  appointmentTime: string
  onDownload: () => void
}

export const PaymentInvoice: React.FC<PaymentInvoiceProps> = ({
  paymentDetails,
  doctorName,
  appointmentDate,
  appointmentTime,
  onDownload,
}) => {
  return (
    <Card variant="gradient" className="p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Payment Summary</h3>
              <p className="text-sm text-slate-600">Appointment with {doctorName}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            icon={<Download className="w-4 h-4 bg-transparent" />}
          >
            Download
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-slate-600">Consultation Fee</span>
            <span className="font-semibold text-slate-900">₹{paymentDetails.consultationFee}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-slate-600">Platform Fee</span>
            <span className="font-semibold text-slate-900">₹{paymentDetails.platformFee}</span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-slate-200">
            <span className="text-slate-600">Taxes & Charges</span>
            <span className="font-semibold text-slate-900">₹{paymentDetails.taxes}</span>
          </div>

          {paymentDetails.discount && (
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-emerald-600">Discount Applied</span>
              <span className="font-semibold text-emerald-600">-₹{paymentDetails.discount}</span>
            </div>
          )}

          <motion.div
            className="flex justify-between items-center py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl px-4"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-lg font-bold text-slate-900">Total Amount</span>
            <span className="text-xl font-bold text-indigo-600">₹{paymentDetails.total}</span>
          </motion.div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Date</p>
              <p className="font-semibold text-slate-900">{appointmentDate}</p>
            </div>
            <div>
              <p className="text-slate-600">Time</p>
              <p className="font-semibold text-slate-900">{appointmentTime}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </Card>
  )
}
