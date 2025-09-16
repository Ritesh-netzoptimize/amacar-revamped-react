import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

const LoadMore = ({ 
  items = [], 
  itemsPerPage = 2, 
  onLoadMore, 
  isLoadingMore = false, 
  SkeletonComponent,
  className = "",
  buttonText = "Load More",
  loadingText = "Loading...",
  showRemainingCount = true,
  hasMoreItems = true,
  remainingItems = 0
}) => {
  // Handle load more
  const handleLoadMore = () => {
    if (hasMoreItems && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  };

  // Debug logging
  console.log('LoadMore Debug:', {
    itemsLength: items.length,
    hasMoreItems,
    remainingItems,
    itemsPerPage
  });

  // Don't render if no items or no more items to load
  if (!items.length) {
    console.log('LoadMore: No items, not rendering');
    return null;
  }

  // Don't render if no more items to load
  if (!hasMoreItems) {
    console.log('LoadMore: No more items, not rendering');
    return null;
  }

  return (
    <>
      {/* Load More Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mt-8 flex justify-center ${className}`}
      >
        <motion.button
          onClick={handleLoadMore}
          disabled={isLoadingMore}
          className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
            isLoadingMore
              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
              : 'bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg cursor-pointer'
          }`}
          whileHover={!isLoadingMore ? { scale: 1.02 } : {}}
          whileTap={!isLoadingMore ? { scale: 0.98 } : {}}
        >
          {isLoadingMore ? (
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>{loadingText}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-extrabold">{buttonText}</span>
              {showRemainingCount && (
                <span className="text-sm opacity-75">
                  ({remainingItems} remaining)
                </span>
              )}
            </div>
          )}
        </motion.button>
      </motion.div>

      {/* Loading Skeleton */}
      <AnimatePresence>
        {isLoadingMore && SkeletonComponent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mt-6"
          >
            <SkeletonComponent />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LoadMore;
