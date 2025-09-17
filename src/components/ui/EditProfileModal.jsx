import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, User, Mail, Phone, MapPin, ShieldCheck, Sparkles, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '@/redux/slices/userSlice';
import toast from 'react-hot-toast';

export default function EditProfileModal({
  isOpen,
  onClose,
  onSave,
  initialData = {},
}) {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.user);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [phase, setPhase] = useState('form'); // form | loading | success | failed

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        address: initialData.address || '',
      });
      setErrors({});
      setPhase('form');
    }
  }, [isOpen, initialData]);

  const validateForm = () => {
    const newErrors = {};
    
    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Address validation (optional but if provided, should be meaningful)
    if (formData.address.trim() && formData.address.trim().length < 5) {
      newErrors.address = 'Address must be at least 5 characters if provided';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setPhase('loading');
    
    try {
      // Call the updateProfile API
      const resultAction = await dispatch(updateProfile(formData));
      setPhase('success');
      setTimeout(() => {
        onClose();
      }, 2000);
      return;
      
      if (updateProfile.fulfilled.match(resultAction)) {
        // Call the onSave callback with the updated data
        onSave(formData);
        
        setPhase('success');
        
        // Show success message
        toast.success('Profile updated successfully!', { duration: 2000 });
        
        // Close modal after success
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setPhase('failed');
        toast.error(resultAction.payload || 'Failed to update profile. Please try again.', { duration: 2000 });
      }
      
    } catch (error) {
      setPhase('failed');
      toast.error('Failed to update profile. Please try again.', { duration: 2000 });
    }
  };

  const handleModalClose = (open) => {
    if (!open && phase !== 'loading') {
      onClose();
    }
  };

  const handleBackToForm = () => {
    setPhase('form');
    setErrors({});
  };

  const isCloseDisabled = phase === 'loading' || status === 'loading';

  return (
    <Dialog open={isOpen} onOpenChange={isCloseDisabled ? undefined : handleModalClose}>
      <DialogContent
        className="sm:max-w-lg rounded-2xl shadow-xl p-0 overflow-hidden bg-white"
        showCloseButton={!isCloseDisabled}
      >
        <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-900">
              Edit Profile
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              Update your personal information
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-0">
          <AnimatePresence mode="wait">
            {phase === 'form' && (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="grid gap-5"
              >
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  {/* First Name */}
                  <div className="grid gap-2">
                    <label htmlFor="firstName" className="text-sm font-medium text-slate-800">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <User className="text-[#f6851f] h-4 w-4" />
                      </div>
                      <input
                        disabled
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="First name"
                        className="text-[#f6851f] cursor-not-allowed h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_4px_rgba(15,23,42,0.08)]"
                      />
                    </div>
                    {errors.firstName && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-600"
                      >
                        {errors.firstName}
                      </motion.p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="grid gap-2">
                    <label htmlFor="lastName" className="text-sm font-medium text-slate-800">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <User className="text-[#f6851f] h-4 w-4" />
                      </div>
                      <input
                        disabled
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Last name"
                        className="cursor-not-allowed text-[#f6851f] h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_4px_rgba(15,23,42,0.08)]"
                      />
                    </div>
                    {errors.lastName && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-600"
                      >
                        {errors.lastName}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-800">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail className="text-[#f6851f] h-4 w-4" />
                    </div>
                    <input
                      disabled
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="user@example.com"
                      className="cursor-not-allowed text-[#f6851f] h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_4px_rgba(15,23,42,0.08)]"
                    />
                  </div>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-600"
                    >
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Phone Field */}
                <div className="grid gap-2">
                  <label htmlFor="phone" className="text-sm font-medium text-slate-800">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_4px_rgba(15,23,42,0.08)]"
                    />
                  </div>
                  {errors.phone && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-600"
                    >
                      {errors.phone}
                    </motion.p>
                  )}
                </div>

                {/* Address Field */}
                <div className="grid gap-2">
                  <label htmlFor="address" className="text-sm font-medium text-slate-800">
                    Address (Optional)
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Main Street, City, State 12345"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_4px_rgba(15,23,42,0.08)]"
                    />
                  </div>
                  {errors.address && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-600"
                    >
                      {errors.address}
                    </motion.p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="cursor-pointer w-full h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold shadow-lg shadow-orange-500/20 transition hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === 'loading' ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating Profile...
                      </div>
                    ) : (
                      'Update Profile'
                    )}
                  </button>
                </div>

                {/* Security Notice */}
                <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <ShieldCheck className="h-4 w-4 text-slate-700" />
                  Your information is encrypted and secure
                </div>
              </motion.form>
            )}

            {phase === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="grid gap-6 place-items-center text-center"
              >
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 w-full">
                  <div className="flex items-center gap-3 p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-700" />
                    <span className="text-sm text-slate-700">Updating your profile...</span>
                  </div>
                  <div className="h-1 w-full bg-slate-200">
                    <motion.div
                      className="h-1 bg-slate-800"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ ease: "easeOut", duration: 1.5 }}
                    />
                  </div>
                </div>
                <div className="text-sm text-slate-600">
                  Please wait while we update your information...
                </div>
              </motion.div>
            )}

            {phase === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="grid gap-5 place-items-center text-center"
              >
                <motion.div
                  className="relative"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 340, damping: 18 }}
                >
                  <div className="grid place-items-center rounded-2xl border border-green-200 bg-gradient-to-b from-white to-emerald-50 p-4 shadow-sm">
                    <CheckCircle2 className="h-14 w-14 text-green-500" />
                  </div>
                  <Sparkles className="absolute -right-2 -top-2 h-4 w-4 text-amber-500" />
                </motion.div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-slate-900">Profile Updated!</h3>
                  <p className="text-sm text-slate-600">Your profile has been successfully updated.</p>
                </div>
              </motion.div>
            )}

            {phase === 'failed' && (
              <motion.div
                key="failed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="grid gap-5 place-items-center text-center"
              >
                <motion.div
                  className="relative"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 340, damping: 18 }}
                >
                  <div className="grid place-items-center rounded-2xl border border-red-200 bg-gradient-to-b from-white to-red-50 p-4 shadow-sm">
                    <XCircle className="h-14 w-14 text-red-500" />
                  </div>
                </motion.div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-slate-900">Update Failed</h3>
                  <p className="text-sm text-slate-600">Please try again.</p>
                </div>
                <button
                  onClick={handleBackToForm}
                  className="cursor-pointer w-full max-w-[200px] h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold shadow-lg shadow-orange-500/20 transition hover:from-orange-600 hover:to-amber-600"
                >
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
