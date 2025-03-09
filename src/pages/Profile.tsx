import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../Web3Context';
import {
  Github, 
  Linkedin, 
  Twitter, 
  Shield, 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Award, 
  ExternalLink, 
  GraduationCap,
  Sparkles,
  CircleUserRound,
  BadgeCheck
} from 'lucide-react';
import { getUserData, uploadUserData } from '../services/helper';
import { UserProfile } from '../types';
import { toast, ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Constants for localStorage keys
const VERIFICATION_STORAGE_KEY = 'grantee_verification_status';
const PROFILE_COMPLETION_KEY = 'grantee_profile_completion';

// Types for verification status
interface VerificationState {
  satScore: {
    status: 'unverified' | 'pending' | 'verified' | 'rejected';
  };
  transcript: {
    file: File | null;
    status: 'unverified' | 'pending' | 'verified' | 'rejected';
  };
  collegeAttendance: {
    status: 'unverified' | 'pending' | 'verified' | 'rejected';
  };
  identity: {
    status: 'unverified' | 'pending' | 'verified' | 'rejected';
  };
}

// Custom toast configuration
const toastConfig = {
  position: "bottom-right" as const,
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  transition: Slide,
  className: "rounded-lg font-medium text-sm"
};

// Custom toast functions with unified styling
const showSuccessToast = (message: string) => {
  toast.success(`${message}`, {
    ...toastConfig,
    className: `${toastConfig.className} bg-green-50 text-green-800 border border-green-200`
  });
};

const showInfoToast = (message: string) => {
  toast.info(` ${message}`, {
    ...toastConfig,
    className: `${toastConfig.className} bg-blue-50 text-blue-800 border border-blue-200`
  });
};

const showErrorToast = (message: string) => {
  toast.error(`${message}`, {
    ...toastConfig,
    className: `${toastConfig.className} bg-red-50 text-red-800 border border-red-200`
  });
};

const showLoadingToast = (message: string) => {
  return toast.loading(`⏳ ${message}`, {
    ...toastConfig,
    className: `${toastConfig.className} bg-gray-50 text-gray-800 border border-gray-200`
  });
};

const updateToast = (id: string | number, type: "success" | "error", message: string) => {
  const emoji = type === "success" ? "✅" : "❌";
  toast.update(id, {
    ...toastConfig,
    render: `${emoji} ${message}`,
    type,
    isLoading: false,
    className: `${toastConfig.className} ${
      type === "success" 
        ? "bg-green-50 text-green-800 border border-green-200" 
        : "bg-red-50 text-red-800 border border-red-200"
    }`
  });
};

// Helper functions for localStorage
const saveVerificationState = (address: string, verificationState: VerificationState) => {
  try {
    // Save verification state with wallet address as part of the key
    localStorage.setItem(`${VERIFICATION_STORAGE_KEY}_${address}`, JSON.stringify(verificationState));
  } catch (error) {
    console.error('Error saving verification state to localStorage:', error);
  }
};

const saveProfileCompletion = (address: string, completion: number) => {
  try {
    localStorage.setItem(`${PROFILE_COMPLETION_KEY}_${address}`, completion.toString());
  } catch (error) {
    console.error('Error saving profile completion to localStorage:', error);
  }
};

const getVerificationState = (address: string): VerificationState | null => {
  try {
    const savedState = localStorage.getItem(`${VERIFICATION_STORAGE_KEY}_${address}`);
    if (savedState) {
      return JSON.parse(savedState);
    }
    return null;
  } catch (error) {
    console.error('Error retrieving verification state from localStorage:', error);
    return null;
  }
};

const getProfileCompletion = (address: string): number => {
  try {
    const saved = localStorage.getItem(`${PROFILE_COMPLETION_KEY}_${address}`);
    if (saved) {
      return parseInt(saved, 10);
    }
    return 20; // Default starting value
  } catch {
    return 20;
  }
};

const Profile: React.FC = () => {
  const { account } = useWeb3();
  const [profile, setProfile] = useState<UserProfile>({
    twitter: '',
    linkedIn: '',
    github: '',
    google: '',
  });

  const [socialConnections, setSocialConnections] = useState({
      github: false,
      linkedIn: false,
      twitter: false,
      google: false,
    });
    
  // Mock state for academic verification
  const [academicVerifications, setAcademicVerifications] = useState<VerificationState>({
    satScore: {
      status: 'unverified', // unverified, pending, verified, rejected
    },
    transcript: {
      file: null,
      status: 'unverified', // unverified, pending, verified, rejected
    },
    collegeAttendance: {
      status: 'unverified'
    },
    identity: {
      status: 'unverified'
    }
  });

  // Simple state to track profile completion
  const [profileCompletionPercent, setProfileCompletionPercent] = useState(20);

  // Load verification state and profile completion when wallet connects
  useEffect(() => {
    if (account) {
      // Load saved verification state if it exists
      const savedVerificationState = getVerificationState(account);
      if (savedVerificationState) {
        setAcademicVerifications(prev => ({
          ...prev,
          satScore: savedVerificationState.satScore,
          transcript: {
            ...prev.transcript,
            status: savedVerificationState.transcript.status
          },
          collegeAttendance: savedVerificationState.collegeAttendance,
          identity: savedVerificationState.identity
        }));
        
        // Also load the saved profile completion percentage
        const savedCompletion = getProfileCompletion(account);
        setProfileCompletionPercent(savedCompletion);
      }
    }
  }, [account]);

  // Save verification state when it changes
  useEffect(() => {
    if (account) {
      saveVerificationState(account, academicVerifications);
    }
  }, [academicVerifications, account]);

  // Save profile completion when it changes
  useEffect(() => {
    if (account) {
      saveProfileCompletion(account, profileCompletionPercent);
    }
  }, [profileCompletionPercent, account]);

  // If a user is connected, load existing profile data from localStorage
  useEffect(() => {
    fetchUserData();
  }, [account]);

  const fetchUserData = async()=>{
    if(!account){
      console.log("Please connect wallet!!!")
      return
    }
    
    // Avoid showing the loading toast if we're just initializing
    const isInitialLoad = !profile.twitter && !profile.linkedIn && !profile.github && !profile.google;
    
    try{
      // Only show the loading toast if it's not the initial load
      if (!isInitialLoad) {
        showInfoToast("Loading your profile data...");
      }
      
      const userProfile = await getUserData();
      if (userProfile) {
        setProfile(userProfile);
        
        // Only show the success toast if it's not the initial load
        if (!isInitialLoad) {
          showSuccessToast("Profile data loaded successfully");
        }
      }
    }catch(error){
      console.log("Error fetching user data: ",error)
      showErrorToast(`Error loading profile: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

   const handleSocialConnect = (platform: keyof typeof socialConnections) => {
      setSocialConnections(prev => ({
        ...prev,
        [platform]: true
      }));
      showSuccessToast(`Connected to ${platform.charAt(0).toUpperCase() + platform.slice(1)}`);
    };
  
  // Connect with College Board for SAT verification
  const connectWithCollegeBoard = () => {
    setAcademicVerifications(prev => ({
      ...prev,
      satScore: {
        ...prev.satScore,
        status: 'pending'
      }
    }));
    
    // Simulate API call
    showInfoToast('Connecting to College Board... This may take a moment');
    
    // Simulate response after 2 seconds
    setTimeout(() => {
      setAcademicVerifications(prev => ({
        ...prev,
        satScore: {
          ...prev.satScore,
          status: 'verified'
        }
      }));
      showSuccessToast('SAT score verified through College Board! Your scores have been securely confirmed.');
      
      // Update profile completion percentage
      const newCompletionPercentage = Math.min(profileCompletionPercent + 15, 100);
      setProfileCompletionPercent(newCompletionPercentage);
      
    }, 2000);
  };
  
  // Handle transcript file upload
  const handleTranscriptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAcademicVerifications(prev => ({
        ...prev,
        transcript: {
          ...prev.transcript,
          file: e.target.files![0],
          status: 'unverified'
        }
      }));
    }
  };
  
  // Mock verification requests
  const requestTranscriptVerification = () => {
    if (!academicVerifications.transcript.file) {
      showErrorToast('Please upload your transcript file first');
      return;
    }
    
    setAcademicVerifications(prev => ({
      ...prev,
      transcript: {
        ...prev.transcript,
        status: 'pending'
      }
    }));
    
    // Simulate API call
    showInfoToast('Transcript submitted for verification... Processing your document');
    
    // Simulate response after 2 seconds
    setTimeout(() => {
      setAcademicVerifications(prev => ({
        ...prev,
        transcript: {
          ...prev.transcript,
          status: 'verified'
        }
      }));
      showSuccessToast('Transcript verified successfully! Your academic record has been confirmed.');
      
      // Update profile completion percentage
      const newCompletionPercentage = Math.min(profileCompletionPercent + 15, 100);
      setProfileCompletionPercent(newCompletionPercentage);
      
    }, 2000);
  };

  // Connect with university for attendance verification
  const connectWithUniversity = () => {
    setAcademicVerifications(prev => ({
      ...prev,
      collegeAttendance: {
        ...prev.collegeAttendance,
        status: 'pending'
      }
    }));
    
    // Simulate API call
    showInfoToast('Connecting to educational records... Please wait while we verify your attendance');
    
    // Simulate response after 2 seconds
    setTimeout(() => {
      setAcademicVerifications(prev => ({
        ...prev,
        collegeAttendance: {
          ...prev.collegeAttendance,
          status: 'verified'
        }
      }));
      showSuccessToast('School attendance verified! Your enrollment status has been confirmed.');
      
      // Update profile completion percentage
      const newCompletionPercentage = Math.min(profileCompletionPercent + 15, 100);
      setProfileCompletionPercent(newCompletionPercentage);
      
    }, 2000);
  };

  // Verify identity through a secure ID verification service
  const verifyIdentity = () => {
    setAcademicVerifications(prev => ({
      ...prev,
      identity: {
        ...prev.identity,
        status: 'pending'
      }
    }));
    
    // Simulate API call
    showInfoToast('Connecting to secure ID verification service... This ensures your privacy while confirming your identity');
    
    // Simulate response after 2 seconds
    setTimeout(() => {
      setAcademicVerifications(prev => ({
        ...prev,
        identity: {
          ...prev.identity,
          status: 'verified'
        }
      }));
      showSuccessToast('Identity verified successfully! Your identity has been cryptographically confirmed.');
      
      // Update profile completion percentage
      const newCompletionPercentage = Math.min(profileCompletionPercent + 15, 100);
      setProfileCompletionPercent(newCompletionPercentage);
      
    }, 2000);
    };

  // Save profile data to localStorage (or call an API to save on the backend)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      showErrorToast('Please connect your wallet first');
      return;
    }
    
    const saveToastId = showLoadingToast("Saving your profile data... This will just take a moment");
    
    try {
    await uploadUserData(profile);
      updateToast(saveToastId, "success", "Profile saved successfully! Your information has been securely stored.");
    } catch (error) {
      console.error("Error saving profile:", error);
      updateToast(
        saveToastId, 
        "error", 
        `Error saving profile: ${error instanceof Error ? error.message : "Unknown error occurred"}`
      );
    }
  };

  // Helper function to render verification status
  const renderVerificationStatus = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span className="text-sm">Verified</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center text-yellow-600">
            <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mr-1"></div>
            <span className="text-sm">Pending</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center text-red-600">
            <AlertCircle className="w-4 h-4 mr-1" />
            <span className="text-sm">Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-600">
            <Shield className="w-4 h-4 mr-1" />
            <span className="text-sm">Not Verified</span>
          </div>
        );
    }
  };

  // If no wallet is connected, show a message
  if (!account) {
    return (
      <div className="max-w-xl mx-auto p-4">
        <h1 className="text-xl font-bold mb-4">Profile</h1>
        <p>Please connect your wallet to view or edit your profile.</p>
        <ToastContainer position="bottom-right" theme="light" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <div className="flex gap-4">
          <Link
            to="/scholarships"
            className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-700 transition-colors flex items-center"
          >
            <Award className="mr-2 h-5 w-5" />
            Browse Scholarships
          </Link>
                <Link
                  to="/manage-scholarships"
                  className="border-2 border-blue-600 border-dotted text-blue-600 px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition-colors"
                >
                  Creator Dashboard
                </Link>
              </div>
      </div>
      
      {/* Profile completion status */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Profile Completion</h2>
          <span className="text-lg font-semibold text-blue-600">{profileCompletionPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${profileCompletionPercent}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Complete your profile to increase your chances of qualifying for scholarships.
          Verified information helps donors confirm your eligibility.
        </p>
        
        {profileCompletionPercent < 100 && (
          <div className="bg-blue-50 p-3 rounded-lg mt-4 border border-blue-100">
            <div className="flex">
              <Sparkles className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-800">Increase your scholarship eligibility</h3>
                <p className="text-sm text-blue-700">
                  {profileCompletionPercent < 60 ? 
                    "Verify your academic credentials to improve your chances of receiving scholarships." :
                    "You're almost there! Complete the remaining verifications to maximize your opportunities."
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Academic Verifications Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Academic Verifications</h2>
        <p className="text-gray-600 mb-6">
          Verify your academic credentials through our TEE-powered verification system.
          Your data remains private and secure while enabling trustless verification.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* SAT Score Verification */}
          <div className="border rounded-lg p-4 hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-600" />
                SAT Score Verification
              </h3>
              {renderVerificationStatus(academicVerifications.satScore.status)}
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Connect with College Board to verify your SAT scores without sharing your actual scores. 
              Only verification status will be stored on-chain.
            </p>
            
            <button
              type="button"
              onClick={connectWithCollegeBoard}
              disabled={academicVerifications.satScore.status === 'verified' || academicVerifications.satScore.status === 'pending'}
              className={`w-full flex items-center justify-center gap-2 rounded-md p-3 font-medium transition-colors ${
                academicVerifications.satScore.status === 'verified' 
                  ? 'bg-green-100 text-green-700 border border-green-300 cursor-not-allowed' 
                  : academicVerifications.satScore.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-300 cursor-wait'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {academicVerifications.satScore.status === 'verified' ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Verified with College Board
                </>
              ) : academicVerifications.satScore.status === 'pending' ? (
                <>
                  <div className="h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="h-5 w-5" />
                  Connect with College Board
                </>
              )}
            </button>
          </div>
          
          {/* Transcript Verification */}
          <div className="border rounded-lg p-4 hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Transcript Verification
              </h3>
              {renderVerificationStatus(academicVerifications.transcript.status)}
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Upload your transcript securely through our TEE-powered system. 
              Only verification results are shared, not the contents.
            </p>
            
            <div className="mb-3">
              <div className="w-full border border-gray-300 px-3 py-2 rounded flex items-center justify-between bg-gray-50 hover:border-blue-500 transition-colors">
                <span className="text-gray-600 truncate">
                  {academicVerifications.transcript.file 
                    ? academicVerifications.transcript.file.name 
                    : 'No file selected'}
                </span>
                <label className="cursor-pointer flex items-center text-blue-600 hover:text-blue-800">
                  <Upload className="w-4 h-4 mr-1" />
                  <span className="text-sm">Browse</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    onChange={handleTranscriptUpload}
                    className="hidden"
                    disabled={academicVerifications.transcript.status === 'verified' || academicVerifications.transcript.status === 'pending'}
                  />
                </label>
              </div>
            </div>
            
            <button
              type="button"
              onClick={requestTranscriptVerification}
              disabled={
                !academicVerifications.transcript.file || 
                academicVerifications.transcript.status === 'verified' || 
                academicVerifications.transcript.status === 'pending'
              }
              className={`w-full flex items-center justify-center gap-2 rounded-md p-3 font-medium transition-colors ${
                academicVerifications.transcript.status === 'verified' 
                  ? 'bg-green-100 text-green-700 border border-green-300 cursor-not-allowed' 
                  : academicVerifications.transcript.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-300 cursor-wait'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {academicVerifications.transcript.status === 'verified' ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Transcript Verified
                </>
              ) : academicVerifications.transcript.status === 'pending' ? (
                <>
                  <div className="h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : (
                "Verify Transcript"
              )}
            </button>
          </div>
          
          {/* University Attendance Verification */}
          <div className="border rounded-lg p-4 hover:shadow-md transition-all">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                School Attendance
              </h3>
              {renderVerificationStatus(academicVerifications.collegeAttendance.status)}
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Verify your enrollment status with your school or university.
              This helps you qualify for student-specific scholarships.
            </p>
            
            <button
              type="button"
              onClick={connectWithUniversity}
              disabled={academicVerifications.collegeAttendance.status === 'verified' || academicVerifications.collegeAttendance.status === 'pending'}
              className={`w-full flex items-center justify-center gap-2 rounded-md p-3 font-medium transition-colors ${
                academicVerifications.collegeAttendance.status === 'verified' 
                  ? 'bg-green-100 text-green-700 border border-green-300 cursor-not-allowed' 
                  : academicVerifications.collegeAttendance.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-300 cursor-wait'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {academicVerifications.collegeAttendance.status === 'verified' ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  School Attendance Verified
                </>
              ) : academicVerifications.collegeAttendance.status === 'pending' ? (
                <>
                  <div className="h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="h-5 w-5" />
                  Connect with School
                </>
              )}
            </button>
          </div>
          
          {/* Identity Verification - NEW */}
          <div className="border rounded-lg p-4 hover:shadow-md transition-all bg-gradient-to-br from-white to-blue-50">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold flex items-center">
                <CircleUserRound className="w-5 h-5 mr-2 text-blue-600" />
                Identity Verification
              </h3>
              {renderVerificationStatus(academicVerifications.identity.status)}
            </div>
            
            <div className="flex mb-4 gap-2">
              <div className="bg-yellow-100 p-1 rounded text-yellow-800 text-xs font-medium mr-1">
                Trusted
              </div>
              <div className="bg-blue-100 p-1 rounded text-blue-800 text-xs font-medium">
                Most Valued
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Verify your identity using secure cryptographic proofs without revealing personal information.
              Scholarship providers value this verification the most.
            </p>
            
            <button
              type="button"
              onClick={verifyIdentity}
              disabled={academicVerifications.identity.status === 'verified' || academicVerifications.identity.status === 'pending'}
              className={`w-full flex items-center justify-center gap-2 rounded-md p-3 font-medium transition-colors ${
                academicVerifications.identity.status === 'verified' 
                  ? 'bg-green-100 text-green-700 border border-green-300 cursor-not-allowed' 
                  : academicVerifications.identity.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-300 cursor-wait'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {academicVerifications.identity.status === 'verified' ? (
                <>
                  <BadgeCheck className="h-5 w-5" />
                  Identity Verified
                </>
              ) : academicVerifications.identity.status === 'pending' ? (
                <>
                  <div className="h-4 w-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  Verify Your Identity
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Social Connections */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Connect Your Accounts</h2>
          <p className="text-gray-600 mb-6">
            Connect your social accounts to strengthen your application. This helps us verify your identity and achievements.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => handleSocialConnect('google')}
              className={`p-4 rounded-lg border ${
                socialConnections.google ? 'bg-green-50 border-green-500' : 'border-gray-200 hover:border-blue-500'
              } flex flex-col items-center justify-center transition-colors`}
            >
              <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png" 
                   alt="Google" 
                   className="h-6 object-contain mb-2" />
              <span className="text-sm">
                {socialConnections.google ? 'Connected' : 'Connect Google'}
              </span>
            </button>
            
            <button
              onClick={() => handleSocialConnect('github')}
              className={`p-4 rounded-lg border ${
                socialConnections.github ? 'bg-green-50 border-green-500' : 'border-gray-200 hover:border-blue-500'
              } flex flex-col items-center justify-center transition-colors`}
            >
              <Github className="h-6 w-6 mb-2" />
              <span className="text-sm">
                {socialConnections.github ? 'Connected' : 'Connect GitHub'}
              </span>
            </button>

            <button
              onClick={() => handleSocialConnect('linkedIn')}
              className={`p-4 rounded-lg border ${
                socialConnections.linkedIn ? 'bg-green-50 border-green-500' : 'border-gray-200 hover:border-blue-500'
              } flex flex-col items-center justify-center transition-colors`}
            >
              <Linkedin className="h-6 w-6 mb-2" />
              <span className="text-sm">
                {socialConnections.linkedIn ? 'Connected' : 'Connect LinkedIn'}
              </span>
            </button>

            <button
              onClick={() => handleSocialConnect('twitter')}
              className={`p-4 rounded-lg border ${
                socialConnections.twitter ? 'bg-green-50 border-green-500' : 'border-gray-200 hover:border-blue-500'
              } flex flex-col items-center justify-center transition-colors`}
            >
              <Twitter className="h-6 w-6 mb-2" />
              <span className="text-sm">
                {socialConnections.twitter ? 'Connected' : 'Connect Twitter'}
              </span>
            </button>
          </div>
        </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        
        <div className="pt-4">
          <h3 className="font-medium mb-3">Social Profiles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="twitter" className="block mb-1">Twitter</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Twitter className="h-4 w-4 text-gray-400" />
                </div>
          <input
            type="text"
            id="twitter"
            name="twitter"
            value={profile.twitter}
            onChange={handleChange}
                  placeholder="@username"
                  className="w-full border border-gray-300 px-3 py-2 pl-10 rounded"
          />
        </div>
            </div>
            
        <div>
          <label htmlFor="linkedIn" className="block mb-1">LinkedIn</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Linkedin className="h-4 w-4 text-gray-400" />
                </div>
          <input
            type="text"
            id="linkedIn"
            name="linkedIn"
            value={profile.linkedIn}
            onChange={handleChange}
                  placeholder="linkedin.com/in/username"
                  className="w-full border border-gray-300 px-3 py-2 pl-10 rounded"
          />
        </div>
            </div>
            
        <div>
          <label htmlFor="github" className="block mb-1">GitHub</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Github className="h-4 w-4 text-gray-400" />
                </div>
          <input
            type="text"
            id="github"
            name="github"
            value={profile.github}
            onChange={handleChange}
                  placeholder="github.com/username"
                  className="w-full border border-gray-300 px-3 py-2 pl-10 rounded"
          />
        </div>
            </div>
            
        <div>
          <label htmlFor="google" className="block mb-1">Google</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png" 
                       alt="Google" 
                       className="h-4 object-contain" />
                </div>
          <input
            type="text"
            id="google"
            name="google"
            value={profile.google}
            onChange={handleChange}
                  placeholder="Google account"
                  className="w-full border border-gray-300 px-3 py-2 pl-10 rounded"
          />
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-4 flex items-center justify-between">
        <button
          type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center"
        >
            <CheckCircle className="mr-2 h-5 w-5" />
            Save Profile
        </button>
          
          <Link
            to="/scholarships"
            className="text-blue-600 hover:text-blue-700 flex items-center"
          >
            <Award className="mr-1 h-5 w-5" />
            Find Scholarships
          </Link>
        </div>
      </form>
      
      {/* Custom Toast Container */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Slide}
      />
    </div>
  );
};

export default Profile;