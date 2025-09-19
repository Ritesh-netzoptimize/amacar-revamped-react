import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, AlertTriangle, X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ConfirmRelistVehicleModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  vehicleName,
  vehicleData = null, // Contains product_id, vin, zip, etc.
  isLoading = false 
}) => {
  const [hasChanges, setHasChanges] = useState(null); // null, true, false
  const navigate = useNavigate();

  const handleRelist = () => {
    if (hasChanges === null) return;
    
    if (hasChanges === true) {
      // User selected "Yes" - redirect to auction page with data
      const auctionData = {
        product_id: vehicleData?.product_id,
        vin: vehicleData?.vin,
        zip: vehicleData?.zip,
        vehicleName: vehicleName,
        vehicleType: vehicleData?.vehicleType || vehicleData?.make + ' ' + vehicleData?.model,
        hasChanges: true
      };
      
      // Simulate loading state
      setTimeout(() => {
        navigate('/auction-page', { state: auctionData });
        onClose();
      }, 1000);
    } else {
      // User selected "No" - call the existing re-auction API
      const relistData = {
        hasChanges,
        vehicleData,
        vehicleName
      };
      
      onConfirm(relistData);
    }
  };

  const resetModal = () => {
    setHasChanges(null);
  };

  // Reset modal when it opens/closes
  useEffect(() => {
    if (isOpen) {
      resetModal();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={isLoading ? undefined : onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-800">Any Change in Your Vehicle?</h2>
                  <p className="text-sm text-neutral-600">Please let us know if anything has changed</p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5 text-neutral-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Vehicle Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800">{vehicleName}</h3>
                    <p className="text-sm text-neutral-600">Ready for relisting</p>
                  </div>
                </div>
              </div>

              {/* Question */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-neutral-800 mb-4 text-center">
                  Has anything changed with your vehicle since the last assessment?
                </h3>
                
                {/* Yes/No Buttons */}
                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={() => setHasChanges(true)}
                    disabled={isLoading}
                    className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      hasChanges === true
                        ? 'bg-green-500 text-white shadow-lg transform scale-105'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setHasChanges(false)}
                    disabled={isLoading}
                    className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      hasChanges === false
                        ? 'bg-red-500 text-white shadow-lg transform scale-105'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-6 py-3 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRelist}
                  disabled={isLoading || hasChanges === null}
                  className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      <span>Relist Vehicle</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmRelistVehicleModal;
