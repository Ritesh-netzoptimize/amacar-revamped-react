import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Car, 
  Sparkles, 
  XCircle,
  ChevronDown,
  FileText,
  MapPin,
  Video,
  Edit3,
  Trash2,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointment,
  onCancel,
  onReschedule,
  onCall,
  onJoin,
  isProcessing = false,
  processingAction = ""
}) {
  const [showActions, setShowActions] = useState(false);

  // Handle modal close
  const handleClose = (open) => {
    if (!open && !isProcessing) {
      onClose(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString === "0000-00-00 00:00:00") return "Date not available";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return "Date not available";
    }
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString || dateString === "0000-00-00 00:00:00") return "Time not available";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return "Time not available";
    }
  };

  // Get status color and styling
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200'
        };
      case 'confirmed':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200'
        };
      case 'cancelled':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200'
        };
      case 'completed':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          border: 'border-blue-200'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200'
        };
    }
  };

  const statusStyle = getStatusStyle(appointment?.status);

  const isCloseDisabled = isProcessing;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[600px] w-full max-h-[85vh] rounded-2xl shadow-2xl p-0 overflow-hidden bg-white border-0"
        showCloseButton={!isCloseDisabled}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="relative bg-[#f6851f] p-6 text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent"></div>
            <div className="relative z-10">
              <DialogTitle className="text-lg font-bold mb-1">
                Appointment Details
              </DialogTitle>
              <DialogDescription className="text-white text-sm">
                View and manage your appointment information
              </DialogDescription>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-500/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-orange-500/20 rounded-full blur-lg"></div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {appointment ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-6"
              >
                {/* Appointment Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Appointment #{appointment.id}</h3>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                        <div className={`w-2 h-2 rounded-full ${statusStyle.bg.replace('100', '500')}`}></div>
                        {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1) || 'Unknown'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-600">
                    <p>Created: {appointment.created_at ? new Date(appointment.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>

                {/* Date & Time Information */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Schedule Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Date</p>
                      <p className="text-sm font-medium text-slate-900">
                        {appointment.formatted_start_time?.includes("-0001") 
                          ? formatDate(appointment.start_time)
                          : appointment.formatted_start_time?.split(' at ')[0] || formatDate(appointment.start_time)
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Time</p>
                      <p className="text-sm font-medium text-slate-900">
                        {appointment.formatted_start_time?.includes("-0001")
                          ? formatTime(appointment.start_time)
                          : appointment.formatted_start_time?.split(' at ')[1] || formatTime(appointment.start_time)
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dealer Information */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Dealer Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{appointment.dealer_name}</p>
                        <p className="text-xs text-slate-600">Dealer</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{appointment.dealer_email}</p>
                        <p className="text-xs text-slate-600">Email</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {appointment.notes && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Notes
                    </h4>
                    <p className="text-sm text-slate-700">{appointment.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-800">Quick Actions</h4>
                    <button
                      onClick={() => setShowActions(!showActions)}
                      className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 transition-colors"
                    >
                      <span>{showActions ? 'Hide' : 'Show'} Actions</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showActions ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  <AnimatePresence>
                    {showActions && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-2"
                      >
                        {/* Management Actions */}
                        <div className="grid grid-cols-1 gap-2">
                          <button
                            onClick={() => onReschedule && onReschedule(appointment)}
                            // disabled={isProcessing || !appointment.can_reschedule}
                            disabled={isProcessing}
                            className="cursor-pointer flex items-center justify-center gap-2 h-10 bg-orange-50 text-orange-700 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit3 className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {isProcessing && processingAction === 'reschedule' ? 'Processing...' : 'Reschedule'}
                            </span>
                          </button>
                        </div>
                        {/* Communication Actions */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => onCall && onCall(appointment)}
                            className="cursor-pointer flex items-center justify-center gap-2 h-10 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            <span className="text-sm font-medium">Call</span>
                          </button>
                          
                          <button
                            onClick={() => onCancel && onCancel(appointment)}
                            // disabled={isProcessing || !appointment.can_cancel}
                            disabled={isProcessing}
                            className="cursor-pointer flex items-center justify-center gap-2 h-10 bg-red-50 text-red-700 rounded-lg border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {isProcessing && processingAction === 'cancel' ? 'Processing...' : 'Cancel'}
                            </span>
                          </button>
                        </div>

                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Processing State */}
                {isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-orange-50 border border-orange-200 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
                      <div>
                        <p className="text-sm font-medium text-orange-800">
                          {processingAction === 'cancel' ? 'Cancelling appointment...' : 
                           processingAction === 'reschedule' ? 'Processing reschedule...' : 
                           'Processing...'}
                        </p>
                        <p className="text-xs text-orange-600">Please wait while we process your request</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Footer Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => onClose(false)}
                    className="flex-1 h-12 rounded-lg border-2 border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                  {/* {appointment.can_reschedule && ( */}
                    <button
                      onClick={() => onReschedule && onReschedule(appointment)}
                      disabled={isProcessing}
                      className="flex-1 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-md shadow-orange-500/25 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reschedule
                    </button>
                  {/* )} */}
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center gap-4 py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Appointment Data</h3>
                  <p className="text-sm text-slate-600">Unable to load appointment details.</p>
                </div>
                <button
                  onClick={() => onClose(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
