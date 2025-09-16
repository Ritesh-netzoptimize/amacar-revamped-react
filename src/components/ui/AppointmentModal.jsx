import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Car, 
  Sparkles, 
  XCircle,
  ChevronDown,
  FileText
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

export default function AppointmentModal({
  isOpen,
  onClose,
  dealerName = "Premium Auto Dealer",
  dealerEmail = "contact@premiumauto.com",
  vehicleInfo = "2024 Tesla Model S",
  onAppointmentSubmit,
  title = "Schedule Appointment",
  description = "Choose your preferred date and time"
}) {
  const [phase, setPhase] = useState("form");
  const [selectedDate, setSelectedDate] = useState();
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);


  // Simplified time slots (hourly only)
  const timeSlots = [
    "9:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", 
    "17:00", "18:00"
  ];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPhase("form");
      setSelectedDate(undefined);
      setSelectedTime("");
      setNotes("");
      setErrors({});
      setShowCalendar(false);
    }
  }, [isOpen]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  // Disable past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedDate) {
      newErrors.date = "Please select a date";
    }
    
    if (!selectedTime) {
      newErrors.time = "Please select a time";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setPhase("loading");
    
    try {
      const appointmentData = {
        dealerName,
        dealerEmail,
        vehicleInfo,
        date: selectedDate,
        time: selectedTime,
        notes: notes.trim()
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onAppointmentSubmit) {
        await onAppointmentSubmit(appointmentData);
      }
      
      setPhase("success");
    } catch (error) {
      setPhase("failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = (open) => {
    if (!open && phase !== "loading") {
      onClose(false);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFullDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isCloseDisabled = phase === "loading";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-[800px] w-full max-h-[85vh] rounded-2xl shadow-2xl p-0 overflow-hidden bg-white border-0"
        showCloseButton={!isCloseDisabled}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent"></div>
            <div className="relative z-10">
              <DialogTitle className="text-lg font-bold mb-1">
                {title}
              </DialogTitle>
              <DialogDescription className="text-slate-300 text-sm">
                {description}
              </DialogDescription>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-500/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-orange-500/20 rounded-full blur-lg"></div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              {phase === "form" && (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex flex-col gap-6"
                >
                  {/* Dealer Info Card */}
                  <div className="flex gap-4">
                    <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
                        <Car className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-800 text-sm">Appointment Details</h3>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3" />
                        <span>{dealerName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3" />
                        <span>{dealerEmail}</span>
                      </div>
                      {vehicleInfo && (
                        <div className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-md inline-block">
                          {vehicleInfo}
                        </div>
                      )}
                    </div>
                  </div>

                   {/* Selected Appointment Summary */}
                   {selectedDate && selectedTime && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4"
                    >
                      <h4 className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Appointment Summary
                      </h4>
                      <div className="text-sm text-orange-700 space-y-1">
                        <p><strong>Date:</strong> {formatFullDate(selectedDate)}</p>
                        <p><strong>Time:</strong> {selectedTime}</p>
                        <p><strong>Dealer:</strong> {dealerName}</p>
                        {notes && (
                          <p><strong>Notes:</strong> {notes}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                  </div>

                  {/* Date & Time Selection */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Date Selection */}
                    <div ref={calendarRef} className="relative">
                      <label className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Date
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCalendar(!showCalendar)}
                        className="w-full h-12 rounded-lg border-2 border-slate-200 bg-white hover:border-orange-500 transition-all duration-200 flex items-center justify-between px-3 group"
                      >
                        <span className={`text-sm ${selectedDate ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                          {selectedDate ? formatDate(selectedDate) : 'Select date'}
                        </span>
                        <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                      </button>
                      <AnimatePresence>
                        {showCalendar && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-50 mt-2 bg-white rounded-lg border border-slate-200 shadow-lg p-4 w-[320px]"
                          >
                            <CalendarComponent
                              mode="single"
                              selected={selectedDate}
                              onSelect={(date) => {
                                setSelectedDate(date);
                                setShowCalendar(false);
                              }}
                              disabled={(date) => date < today}
                              className="rounded-lg w-full"
                              classNames={{
                                months: "flex flex-col space-y-4",
                                month: "space-y-4",
                                caption: "flex justify-center pt-1 relative items-center",
                                caption_label: "text-sm font-medium",
                                nav: "space-x-1 flex items-center",
                                nav_button: "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100",
                                nav_button_previous: "absolute left-1",
                                nav_button_next: "absolute right-1",
                                table: "w-full border-collapse space-y-1",
                                head_row: "flex",
                                head_cell: "text-slate-500 rounded-md w-9 font-normal text-[0.8rem]",
                                row: "flex w-full mt-1",
                                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-orange-500 [&:has([aria-selected])]:text-white first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-100 rounded-md",
                                day_selected: "bg-orange-500 text-white hover:bg-orange-600 hover:text-white focus:bg-orange-500 focus:text-white",
                                day_today: "bg-orange-100 text-orange-700 font-semibold",
                                day_outside: "text-slate-300 opacity-50",
                                day_disabled: "text-slate-300 opacity-50",
                                day_range_middle: "aria-selected:bg-orange-100 aria-selected:text-orange-700",
                                day_hidden: "invisible",
                              }}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {errors.date && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-red-500 mt-1"
                        >
                          {errors.date}
                        </motion.p>
                      )}
                    </div>

                    {/* Time Selection */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Time
                      </label>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-1">
                        {timeSlots.map(time => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            className={`h-10 text-sm font-medium rounded-lg transition-all duration-200 ${
                              selectedTime === time
                                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                      {errors.time && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-red-500 mt-1"
                        >
                          {errors.time}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-2">
                    <label htmlFor="notes" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special requirements, questions, or notes for the appointment..."
                      rows={3}
                      className="w-full rounded-lg border-2 border-slate-200 bg-white p-3 text-sm outline-none transition-all duration-200 focus:border-orange-500 focus:ring-0 resize-none"
                    />
                  </div>

                 

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || !selectedDate || !selectedTime}
                      className="cursor-pointer w-full h-12 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-md shadow-orange-500/25 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Scheduling...
                        </div>
                      ) : (
                        "Schedule Appointment"
                      )}
                    </button>
                  </div>
                </motion.form>
              )}

              {phase === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center text-center gap-6 py-8"
                >
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Loader2 className="h-7 w-7 text-white animate-spin" />
                    </div>
                    <div className="absolute inset-0 bg-orange-500 rounded-lg blur-xl opacity-30 animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Scheduling Appointment
                    </h3>
                    <p className="text-sm text-slate-600">
                      Please wait while we confirm your booking...
                    </p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <motion.div
                      className="h-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ ease: "easeOut", duration: 2 }}
                    />
                  </div>
                </motion.div>
              )}

              {phase === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="flex flex-col items-center justify-center text-center gap-6 py-8"
                >
                  <motion.div
                    className="relative"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-white" />
                    </div>
                    <motion.div
                      className="absolute -top-2 -right-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-4 w-4 text-orange-500" />
                    </motion.div>
                    <div className="absolute inset-0 bg-green-500 rounded-lg blur-xl opacity-20 animate-pulse"></div>
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      All Set!
                    </h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Your appointment has been scheduled successfully.
                    </p>
                    {selectedDate && selectedTime && (
                      <div className="bg-slate-50 rounded-lg p-2.5 text-sm">
                        <p className="font-semibold text-slate-900">
                          {formatFullDate(selectedDate)} at {selectedTime}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => onClose(false)}
                    className="cursor-pointer w-full h-12 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold shadow-md shadow-orange-500/25 transition-all duration-200 hover:shadow-lg"
                  >
                    Close
                  </button>
                </motion.div>
              )}

              {phase === "failed" && (
                <motion.div
                  key="failed"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="flex flex-col items-center justify-center text-center gap-6 py-8"
                >
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <XCircle className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-red-500 rounded-lg blur-xl opacity-20"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      Scheduling Failed
                    </h3>
                    <p className="text-sm text-slate-600">
                      Something went wrong. Please try again.
                    </p>
                  </div>
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={() => setPhase("form")}
                      className="flex-1 h-12 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => onClose(false)}
                      className="flex-1 h-12 rounded-lg border-2 border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}