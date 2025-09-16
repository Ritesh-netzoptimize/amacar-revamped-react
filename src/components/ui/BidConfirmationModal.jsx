import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

const BidConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  action, 
  bidData, 
  isLoading = false,
  error = null,
  success = false
}) => {
  if (!isOpen || !bidData) return null;

  const isAccept = action === 'accept';
  const isReject = action === 'reject';

  const getModalConfig = () => {
    if (isAccept) {
      return {
        icon: CheckCircle,
        iconColor: 'text-success',
        iconBg: 'bg-success/10',
        title: 'Accept This Bid?',
        description: `Are you sure you want to accept this bid of ${formatCurrency(parseFloat(bidData.amount))}?`,
        confirmText: 'Yes, Accept Bid',
        confirmClass: 'bg-success hover:bg-success/90 text-white',
        cancelText: 'Cancel',
        accentColor: 'border-success/20',
        bgGradient: 'from-success/5 to-success/10'
      };
    } else if (isReject) {
      return {
        icon: XCircle,
        iconColor: 'text-red-500',
        iconBg: 'bg-red-50',
        title: 'Reject This Bid?',
        description: `Are you sure you want to reject this bid of ${formatCurrency(parseFloat(bidData.amount))}? This action cannot be undone.`,
        confirmText: 'Yes, Reject Bid',
        confirmClass: 'bg-red-500 hover:bg-red-600 text-white',
        cancelText: 'Cancel',
        accentColor: 'border-red-200',
        bgGradient: 'from-red-50 to-red-100'
      };
    }
    return null;
  };

  const config = getModalConfig();
  if (!config) return null;

  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`bg-white rounded-2xl shadow-2xl max-w-md w-full border-2 ${config.accentColor} overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient background */}
            <div className={`bg-gradient-to-r ${config.bgGradient} p-6 border-b ${config.accentColor}`}>
              <div className="flex items-center justify-center mb-4">
                <div className={`w-16 h-16 ${config.iconBg} rounded-full flex items-center justify-center`}>
                  <IconComponent className={`w-8 h-8 ${config.iconColor}`} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-neutral-800 text-center mb-2">
                {config.title}
              </h2>
              <p className="text-neutral-600 text-center text-sm leading-relaxed">
                {config.description}
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Success Display */}
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-6 mt-4 p-4 bg-success/10 border border-success/20 rounded-xl"
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <p className="text-success text-sm font-medium">
                    Bid {action}ed successfully!
                  </p>
                </div>
              </motion.div>
            )}

            {/* Bid Details */}
            <div className="p-6 bg-neutral-50">
              <div className="bg-white rounded-xl p-4 border border-neutral-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-neutral-800">
                      {bidData.bidder_display_name || 'Unknown Bidder'}
                    </h3>
                
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${isAccept ? 'text-success' : 'text-red-500'}`}>
                      {formatCurrency(parseFloat(bidData.amount))}
                    </div>
                   
                  </div>
                </div>
                
                {bidData.notes && (
                  <div className="mt-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                    <span className="text-neutral-500 text-sm">Notes:</span>
                    <p className="text-neutral-800 text-sm mt-1">{bidData.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200 bg-white">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="cursor-pointer px-6 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {config.cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`cursor-pointer px-6 py-2.5 ${config.confirmClass} rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105`}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <IconComponent className="w-4 h-4" />
                    <span>{config.confirmText}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BidConfirmationModal;
