import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Edit3 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { loadUser } from '../redux/slices/userSlice';
import EditProfileModal from '../components/ui/EditProfileModal';
import ChangePasswordModal from '@/components/ui/ChangePasswordModal';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.user);
  const [showEditModal, setShowEditModal] = useState(false);


  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  
  // Default profile data structure
  const defaultProfile = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    bio: 'Car enthusiast and frequent seller on Amacar platform.',
    joinDate: '',
    totalAuctions: 0,
    totalEarnings: 0,
    rating: 0,
  };

  const [profile, setProfile] = useState(defaultProfile);
  const [editData, setEditData] = useState({ ...profile });


  const handlePasswordChange = async ({ currentPassword, newPassword }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success/failure based on current password
      if (currentPassword === "wrongpassword") {
        throw new Error("Invalid current password");
      }
      
      // Here you would make the actual API call
      console.log("Password changed successfully", { currentPassword, newPassword });
      
      // You might want to show a toast notification here
      return true;
    } catch (error) {
      console.error("Password change failed:", error);
      throw error;
    }
  };


  // Load user data from Redux state
  useEffect(() => {
    if (user) {
      const userProfile = {
        firstName: user.firstName || user.first_name || '',
        lastName: user.lastName || user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || defaultProfile.bio,
        joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
        totalAuctions: user.totalAuctions || user.total_auctions || 0,
        totalEarnings: user.totalEarnings || user.total_earnings || 0,
        rating: user.rating || 0,
      };
      setProfile(userProfile);
      setEditData(userProfile);
    }
  }, [user]);

  // Load user data on component mount
  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  const handleEdit = () => {
    setEditData({ ...profile });
    setShowEditModal(true);
  };

  const handleSave = async (updatedData) => {
    try {
      // The updateProfile action is already called in the EditProfileModal
      // This function is called after successful API update
      setProfile({ ...updatedData });
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setEditData({ ...profile });
    setShowEditModal(false);
  };


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

  if (loading) {
    return (
      <div className="mt-16 min-h-screen bg-gradient-hero p-8">
        <div className="max-w-6xl mx-auto">
          <div className="card p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 rounded w-48"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 min-h-screen bg-gradient-hero p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="card p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-neutral-800">Profile Settings</h1>
              <button
                onClick={handleEdit}
                className="btn-secondary flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Profile Picture */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-primary-600" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-800">
                  {profile.firstName && profile.lastName 
                    ? `${profile.firstName} ${profile.lastName}`
                    : 'User Profile'
                  }
                </h2>
                <p className="text-neutral-600">
                  {profile.joinDate ? `Member since ${profile.joinDate}` : 'New member'}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-neutral-600">Rating:</span>
                    <span className="font-semibold text-warning">{profile.rating}/5</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-neutral-600">Auctions:</span>
                    <span className="font-semibold text-primary-600">{profile.totalAuctions}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Information */}
          <motion.div variants={itemVariants} className="card p-8 mb-8">
            <h3 className="text-xl font-bold text-neutral-800 mb-6">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Email Address
                </label>
                <div className="flex items-center space-x-2 text-neutral-600">
                  <Mail className="w-5 h-5" />
                  <span>{profile.email || 'Not provided'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Phone Number
                </label>
                <div className="flex items-center space-x-2 text-neutral-600">
                  <Phone className="w-5 h-5" />
                  <span>{profile.phone || 'Not provided'}</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Address
                </label>
                <div className="flex items-center space-x-2 text-neutral-600">
                  <MapPin className="w-5 h-5" />
                  <span>{profile.address || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Statistics */}
          <motion.div variants={itemVariants} className="card p-8 mb-8">
            <h3 className="text-xl font-bold text-neutral-800 mb-6">Your Statistics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-primary-50 rounded-xl">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {profile.totalAuctions}
                </div>
                <div className="text-sm text-neutral-600">Total Auctions</div>
              </div>
              
              <div className="text-center p-6 bg-success/10 rounded-xl">
                <div className="text-3xl font-bold text-success mb-2">
                  ${profile.totalEarnings.toLocaleString()}
                </div>
                <div className="text-sm text-neutral-600">Total Earnings</div>
              </div>
              
              <div className="text-center p-6 bg-warning/10 rounded-xl">
                <div className="text-3xl font-bold text-warning mb-2">
                  {profile.rating}
                </div>
                <div className="text-sm text-neutral-600">Average Rating</div>
              </div>
            </div>
          </motion.div>

          {/* Account Settings */}
          <motion.div variants={itemVariants} className="card p-8">
            <h3 className="text-xl font-bold text-neutral-800 mb-6">Account Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-b border-neutral-200">
                <div>
                  <h4 className="font-semibold text-neutral-800">Email Notifications</h4>
                  <p className="text-sm text-neutral-600">Receive updates about your auctions and offers</p>
                </div>
                <button className="w-12 h-6 bg-primary-500 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between py-4 border-b border-neutral-200">
                <div>
                  <h4 className="font-semibold text-neutral-800">SMS Notifications</h4>
                  <p className="text-sm text-neutral-600">Get text alerts for important updates</p>
                </div>
                <button className="w-12 h-6 bg-neutral-300 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-neutral-800">Change Password</h4>
                  <p className="text-sm text-neutral-600">Set you new password here</p>
                </div>
                <button className="btn-secondary cursor-pointer " onClick={() => setIsChangePasswordModalOpen(true)}>
                  Change Password
                </button>
              </div>
              <div className="flex items-center justify-between py-4">
                <div>
                  <h4 className="font-semibold text-neutral-800">Two-Factor Authentication</h4>
                  <p className="text-sm text-neutral-600">Add an extra layer of security to your account</p>
                </div>
                <button className="btn-secondary">
                  Enable
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onPasswordChange={handlePasswordChange}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={handleCancel}
        onSave={handleSave}
        initialData={editData}
      />
    </div>
  );
};

export default ProfilePage;
