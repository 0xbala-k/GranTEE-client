import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';
import { useWeb3 } from '../Web3Context';
import { Scholarship } from '../types';
import { applyScholarship, getScholarshipById, invokeAgent, getApplications } from '../services/helper';
import { toast } from 'react-toastify';

export function Apply() {
  const { account } = useWeb3();
  const { scholarshipId } = useParams();
  const navigate = useNavigate();
  const [essay, setEssay] = useState('');
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

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
      toast.info("Loading scholarship details...");
      const found = await getScholarshipById(Number(scholarshipId));
      if (found) {
        setScholarship(found);
        toast.success("Scholarship details loaded");
      } else {
        toast.error("Scholarship not found");
        navigate('/scholarships');
      }
    } catch (error) {
      console.error('Error fetching scholarship:', error);
      toast.error(`Error loading scholarship: ${error instanceof Error ? error.message : String(error)}`);
      navigate('/scholarships');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a loading toast that we'll update throughout the process
    const applicationToast = toast.loading("Submitting your application...");
    
    try {
      // Apply for scholarship
      await applyScholarship(Number(scholarshipId), {essay:essay});
      toast.update(applicationToast, {
        render: "Application submitted successfully!",
        type: "success",
        isLoading: false,
        autoClose: false // Keep this visible while the agent processes
      });
      
      console.log('Form submitted:', { scholarshipId, essay });

      // Invoke agent for processing
      toast.update(applicationToast, {
        render: "Processing your application...",
        type: "info",
        isLoading: true
      });
      
      console.log("Invoking agent....");
      await invokeAgent(
        Number(scholarshipId),
        {essay:essay},
        account?account:""
      );
      
      toast.update(applicationToast, {
        render: "Application processed successfully!",
        type: "success",
        isLoading: false,
        autoClose: 5000
      });
      
      // Clear the essay field
      setEssay("");
      
      // Add a small delay before navigating
      setTimeout(() => {
        navigate('/applications');
      }, 2000);
      
    } catch(error) {
      console.log("Error: ", error);
      
      // Check if it's the "already applied" error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Already applied to this scholarship')) {
        toast.update(applicationToast, {
          render: "You have already applied to this scholarship.",
          type: "info",
          isLoading: false,
          autoClose: 5000
        });
        
        // Navigate to applications
        setTimeout(() => {
          navigate('/applications');
        }, 2000);
      } else {
        toast.update(applicationToast, {
          render: `Error submitting application: ${errorMessage}`,
          type: "error",
          isLoading: false,
          autoClose: 5000
        });
      }
    }
  };

  if (!account || alreadyApplied) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading scholarship details...</p>
      </div>
    );
  }

  if (!scholarship) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Scholarship Application</h1>
        {/* Scholarship Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-2">{scholarship.title}</h2>
          <div className="flex items-center space-x-4 text-gray-600 mb-4">
            <div className="flex items-center">
                Max grant: {scholarship.maxAmountPerApplicant.toLocaleString()} Wei
            </div>
            <div className="flex items-center">
                Balance: {scholarship.balance.toLocaleString()} Wei
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-1" />
              {new Date(scholarship.deadline).toLocaleDateString()}
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-1" />
              {scholarship.applicants} applicants
            </div>
          </div>
          <p className="text-gray-600 mb-4">{scholarship.description}</p>
          <div>
            <h3 className="font-semibold mb-2">Requirements:</h3>
            <ul className="list-disc list-inside text-gray-600">
              {scholarship.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Application Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Scholarship Essay</h2>
          <div className="mb-6">
            <label htmlFor="essay" className="block text-sm font-medium text-gray-700 mb-2">
              Tell us why you deserve this scholarship (minimum 500 words)
            </label>
            <textarea
              id="essay"
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Write your essay here..."
            />
            <div className="mt-2 text-sm text-gray-500">
              Word count: {essay.split(/\s+/).filter(Boolean).length} / 500 minimum
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors"
              disabled={essay.split(/\s+/).filter(Boolean).length < 500}
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}