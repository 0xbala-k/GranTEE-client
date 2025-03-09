import { useEffect, useState } from 'react';
import { getApplications, getScholarshipById } from '../services/helper';
import { Scholarship } from '../types';
import { useWeb3 } from '../Web3Context';
import { 
  Calendar, 
  DollarSign, 
  User, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock3, 
  Award, 
  Loader2, 
  ExternalLink,
  FileText,
  BarChart,
  CircleEllipsis,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ApplicationWithScholarship {
  application: Application;
  scholarship?: Scholarship;
  scholarshipId: number;
}

enum ApplicationStatus {
  Pending = 0,
  Reviewed = 1,
  Accepted = 2,
  Rejected = 3,
}

interface Application {
    exists: boolean;
    paid: boolean;
    dataHash: string;
    status: ApplicationStatus;
  scholarshipId: number;
}

export function Applications() {
  const { account } = useWeb3();
  const [loading, setLoading] = useState(true);
  const [applicationsWithScholarships, setApplicationsWithScholarships] = useState<ApplicationWithScholarship[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    if (account) {
      fetchData();
    }
  }, [account]);

    const fetchData = async () => {
      setLoading(true);
      try {
        const applications = await getApplications();
      
      const applicationsWithScholarships: ApplicationWithScholarship[] = [];
      
      for (const application of applications) {
        try {
          const scholarship = await getScholarshipById(application.scholarshipId);
          applicationsWithScholarships.push({
            application,
            scholarship,
            scholarshipId: application.scholarshipId
          });
        } catch (err) {
          console.error(`Error loading scholarship ${application.scholarshipId}:`, err);
          applicationsWithScholarships.push({
            application,
            scholarshipId: application.scholarshipId
          });
        }
      }
      
      applicationsWithScholarships.sort((a, b) => {
        if (a.application.status !== b.application.status) {
          return a.application.status - b.application.status;
        }
        return (a.scholarship?.title || '').localeCompare(b.scholarship?.title || '');
      });
      
      setApplicationsWithScholarships(applicationsWithScholarships);
      
      const counts = {
        all: applicationsWithScholarships.length,
        pending: applicationsWithScholarships.filter(item => 
          Number(item.application.status) === Number(ApplicationStatus.Pending)
        ).length,
        approved: applicationsWithScholarships.filter(item => 
          Number(item.application.status) === Number(ApplicationStatus.Approved)
        ).length,
        rejected: applicationsWithScholarships.filter(item => 
          Number(item.application.status) > Number(ApplicationStatus.Approved)
        ).length
      };
      
      setTabCounts(counts);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

  const filteredApplications = applicationsWithScholarships.filter((item) => {
    if (activeTab === 'all') {
      return true;
    }
    else if (activeTab === 'pending') {
      const isPendingStatus = Number(item.application.status) === Number(ApplicationStatus.Pending);
      return isPendingStatus;
    } 
    else if (activeTab === 'approved') {
      return Number(item.application.status) === Number(ApplicationStatus.Approved);
    } 
    else if (activeTab === 'rejected') {
      return Number(item.application.status) > Number(ApplicationStatus.Approved);
    }
    
    return false;
  });

  // Format relative date
  const getRelativeDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 30) return `${diffDays} days left`;
    
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} left`;
  };

  // Get status icon and color
  const getStatusInfo = (status: ApplicationStatus) => {
    // Convert to number for safe comparison
    const statusNum = Number(status);
    
    switch (statusNum) {
      case Number(ApplicationStatus.Pending):
        return { 
          icon: <Clock3 className="h-5 w-5 text-blue-500" />, 
          bgColor: 'bg-blue-100', 
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200'
        };
      case Number(ApplicationStatus.Approved):
        return { 
          icon: <CheckCircle className="h-5 w-5 text-green-500" />, 
          bgColor: 'bg-green-100', 
          textColor: 'text-green-800',
          borderColor: 'border-green-200'
        };
      case Number(ApplicationStatus.Rejected):
        return { 
          icon: <XCircle className="h-5 w-5 text-red-500" />, 
          bgColor: 'bg-red-100', 
          textColor: 'text-red-800',
          borderColor: 'border-red-200'
        };
      case Number(ApplicationStatus.Cancelled):
        return { 
          icon: <AlertCircle className="h-5 w-5 text-orange-500" />, 
          bgColor: 'bg-orange-100', 
          textColor: 'text-orange-800',
          borderColor: 'border-orange-200'
        };
      default:
        return { 
          icon: <AlertCircle className="h-5 w-5 text-gray-500" />, 
          bgColor: 'bg-gray-100', 
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200'
        };
    }
  };

  // Get payment status info
  const getPaymentStatusInfo = (paid: boolean) => {
    return paid 
      ? { 
          label: "Payment Sent", 
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          bgColor: 'bg-green-50',
          textColor: 'text-green-700'
        }
      : { 
          label: "Payment Pending", 
          icon: <Clock3 className="h-4 w-4 text-yellow-500" />,
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700'
        };
  };

  // Format currency numbers
  const formatCurrency = (value?: number): string => {
    if (!value) return 'N/A';
    
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M Wei`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K Wei`;
    } else {
      return `${value} Wei`;
    }
  };

  // Get shortened wallet address
  const shortenAddress = (address?: string): string => {
    if (!address) return 'N/A';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Render application card
  const renderApplicationCard = (item: ApplicationWithScholarship, index: number) => {
    const { application, scholarship } = item;
    const statusInfo = getStatusInfo(application.status);
    const paymentInfo = getPaymentStatusInfo(application.paid);
    const deadline = scholarship?.deadline;
    const relativeDeadline = getRelativeDate(deadline);
    
    return (
      <div 
        key={index} 
        className={`border rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md ${statusInfo.borderColor}`}
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        {/* Colored top bar based on status */}
        <div className={`h-1.5 w-full ${statusInfo.bgColor}`}></div>
        
        <div className="p-6">
          {/* Scholarship title and status */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {scholarship ? scholarship.title : `Scholarship #${item.scholarshipId}`}
            </h2>
            <div className={`flex items-center px-3 py-1.5 rounded-full ${statusInfo.bgColor} ${statusInfo.textColor} text-xs font-medium`}>
              {statusInfo.icon}
              <span className="ml-1.5">{ApplicationStatus[application.status]}</span>
            </div>
          </div>
          
          {/* Scholarship details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center text-gray-700">
              <User className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm">
                By: <span className="font-medium">{scholarship ? shortenAddress(scholarship.creator) : 'Unknown'}</span>
              </span>
            </div>
            
            <div className="flex items-center text-gray-700">
              <Award className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm">
                Max Grant: <span className="font-medium">{formatCurrency(scholarship?.maxAmountPerApplicant)}</span>
              </span>
            </div>
            
            <div className="flex items-center text-gray-700">
              <Calendar className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm">
                Deadline: <span className={`font-medium ${
                  relativeDeadline === 'Expired' ? 'text-red-600' : 
                  relativeDeadline === 'Today' ? 'text-orange-600' : ''
                }`}>{relativeDeadline}</span>
              </span>
            </div>
          </div>
          
          {/* Status timeline */}
          <div className="mb-5">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <BarChart className="h-4 w-4 mr-1.5 text-gray-500" />
              Application Progress
            </h3>
            
            <div className="w-full flex flex-col mt-2 mb-6">
              {/* Progress Bar Background */}
              <div className="w-full h-2 bg-gray-200 rounded-full mb-4 relative">
                {/* Progress Bar Fill */}
                <div 
                  className={`h-full rounded-full absolute left-0 top-0 transition-all duration-500
                    ${Number(application.status) === Number(ApplicationStatus.Approved) 
                      ? 'bg-green-500' 
                      : Number(application.status) > Number(ApplicationStatus.Pending) 
                        ? 'bg-red-500' 
                        : 'bg-blue-500'}`} 
                  style={{ 
                    width: `${
                      Number(application.status) === Number(ApplicationStatus.Pending) 
                        ? '40%' 
                        : Number(application.status) === Number(ApplicationStatus.Approved) 
                          ? '75%' 
                          : Number(application.status) > Number(ApplicationStatus.Pending) 
                            ? '40%' 
                            : application.paid 
                              ? '100%' 
                              : '0%'
                    }`
                  }}
                ></div>
              </div>

              {/* Stages */}
              <div className="flex justify-between">
                {/* Submission */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                    ${Number(application.status) >= Number(ApplicationStatus.Pending) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <span className="text-xs mt-1 text-gray-600">Submitted</span>
                </div>

                {/* Processing */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                    ${Number(application.status) === Number(ApplicationStatus.Pending) ? 'bg-blue-500 animate-pulse text-white' : 
                      Number(application.status) > Number(ApplicationStatus.Pending) ? 'bg-green-500 text-white' : 
                      'bg-gray-200 text-gray-400'}`}>
                    <CircleEllipsis className="h-4 w-4" />
                  </div>
                  <span className="text-xs mt-1 text-gray-600">Processing</span>
                </div>
                
                {/* Approval/Rejection */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                    ${Number(application.status) === Number(ApplicationStatus.Approved) ? 'bg-green-500 text-white' : 
                      Number(application.status) > Number(ApplicationStatus.Approved) ? 'bg-red-500 text-white' : 
                      'bg-gray-200 text-gray-400'}`}>
                    {Number(application.status) === Number(ApplicationStatus.Approved) ? 
                      <CheckCircle className="h-4 w-4" /> : 
                      Number(application.status) > Number(ApplicationStatus.Approved) ? 
                      <XCircle className="h-4 w-4" /> : 
                      <Check className="h-4 w-4" />}
                  </div>
                  <span className="text-xs mt-1 text-gray-600">
                    {Number(application.status) === Number(ApplicationStatus.Approved) ? 'Approved' : 
                      Number(application.status) > Number(ApplicationStatus.Approved) ? 'Rejected' : 
                      'Decision'}
                  </span>
                </div>
                
                {/* Payment */}
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                    ${application.paid ? 'bg-green-500 text-white' : 
                      Number(application.status) === Number(ApplicationStatus.Approved) ? 'bg-yellow-500 text-white' : 
                      'bg-gray-200 text-gray-400'}`}>
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <span className="text-xs mt-1 text-gray-600">Payment</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment status */}
          <div className={`text-xs px-3 py-2 rounded-lg flex items-center ${paymentInfo.bgColor} ${paymentInfo.textColor} mb-4`}>
            {paymentInfo.icon}
            <span className="ml-1.5">{paymentInfo.label}</span>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end space-x-3 mt-4">
            {scholarship && (
              <Link 
                to={`/scholarships`} 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View All Scholarships
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Applications</h1>
            <p className="text-gray-600 mt-1">Track the status of your scholarship applications</p>
          </div>
          
          <Link 
            to="/scholarships" 
            className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-medium"
          >
            Browse Scholarships
          </Link>
        </div>
        
        {!account && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h2 className="text-lg font-medium text-yellow-800 mb-1">Wallet Not Connected</h2>
            <p className="text-yellow-700">Please connect your wallet to view your scholarship applications.</p>
          </div>
        )}
        
        {account && (
          <>
            {/* Status tabs */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 font-medium text-sm flex items-center mr-4 ${
                  activeTab === 'all' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                All Applications
                <span className="ml-2 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                  {tabCounts.all}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-4 py-2 font-medium text-sm flex items-center mr-4 ${
                  activeTab === 'pending' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Pending
                <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                  {tabCounts.pending}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('approved')}
                className={`px-4 py-2 font-medium text-sm flex items-center mr-4 ${
                  activeTab === 'approved' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Approved
                <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                  {tabCounts.approved}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('rejected')}
                className={`px-4 py-2 font-medium text-sm flex items-center ${
                  activeTab === 'rejected' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Rejected
                <span className="ml-2 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">
                  {tabCounts.rejected}
                </span>
              </button>
            </div>
            
            {/* Loading state */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-600">Loading your applications...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                {activeTab === 'all' ? (
                  <>
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-medium text-gray-800 mb-2">No Applications Yet</h2>
                    <p className="text-gray-600 mb-6">You haven't applied to any scholarships yet.</p>
                    <Link 
                      to="/scholarships" 
                      className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Browse Scholarships
                    </Link>
                  </>
                ) : (
                  <>
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-medium text-gray-800 mb-2">No {activeTab} Applications</h2>
                    <p className="text-gray-600">You don't have any {activeTab} applications.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 animate-fadeIn">
                {filteredApplications.map((item, index) => renderApplicationCard(item, index))}
        </div>
      )}
          </>
        )}
      </div>
    </div>
  );
}
