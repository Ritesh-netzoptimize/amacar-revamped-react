import React, { useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Users, CheckCircle, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { getInstantCashOffer } from "@/redux/slices/carDetailsAndQuestionsSlice"

export default function AuctionSelectionModal({ isOpen, onClose, userFormData = null }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { questions, vehicleDetails, stateZip, stateVin, location } = useSelector((state) => state.carDetailsAndQuestions)
  const userState = useSelector((state) => state.user.user)
  
  const [selectedOption, setSelectedOption] = useState(null) // 'local' or 'all' or null
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contactConsent, setContactConsent] = useState(false)
  const [termsConsent, setTermsConsent] = useState(false)

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId)
    // Reset consent states when switching options
    if (optionId !== "all") {
      setContactConsent(false)
      setTermsConsent(false)
    }
  }
  
  const auctionOptions = [
    {
      id: "local",
      title: "Local Auction",
      subtitle: "Three verified dealers are actively interested in buying your car",
      icon: MapPin,
      color: "from-blue-500 to-blue-600",
      borderColor: "border-blue-200",
      bgColor: "bg-blue-50/50",
      consentText: "I have read Terms of Service and Privacy Policy and I agree to share my contact details with Amacar’s participating dealers, who may contact me by phone, text, or email about this offer..",
      termsText: "I agree"
    },
    {
      id: "all", 
      title: "All (Dealerships across platform)",
      subtitle: "See if more dealers across Amacar can beat these offers — would you like to explore?",
      icon: Users,
      color: "from-orange-500 to-orange-600",
      borderColor: "border-orange-200",
      bgColor: "bg-orange-50/50",
      consentText: "Additional dealerships on the Amacar platform may provide more competitive offers. By consenting, I authorize Amacar to share my details with member dealerships for this purpose. Dealers may contact me by phone, text, or email"
    }
  ]
  // Build the API request payload for Instant Cash Offer
  function buildOfferPayload() {
    const conditionData = questions ? questions.map((q) => ({
      question_key: q.key,
      question_text: q.label,
      answer: q.answer,
      details: q.details
    })) : [];

    // Build question deductions
    const questionDeductions = {};
    conditionData.forEach(q => {
      if (q.key === 'cosmetic') {
        questionDeductions.cosmetic_condition = {
          'Excellent': 0,
          'Good': 100,
          'Fair': 300,
          'Poor': 500
        };
      } else if (q.key === 'smoked') {
        questionDeductions.smoked_windows = {
          'No': 0,
          'Yes': 200
        };
      }
    });

    // Map vehicle data to the correct API format
    const vehiclePayload = {
      mileage_km: parseInt(vehicleDetails.mileage || vehicleDetails.mileage_km || vehicleDetails.odometer || 0),
      exterior_color: vehicleDetails.exterior_color || vehicleDetails.color || vehicleDetails.exteriorColor || "Unknown",
      interior_color: vehicleDetails.interior_color || vehicleDetails.interiorColor || "Unknown", 
      body_type: vehicleDetails.body_type || vehicleDetails.bodyType || vehicleDetails.body_style || "Unknown",
      transmission: vehicleDetails.transmission || vehicleDetails.transmission_type || "Unknown",
      engine_type: vehicleDetails.engine_type || vehicleDetails.engineType || vehicleDetails.engine || "Unknown",
      powertrain_description: vehicleDetails.powertrain_description || vehicleDetails.powertrainDescription || vehicleDetails.drivetrain || "Unknown",
      vin: vehicleDetails.vin || vehicleDetails.vin_number || stateVin || "",
      zip_code: stateZip || ""
    };

    // Determine share_info_with based on selected option
    const shareInfoWith = selectedOption ? selectedOption : "";

    return {
      vehicle: vehiclePayload,
      condition_assessment: conditionData,
      question_deductions: questionDeductions,
      user_info: {
        full_name: userFormData?.fullName || userState?.display_name || "",
        email: userFormData?.email || userState?.email || "",
        phone: userFormData?.phone || userState?.meta?.phone || "",
        city: userFormData?.city || location.city || "",
        state: userFormData?.state || location.state || "",
        zip_code: userFormData?.zipcode || stateZip || ""
      },
      dealers_to_send_details: shareInfoWith,
      offer_terms: selectedOption ? "accepted" : "not_accepted"
    };
  }

  const handleGo = async () => {
    if (!selectedOption) {
      toast.error("Please select an auction option.")
      return
    }

    // Check for required consents when "all" option is selected
    if (selectedOption === "all") {
      if (!contactConsent || !termsConsent) {
        toast.error("Please agree to both consent checkboxes to proceed.")
        return
      }
    }

    try {
      setIsSubmitting(true);
      
      const offerPayload = buildOfferPayload();
      console.log("Submitting Instant Cash Offer with payload:", offerPayload);

      const result = await dispatch(getInstantCashOffer(offerPayload)).unwrap();
      console.log("Instant Cash Offer successful:", result);

      toast.success("Auction setup successful! Redirecting to review...");
      
      setTimeout(() => {
        onClose(false);
        navigate("/review");
      }, 1000);

    } catch (error) {
      console.error("Auction setup failed:", error);
      const errorMessage = error.message || error || "Failed to setup auction. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }
  

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl rounded-2xl shadow-xl p-0 overflow-hidden bg-white">
        <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-900">
              Hi, {userFormData?.fullName || userState?.display_name || "User"}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 mt-2">
              Choose your auction preferences to get the best offers for your vehicle
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-0">
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {auctionOptions.map((option, index) => {
              const IconComponent = option.icon
              const isSelected = selectedOption === option.id
              
              return (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => handleOptionSelect(option.id)}
                  className={`relative cursor-pointer rounded-2xl p-6 shadow-lg border-2 transition-all ${
                    isSelected 
                      ? 'border-green-400 ring-2 ring-green-200' 
                      : `${option.borderColor} border hover:border-gray-300`
                  } ${option.bgColor}`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${option.color} text-white shadow-lg`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {option.title}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {option.subtitle}
                        </p>
                      </div>
                    </div>
                    {isSelected ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="h-5 w-5" />
                    )}
                  </div>

                  {/* Consent Text */}
                  <div className="mb-4">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {option.consentText}
                    </p>
                  </div>

                  {/* Terms Checkbox */}
                  {option.id === "all" ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={contactConsent}
                          onChange={(e) => setContactConsent(e.target.checked)}
                          className="h-4 w-4 cursor-pointer mt-1"
                        />
                        <label className="text-sm text-slate-700 cursor-pointer">
                          I agree to share my contact information with Amacar's participating dealerships.
                        </label>
                      </div>
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={termsConsent}
                          onChange={(e) => setTermsConsent(e.target.checked)}
                          className="h-4 w-4 cursor-pointer mt-1"
                        />
                        <label className="text-sm text-slate-700 cursor-pointer">
                          I have read and agree to the Terms of Use and Privacy Policy.
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleOptionSelect(option.id)}
                        className="h-4 w-4 cursor-pointer mt-1"
                      />
                      <label className="text-sm text-slate-700 cursor-pointer">
                        {option.termsText}
                      </label>
                    </div>
                  )}

                  {/* Grab your offer button - only show on selected card */}
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="absolute bottom-4 right-4"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card selection when clicking button
                          handleGo();
                        }}
                        disabled={isSubmitting || (option.id === "all" && (!contactConsent || !termsConsent))}
                        className={`cursor-pointer inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] ${
                          !isSubmitting && (option.id !== "all" || (contactConsent && termsConsent))
                            ? 'bg-gradient-to-r from-[#f6851f] to-[#e63946] hover:from-orange-600 hover:to-red-600' 
                            : 'bg-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Setting up...
                          </div>
                        ) : (
                          'Continue →'
                        )}
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
