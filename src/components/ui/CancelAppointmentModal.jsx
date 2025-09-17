import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  AlertTriangle,
  XCircle,
  FileText,
  Trash2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function CancelAppointmentModal({
  isOpen,
  onClose,
  appointment,
  onConfirmCancel,
  isProcessing = false
}) {
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});

  // Handle modal close
  const handleClose = (open) => {
    if (!open && !isProcessing) {
      onClose(false);
      setNotes("");
      setErrors({});
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!notes.trim()) {
      newErrors.notes = "Please provide a reason for cancellation";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (onConfirmCancel) {
      await onConfirmCancel(appointment, notes.trim());
    }
  };

  // Handle cancel without submitting
  const handleCancel = () => {
    setNotes("");
    setErrors({});
    onClose(false);
  };

  const isCloseDisabled = isProcessing;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[500px] w-full max-h-[85vh] rounded-2xl shadow-2xl p-0 overflow-hidden bg-white border-0"
        showCloseButton={!isCloseDisabled}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="relative bg-red-500 p-6 text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent"></div>
            <div className="relative z-10">
              <DialogTitle className="text-lg font-bold mb-1 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Cancel Appointment
              </DialogTitle>
              <DialogDescription className="text-white text-sm">
                Are you sure you want to cancel this appointment?
              </DialogDescription>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-red-500/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-red-500/20 rounded-full blur-lg"></div>
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
                {/* Appointment Summary
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-red-800 mb-1">
                        Appointment #{appointment.id}
                      </h4>
                      <p className="text-sm text-red-700 mb-2">
                        with {appointment.dealer_name}
                      </p>
                      <div className="text-xs text-red-600">
                        <p>
                          {appointment.formatted_start_time?.includes("-0001") 
                            ? "Date not available"
                            : appointment.formatted_start_time || "Date not available"
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div> */}

                {/* Warning Message */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-amber-800 mb-1">
                        Important Notice
                      </h4>
                      <p className="text-sm text-amber-700">
                        Once cancelled, this appointment cannot be restored. Please ensure you really want to cancel before proceeding.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cancellation Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="cancelNotes" className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Reason for Cancellation *
                    </label>
                    <textarea
                      id="cancelNotes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Please provide a reason for cancelling this appointment..."
                      rows={4}
                      className="w-full rounded-lg border-2 border-slate-200 bg-white p-3 text-sm outline-none transition-all duration-200 focus:border-red-500 focus:ring-0 resize-none"
                    />
                    {errors.notes && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-red-500 mt-1"
                      >
                        {errors.notes}
                      </motion.p>
                    )}
                  </div>

                  {/* Processing State */}
                  {isProcessing && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
                        <div>
                          <p className="text-sm font-medium text-red-800">
                            Cancelling appointment...
                          </p>
                          <p className="text-xs text-red-600">Please wait while we process your request</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isProcessing}
                      className="flex-1 h-12 rounded-lg border-2 border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Keep Appointment
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1 h-12 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-md shadow-red-500/25 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Cancel Appointment
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center gap-4 py-8">
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Appointment Data</h3>
                  <p className="text-sm text-slate-600">Unable to load appointment details.</p>
                </div>
                <button
                  onClick={handleCancel}
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
