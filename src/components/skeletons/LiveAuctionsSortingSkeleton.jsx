import { motion } from 'framer-motion';


export default function LiveAuctionsSortingSkeleton() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
          },
        },
      };
    
      const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: "easeOut" },
        },
      };
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="col-span-full"
            >
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="card overflow-hidden animate-pulse">
                    <div className="h-48 bg-neutral-200"></div>
                    <div className="p-6">
                    <div className="h-6 bg-neutral-200 rounded-md w-3/4 mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded-md w-full mb-2"></div>
                    <div className="h-3 bg-neutral-200 rounded-md w-1/2 mb-4"></div>
                    <div className="h-16 bg-neutral-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-neutral-200 rounded-md w-1/3 mb-4"></div>
                    <div className="flex space-x-4">
                        <div className="h-10 bg-neutral-200 rounded-lg flex-1"></div>
                        <div className="h-10 bg-neutral-200 rounded-lg flex-1"></div>
                    </div>
                    </div>
                </div>
                ))}
            </div>
        </motion.div>   
    )
}