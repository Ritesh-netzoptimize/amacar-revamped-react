import { useState, useEffect, useMemo, useRef } from 'react';

const useLoadMore = (items = [], itemsPerPage = 2) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const prevItemsLengthRef = useRef(items.length);

  // Calculate pagination
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const endIndex = Math.min(currentPage * itemsPerPage, items.length);
  const paginatedItems = items.slice(0, endIndex);
  const hasMoreItems = endIndex < items.length;
  const remainingItems = Math.max(0, items.length - paginatedItems.length);

  // Debug logging
  // console.log('useLoadMore calculation:', {
  //   itemsLength: items.length,
  //   itemsPerPage,
  //   currentPage,
  //   endIndex,
  //   totalPages,
  //   hasMoreItems,
  //   remainingItems,
  //   paginatedItemsLength: paginatedItems.length
  // });

  // Reset to first page when items length changes (not on every items change)
  useEffect(() => {
    if (items.length !== prevItemsLengthRef.current) {
      setCurrentPage(1);
      prevItemsLengthRef.current = items.length;
    }
  }, [items.length]);

  // Load more handler
  const handleLoadMore = () => {
    // console.log('useLoadMore handleLoadMore called:', {
    //   hasMoreItems,
    //   isLoadingMore,
    //   currentPage,
    //   itemsLength: items.length,
    //   endIndex,
    //   remainingItems
    // });
    
    if (hasMoreItems && !isLoadingMore) {
      setIsLoadingMore(true);
      
      // Random delay between 800ms to 1500ms for better UX
      const randomDelay = Math.random() * 700 + 800;
      
      setTimeout(() => {
        setCurrentPage(prev => {
          const newPage = prev + 1;
          // console.log('useLoadMore page updated:', { from: prev, to: newPage });
          return newPage;
        });
        setIsLoadingMore(false);
      }, randomDelay);
    }
  };

  return {
    paginatedItems,
    hasMoreItems,
    remainingItems,
    currentPage,
    totalPages,
    isLoadingMore,
    handleLoadMore,
    setCurrentPage,
    setIsLoadingMore
  };
};

export default useLoadMore;
