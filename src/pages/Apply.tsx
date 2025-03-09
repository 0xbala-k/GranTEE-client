import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, AlertCircle, CheckCircle, XCircle, Edit, Award, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { useWeb3 } from '../Web3Context';
import { Scholarship } from '../types';
import { applyScholarship, getScholarshipById, invokeAgent, getApplications } from '../services/helper';
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti';

// Application status types
type ApplicationStatus = 
  | 'idle' 
  | 'submitting'
  | 'submitted'
  | 'processing'
  | 'approved'
  | 'rejected'
  | 'error';

type StatusUpdate = {
  id: string;
  timestamp: Date;
  status: ApplicationStatus;
  message: string;
  details?: string;
};

export function Apply() {
  const { account } = useWeb3();
  const { scholarshipId } = useParams();
  const navigate = useNavigate();
  const [essay, setEssay] = useState('');
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>('idle');
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([]);
  const [wordCount, setWordCount] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Word count validation
  const MIN_WORD_COUNT = 500;
  const isWordCountValid = wordCount >= MIN_WORD_COUNT;
  
  // Get word count remaining
  const getWordCountRemaining = () => {
    return Math.max(0, MIN_WORD_COUNT - wordCount);
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  // Add a status update
  const addStatusUpdate = (status: ApplicationStatus, message: string, details?: string) => {
    const newUpdate: StatusUpdate = {
      id: Date.now().toString(),
      timestamp: new Date(),
      status,
      message,
      details
    };
    
    // Add new updates to the beginning of the array (newest first)
    setStatusUpdates(prev => [newUpdate, ...prev]);
    
    // No need to scroll anymore since newest updates are at the top and always visible
  };

  useEffect(() => {
    if (!account) {
      toast.error("Please connect your wallet to apply for scholarships");
      navigate('/scholarships');
      return;
    }

    if (scholarshipId) {
      checkAlreadyApplied();
      fetchScholarship();
    } else {
      navigate('/scholarships');
    }
  }, [scholarshipId, navigate, account]);

  // Update word count when essay changes
  useEffect(() => {
    const words = essay.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
  }, [essay]);

  const checkAlreadyApplied = async () => {
    try {
      const applications = await getApplications();
      const hasApplied = applications.some(app => app.scholarshipId === Number(scholarshipId));
      
      if (hasApplied) {
        setAlreadyApplied(true);
        toast.info("You have already applied to this scholarship.", { 
          autoClose: 5000,
          onClose: () => navigate('/applications') 
        });
        setTimeout(() => {
          navigate('/applications');
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const fetchScholarship = async () => {
    setLoading(true);
    try {
      const found = await getScholarshipById(Number(scholarshipId));
      if (found) {
        setScholarship(found);
        addStatusUpdate('idle', `Scholarship details for "${found.title}" loaded successfully`);
      } else {
        toast.error("Scholarship not found");
        navigate('/scholarships');
      }
    } catch (error) {
      console.error('Error fetching scholarship:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Error loading scholarship: ${errorMessage}`);
      addStatusUpdate('error', 'Failed to load scholarship details', errorMessage);
      navigate('/scholarships');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation
    if (wordCount < MIN_WORD_COUNT) {
      toast.error(`Your essay must be at least ${MIN_WORD_COUNT} words to submit.`);
      return;
    }
    
    // Update status to submitting
    setApplicationStatus('submitting');
    addStatusUpdate('submitting', 'Submitting your application to the blockchain...');
    
    try {
      // Apply for scholarship
      await applyScholarship(Number(scholarshipId), {essay: essay});
      
      // Update status to submitted
      setApplicationStatus('submitted');
      addStatusUpdate('submitted', 'Application submitted successfully!', 'Your application has been recorded on the blockchain.');
      
      // Start agent processing
      setApplicationStatus('processing');
      addStatusUpdate('processing', 'Processing your application...', 'Your application is being evaluated by our scholarship committee.');
      
      // Invoke agent for processing
      await invokeAgent(
        Number(scholarshipId),
        {essay: essay},
        account ? account : ""
      );
      
      // Update status to approved (success case)
      setApplicationStatus('approved');
      addStatusUpdate('approved', 'Application processed successfully!', 'Congratulations! Your application has been received and is under review.');
      
      // Trigger confetti on success
      const canvas = document.createElement('canvas');
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '9999';
      document.body.appendChild(canvas);
      
      const confettiInstance = confetti.create(canvas, {
        resize: true,
        useWorker: true
      });
      
      confettiInstance({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      setTimeout(() => {
        document.body.removeChild(canvas);
      }, 5000);
      
      // Clear the essay field
      setEssay("");
      
      // Add a small delay before navigating
      setTimeout(() => {
        navigate('/applications');
      }, 5000);
      
    } catch(error) {
      console.log("Error: ", error);
      
      // Check if it's the "already applied" error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Already applied to this scholarship')) {
        setApplicationStatus('error');
        addStatusUpdate('error', 'You have already applied to this scholarship', 'Please check your applications page to see the status.');
        
        // Navigate to applications
        setTimeout(() => {
          navigate('/applications');
        }, 3000);
      } else {
        // Generic error
        setApplicationStatus('error');
        addStatusUpdate('error', 'Error submitting application', errorMessage);
        toast.error(`Error submitting application: ${errorMessage}`);
      }
    }
  };

  // Get the status icon based on the application status
  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'idle':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'submitting':
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'submitted':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  if (!account || alreadyApplied) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-flex items-center px-4 py-2 rounded-full border border-blue-300 bg-blue-50">
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin mr-2" />
          <span className="text-blue-700">Loading scholarship details...</span>
        </div>
      </div>
    );
  }

  if (!scholarship) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Scholarship Application</h1>
        <p className="text-gray-600 mb-8">Complete the form below to apply for this scholarship opportunity</p>
        
        {/* Scholarship Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 relative overflow-hidden">
          {/* Colored top bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500"></div>
          
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">{scholarship.title}</h2>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 mb-6">
            <div className="flex items-center text-gray-700">
              <Award className="h-5 w-5 mr-2 text-green-500" />
              <span className="font-medium">Max Grant:</span>
              <span className="ml-1">{scholarship.maxAmountPerApplicant.toLocaleString()} Wei</span>
            </div>
            
            <div className="flex items-center text-gray-700">
              <Clock className="h-5 w-5 mr-2 text-orange-500" />
              <span className="font-medium">Deadline:</span>
              <span className="ml-1">{new Date(scholarship.deadline).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center text-gray-700">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              <span className="font-medium">Applicants:</span>
              <span className="ml-1">{scholarship.applicants}</span>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Description</h3>
            <p className="text-gray-600">{scholarship.description}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Requirements</h3>
            <ul className="space-y-1">
              {scholarship.requirements.map((req, index) => (
                <li key={index} className="flex items-start text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Application Form */}
        <form 
          ref={formRef}
          onSubmit={handleSubmit} 
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2 text-gray-800 flex items-center">
              <Edit className="h-5 w-5 mr-2 text-blue-500" />
              Scholarship Essay
            </h2>
            <p className="text-gray-600 mb-6">Share why you deserve this scholarship and how it will help you achieve your goals</p>
            
            <div className="mb-6">
              <label htmlFor="essay" className="block text-sm font-medium text-gray-700 mb-2">
                Tell us why you deserve this scholarship
                <span className="text-red-500 ml-1">*</span>
              </label>
              
              <div className="relative">
                <textarea
                  id="essay"
                  value={essay}
                  onChange={(e) => setEssay(e.target.value)}
                  className={`w-full h-72 p-4 border ${
                    essay.length > 0 && !isWordCountValid 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-blue-500'
                  } rounded-lg focus:ring-2 focus:border-transparent transition-colors`}
                  placeholder="Write your essay here. Include your academic achievements, career goals, and how this scholarship will help you..."
                  disabled={applicationStatus !== 'idle'}
                />
                
                {essay.length > 0 && !isWordCountValid && (
                  <div className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                    <AlertCircle className="h-3.5 w-3.5 mr-1" />
                    {getWordCountRemaining()} more words needed
                  </div>
                )}
              </div>
              
              <div className="mt-2 flex justify-between items-center">
                <div className={`text-sm ${isWordCountValid ? 'text-green-600' : 'text-gray-500'}`}>
                  Word count: 
                  <span className={`font-medium ml-1 ${isWordCountValid ? 'text-green-600' : wordCount > 0 ? 'text-orange-500' : 'text-gray-500'}`}>
                    {wordCount}
                  </span> 
                  <span className="mx-1">/</span> 
                  <span className="font-medium">{MIN_WORD_COUNT} minimum</span>
                  
                  {isWordCountValid && (
                    <span className="ml-2 inline-flex items-center text-green-600">
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Minimum reached
                    </span>
                  )}
                </div>
                
                {!isWordCountValid && essay.length > 0 && (
                  <span className="text-xs text-red-600">
                    {getWordCountRemaining()} more words required
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className={`flex items-center px-6 py-3 font-medium rounded-lg transition-all ${
                  isWordCountValid
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!isWordCountValid || applicationStatus !== 'idle'}
              >
                {applicationStatus === 'idle' ? (
                  <>
                    Submit Application
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Application Status Updates */}
          {statusUpdates.length > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-500" />
                  Application Status Updates
                </div>
                <span className="text-xs text-gray-500">Newest updates at top</span>
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2" ref={statusRef}>
                {statusUpdates.map((update) => (
                  <div 
                    key={update.id} 
                    className={`p-3 rounded-lg border ${
                      update.status === 'error' 
                        ? 'bg-red-50 border-red-200' 
                        : update.status === 'approved' 
                          ? 'bg-green-50 border-green-200'
                          : 'bg-blue-50 border-blue-200'
                    } animate-fadeIn`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5 mr-3">
                        {getStatusIcon(update.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className={`text-sm font-medium ${
                            update.status === 'error' 
                              ? 'text-red-800' 
                              : update.status === 'approved' 
                                ? 'text-green-800'
                                : 'text-blue-800'
                          }`}>
                            {update.message}
                          </p>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {formatDate(update.timestamp)}
                          </span>
                        </div>
                        
                        {update.details && (
                          <p className="mt-1 text-xs text-gray-600">{update.details}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}