import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, CheckCircle2, Car, User, Mail, Lock, MapPin, Globe, EyeOff, Eye, XCircle, Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { registerWithVin } from "@/redux/slices/userSlice"
import { useDispatch, useSelector } from "react-redux"
import { 
  setVehicleDetails, 
  fetchCityStateByZip, 
  clearLocation,
  setModalLoading,
  setModalError,
  setModalSuccess,
  resetModalState,
  setStateVin
} from "@/redux/slices/carDetailsAndQuestionsSlice"
import { useNavigate } from "react-router-dom"

export default function AuctionModal({
  isOpen,
  onClose,
  title = "Auction Your Ride",
  description = "Get the best value for your vehicle with competitive bidding",
}) {
  // UI state
  const [vin, setVin] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({
    vin: "", firstName: "", lastName: "", email: "", phone: "",
    password: "", confirmPassword: "", zipCode: "",
  })
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { 
    location, 
    locationStatus, 
    locationError,
    modalState 
  } = useSelector((state) => state.carDetailsAndQuestions);
  
  const { status: userStatus, error: userError } = useSelector((state) => state.user);
  
  const isCloseDisabled = modalState.isLoading;

  // Debounced ZIP code lookup
  const debouncedZipLookup = useCallback(
    (() => {
      let timeoutId;
      return (zip) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (zip && zip.length === 5 && /^\d{5}$/.test(zip)) {
            console.log('Dispatching ZIP lookup for:', zip);
            dispatch(fetchCityStateByZip(zip));
          } else if (zip.length === 0) {
            // Clear location when ZIP is empty
            dispatch(clearLocation());
            setCity("");
            setState("");
          }
        }, 500);
      };
    })(),
    [dispatch]
  );

  // Handle ZIP code changes
  const handleZipCodeChange = (value) => {
    setZipCode(value);
    debouncedZipLookup(value);
  };

  // Update city and state when Redux location changes
  useEffect(() => {
    if (locationStatus === 'succeeded' && location.city && location.state) {
      setCity(location.city);
      setState(location.state);
    }
  }, [location, locationStatus]);

  function validate() {
    const newErrors = {
      vin: "", firstName: "", lastName: "", email: "", phone: "",
      password: "", confirmPassword: "", zipCode: "",
    }

    // VIN validation
    if (!vin) {
      newErrors.vin = "Please enter a valid VIN number."
    } else if (vin.length !== 17) {
      newErrors.vin = "VIN must be 17 characters."
    }

    // First Name validation
    if (!firstName) {
      newErrors.firstName = "This field is required."
    }

    // Last Name validation
    if (!lastName) {
      newErrors.lastName = "This field is required."
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email) {
      newErrors.email = "This field is required."
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address."
    }

    // Phone validation
    if (!phone) {
      newErrors.phone = "This field is required."
    }

    // Password validation
    if (!password) {
      newErrors.password = "This field is required."
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters."
    }

    // Confirm Password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "This field is required."
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match."
    }

    // Zip Code validation
    const zipRegex = /^\d{5}(-\d{4})?$/
    if (!zipCode) {
      newErrors.zipCode = "This field is required."
    } else if (!zipRegex.test(zipCode)) {
      newErrors.zipCode = "Please enter a valid zip code."
    }

    setErrors(newErrors)
    return Object.values(newErrors).every(error => !error)
  }

  async function startAction() {
    // First, validate the form
    if (!validate()) return;
  
    // Set loading state in Redux
    dispatch(setModalLoading(true));
  
    try {
      // Prepare the form values for API
      const formValues = {
        vin,
        firstName,
        lastName,
        email,
        phone,
        password,
        confirmPassword,
        zip: zipCode,
        city,
        state,
      };
  
      // Dispatch registerWithVin thunk
      const resultAction = await dispatch(registerWithVin(formValues));
  
      if (registerWithVin.fulfilled.match(resultAction)) {
        // Registration successful, store vehicle data in vehicle slice
        dispatch(setVehicleDetails(resultAction.payload));
        dispatch(setModalSuccess("Registration successful! Redirecting to auction page..."));
        dispatch(setStateVin(vin))
        // Navigate after a short delay to show success message
        setTimeout(() => {
          navigate('/auction-page');
        }, 1500);

      } else {
        // Handle API error
        const errorMessage = resultAction.payload || 'Registration failed. Please try again.';
        dispatch(setModalError(errorMessage));
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      dispatch(setModalError('An unexpected error occurred. Please try again.'));
    }
  }
  

  function handleSubmit(e) {
    e?.preventDefault()
    console.log("firstName: ", firstName)
    console.log("lastname: ", lastName)
    console.log("email: ", email)
    console.log("phone: ", phone)
    console.log("password: ", password)
    console.log("confirm password: ", confirmPassword)
    console.log("vin: ", vin)
    console.log("zip: ", zipCode)
    console.log("state: ", state)
    console.log("city: ", city)
    if (validate()) {
      startAction()
    }
  }

  function handleSuccessAction() {
    onClose(false)
    console.log("Auction submitted successfully")
  }

  const handleOpenChange = (open) => {
    if (!open) {
      // Reset all local state
      setVin("");
      setZipCode("");
      setCity("");
      setConfirmPassword("");
      setPassword("");
      setEmail("");
      setFirstName("");
      setLastName("");
      setPhone("");
      setState("");
      setErrors({});
      
      // Reset Redux state
      dispatch(clearLocation());
      dispatch(resetModalState());
      
      onClose(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={isCloseDisabled ? undefined : handleOpenChange}>
      <DialogContent
        className="lg:mt-[1rem] mt-[2rem] sm:max-w-3xl rounded-xl shadow-xl p-0 overflow-hidden bg-white max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        showCloseButton={!isCloseDisabled}
      >
        <div className="bg-[#f6851f] p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              {title}
            </DialogTitle>
            
            
          </DialogHeader>
        </div>

        <div className="p-6 pt-0 min-h-[520px]">
          <AnimatePresence mode="wait">
            {modalState.phase === "form" && (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="rounded-xl bg-white shadow-lg p-6 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* VIN Field */}
                    <div className="grid gap-1">
                      <label htmlFor="vin" className="text-sm font-medium text-slate-800">
                        VIN Number *
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <Car className="h-4 w-4" />
                        </div>
                        <input
                          id="vin"
                          type="text"
                          value={vin}
                          onChange={(e) => setVin(e.target.value)}
                          placeholder="Enter your vehicle's VIN number"
                          className="h-11 w-full rounded-md border border-slate-200 px-9 py-2 text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_3px_rgba(249,115,22,0.5)]"
                        />
                      </div>
                      {errors.vin && (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-500 mt-1"
                        >
                          {errors.vin}
                        </motion.p>
                      )}
                    </div>

                    {/* First Name Field */}
                    <div className="grid gap-1">
                      <label htmlFor="firstName" className="text-sm font-medium text-slate-800">
                        First Name *
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <User className="h-4 w-4" />
                        </div>
                        <input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Enter your first name"
                          className="h-11 w-full rounded-md border border-slate-200 px-9 py-2 text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_3px_rgba(249,115,22,0.5)]"
                        />
                      </div>
                      {errors.firstName && (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-500 mt-1"
                        >
                          {errors.firstName}
                        </motion.p>
                      )}
                    </div>


                      {/* Email Field */}
                      <div className="grid gap-1">
                      <label htmlFor="email" className="text-sm font-medium text-slate-800">
                        Email Address *
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          className="h-11 w-full rounded-md border border-slate-200 px-9 py-2 text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_3px_rgba(249,115,22,0.5)]"
                        />
                      </div>
                      {errors.email && (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-500 mt-1"
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="grid gap-1">
                      <label htmlFor="password" className="text-sm font-medium text-slate-800">
                        Password *
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <Lock className="h-4 w-4" />
                        </div>
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="h-11 w-full rounded-md border border-slate-200 px-9 py-2 text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_3px_rgba(249,115,22,0.5)]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-500 mt-1"
                        >
                          {errors.password}
                        </motion.p>
                      )}
                    </div>

                       {/* City Field */}
                    <div className="grid gap-1">
                      <label htmlFor="city" className="text-sm font-medium text-slate-800">
                       
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <input
                          id="city"
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder={locationStatus === 'loading' ? "Looking up city..." : "Enter your city"}
                          disabled={locationStatus === 'loading' || (locationStatus === 'succeeded' && city)}
                          className={`h-11 w-full rounded-md border px-9 py-2 text-sm outline-none ring-0 transition-shadow ${
                            locationStatus === 'loading' 
                              ? 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed' 
                              : locationStatus === 'succeeded' && city
                              ? 'border-green-200 bg-green-50 text-green-800 cursor-not-allowed'
                              : 'border-slate-200 focus:shadow-[0_0_0_3px_rgba(249,115,22,0.5)]'
                          }`}
                        />
                      </div>
                    </div>

                    
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">

                      {/* Zip Code Field */}
                    <div className="grid gap-1">
                      <label htmlFor="zipCode" className="text-sm font-medium text-slate-800">
                        Zip Code *
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <input
                          id="zipCode"
                          type="number"
                          maxLength={5}
                          value={zipCode}
                          onChange={(e) => handleZipCodeChange(e.target.value)}
                          placeholder="Enter your zip code"
                          className="h-11 w-full rounded-md border border-slate-200 px-9 py-2 text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_3px_rgba(249,115,22,0.5)]"
                        />
                        {locationStatus === 'loading' && (
                          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                          </div>
                        )}
                      </div>
                      {errors.zipCode && (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-500 mt-1"
                        >
                          {errors.zipCode}
                        </motion.p>
                      )}
                      {locationError && (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-500 mt-1"
                        >
                          {locationError}
                        </motion.p>
                      )}
                    </div>

                     {/* Last Name Field */}
                     <div className="grid gap-1">
                      <label htmlFor="lastName" className="text-sm font-medium text-slate-800">
                        Last Name *
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <User className="h-4 w-4" />
                        </div>
                        <input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Enter your last name"
                          className="h-11 w-full rounded-md border border-slate-200 px-9 py-2 text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_3px_rgba(249,115,22,0.5)]"
                        />
                      </div>
                      {errors.lastName && (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-500 mt-1"
                        >
                          {errors.lastName}
                        </motion.p>
                      )}
                    </div>

                    


                    {/* Phone Number Field */}
                    <div className="grid gap-1">
                      <label htmlFor="phone" className="text-sm font-medium text-slate-800">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter your phone number"
                          className="h-11 w-full rounded-md border border-slate-200 px-9 py-2 text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_3px_rgba(249,115,22,0.5)]"
                        />
                      </div>
                      {errors.phone && (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-500 mt-1"
                        >
                          {errors.phone}
                        </motion.p>
                      )}
                    </div>

                   
                    {/* Confirm Password Field */}
                    <div className="grid gap-1">
                      <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-800">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <Lock className="h-4 w-4" />
                        </div>
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your password"
                          className="h-11 w-full rounded-md border border-slate-200 px-9 py-2 text-sm outline-none ring-0 transition-shadow focus:shadow-[0_0_0_3px_rgba(249,115,22,0.5)]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <motion.p 
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-500 mt-1"
                        >
                          {errors.confirmPassword}
                        </motion.p>
                      )}
                    </div>

                    {/* State Field */}
                    <div className="grid gap-1">
                      <label htmlFor="state" className="text-sm font-medium text-slate-800">
                       
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <input
                          id="state"
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          placeholder={locationStatus === 'loading' ? "Looking up state..." : "Enter your state"}
                          disabled={locationStatus === 'loading' || (locationStatus === 'succeeded' && state)}
                          className={`h-11 w-full rounded-md border px-9 py-2 text-sm outline-none ring-0 transition-shadow ${
                            locationStatus === 'loading' 
                              ? 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed' 
                              : locationStatus === 'succeeded' && state
                              ? 'border-green-200 bg-green-50 text-green-800 cursor-not-allowed'
                              : 'border-slate-200 focus:shadow-[0_0_0_3px_rgba(249,115,22,0.5)]'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Country Field */}
                    
                  </div>
                </div>

                {/* Auction Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={modalState.isLoading}
                    className="cursor-pointer w-full h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold shadow-lg shadow-orange-500/20 transition hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {modalState.isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </div>
                    ) : (
                      "Auction Now"
                    )}
                  </button>
                </div>

                {/* Disclaimer */}
                <div className="text-center">
                  <p className="text-xs text-slate-600">
                    By submitting this form, you agree to our{" "}
                    <a href="#" className="underline text-[var(--brand-orange)] hover:no-underline">Terms of Service</a>{" "}
                    and{" "}
                    <a href="#" className="underline text-[var(--brand-orange)] hover:no-underline">Privacy Policy</a>.
                  </p>
                </div>
              </motion.form>
            )}

            {modalState.phase === "loading" && (
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
                    <span className="text-sm text-slate-700">Submitting your auction details...</span>
                  </div>
                  <div className="h-1 w-full bg-slate-200">
                    <motion.div
                      className="h-1 bg-slate-800"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ ease: "easeOut", duration: 1.8 }}
                    />
                  </div>
                </div>
                <div className="text-sm text-slate-600">
                  Please wait while we process your submission...
                </div>
              </motion.div>
            )}

            {modalState.phase === "success" && (
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
                  <h3 className="text-lg font-semibold text-slate-900">Registration Successful!</h3>
                  <p className="text-sm text-slate-600">
                    {modalState.successMessage || "Your vehicle has been successfully submitted for auction."}
                  </p>
                </div>
                <button
                  onClick={handleSuccessAction}
                  className="cursor-pointer w-full h-11 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-lg shadow-slate-900/20 hover:bg-slate-800"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {modalState.phase === "error" && (
              <motion.div
                key="error"
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
                  <h3 className="text-lg font-semibold text-slate-900">Registration Failed</h3>
                  <p className="text-sm text-slate-600">
                    {modalState.error || "An error occurred during registration. Please try again."}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => dispatch(resetModalState())}
                    className="cursor-pointer px-6 h-11 rounded-xl bg-slate-900 text-white text-sm font-semibold shadow-lg shadow-slate-900/20 hover:bg-slate-800"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => handleOpenChange(false)}
                    className="cursor-pointer px-6 h-11 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}