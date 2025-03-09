import React, { useState } from 'react';
import { useWeb3 } from '../Web3Context';
import { Scholarship } from '../types';
import { createScholarship, uploadScholarshipData } from '../services/helper';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Save, PlusCircle, Calendar, DollarSign, BookOpen, ListChecks, Check, User, X } from 'lucide-react';

// Form steps
type FormStep = 'basics' | 'details' | 'requirements' | 'review';

const CreateScholarship: React.FC = () => {
  const { account } = useWeb3();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<FormStep>('basics');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scholarship, setScholarship] = useState<Scholarship>({
    id: '',
    title: '',
    description: '',
    maxAmountPerApplicant: 0,
    deadline: '',
    applicants: 0,
    requirements: [''],
    balance: 0,
    creator: account||"",
  });

  // Form validation state
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    maxAmountPerApplicant?: string;
    deadline?: string;
    requirements?: string[];
  }>({});
  
  const validateCurrentStep = (): boolean => {
    const newErrors: typeof errors = {};
    let isValid = true;
    
    if (currentStep === 'basics') {
      if (!scholarship.title.trim()) {
        newErrors.title = 'Title is required';
        isValid = false;
      }
      
      if (scholarship.maxAmountPerApplicant <= 0) {
        newErrors.maxAmountPerApplicant = 'Amount must be greater than 0';
        isValid = false;
      }
    }
    else if (currentStep === 'details') {
      if (!scholarship.description.trim()) {
        newErrors.description = 'Description is required';
        isValid = false;
      } else if (scholarship.description.trim().length < 50) {
        newErrors.description = 'Description should be at least 50 characters';
        isValid = false;
      }
      
      if (!scholarship.deadline) {
        newErrors.deadline = 'Deadline is required';
        isValid = false;
      } else {
        const deadlineDate = new Date(scholarship.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (deadlineDate < today) {
          newErrors.deadline = 'Deadline cannot be in the past';
          isValid = false;
        }
      }
    }
    else if (currentStep === 'requirements') {
      const requirementsErrors: string[] = [];
      let hasRequirementError = false;
      
      scholarship.requirements.forEach((req, index) => {
        if (!req.trim()) {
          requirementsErrors[index] = 'Requirement cannot be empty';
          hasRequirementError = true;
        } else {
          requirementsErrors[index] = '';
        }
      });
      
      if (hasRequirementError) {
        newErrors.requirements = requirementsErrors;
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const nextStep = () => {
    if (!validateCurrentStep()) return;
    
    switch (currentStep) {
      case 'basics':
        setCurrentStep('details');
        break;
      case 'details':
        setCurrentStep('requirements');
        break;
      case 'requirements':
        setCurrentStep('review');
        break;
      default:
        break;
    }
  };

  const prevStep = () => {
    switch (currentStep) {
      case 'details':
        setCurrentStep('basics');
        break;
      case 'requirements':
        setCurrentStep('details');
        break;
      case 'review':
        setCurrentStep('requirements');
        break;
      default:
        break;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setScholarship(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle changes for the requirements array
  const handleRequirementChange = (index: number, value: string) => {
    const newRequirements = [...scholarship.requirements];
    newRequirements[index] = value;
    setScholarship(prev => ({ ...prev, requirements: newRequirements }));
    
    // Clear error for this requirement when user types
    if (errors.requirements && errors.requirements[index]) {
      const updatedRequirementErrors = [...(errors.requirements || [])];
      updatedRequirementErrors[index] = '';
      setErrors(prev => ({ ...prev, requirements: updatedRequirementErrors }));
    }
  };
  
  // Add a new empty requirement
  const addRequirement = () => {
    setScholarship(prev => ({
      ...prev,
      requirements: [...prev.requirements, ''],
    }));
  };

  // Remove a requirement by its index
  const removeRequirement = (index: number) => {
    // Don't remove if it's the only requirement
    if (scholarship.requirements.length <= 1) return;
    
    setScholarship(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
    
    // Update errors if necessary
    if (errors.requirements) {
      setErrors(prev => ({
        ...prev,
        requirements: prev.requirements?.filter((_, i) => i !== index),
      }));
    }
  };    

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation before submission
    if (!validateCurrentStep()) return;
    
    setIsSubmitting(true);
    
    // Show toast for creating scholarship
    const pendingToast = toast.loading("Creating scholarship...", {
      position: "bottom-right"
    });
    
    try {
      // Store in localStorage
      const existingScholarships = localStorage.getItem('scholarships');
      const scholarships = existingScholarships ? JSON.parse(existingScholarships) : [];
      scholarships.push(scholarship);
      localStorage.setItem('scholarships', JSON.stringify(scholarships));
      
      // Create scholarship on blockchain
      toast.update(pendingToast, { 
        render: "Creating scholarship on blockchain...", 
        type: "info", 
        isLoading: true 
      });
      
      await createScholarship();
      
      // Upload scholarship data to backend
      toast.update(pendingToast, { 
        render: "Uploading scholarship data...", 
        type: "info", 
        isLoading: true 
      });
      
      await uploadScholarshipData(scholarship);
      
      // Show success toast
      toast.update(pendingToast, { 
        render: "Scholarship created successfully! Redirecting...", 
        type: "success", 
        isLoading: false,
        autoClose: 3000
      });
      
      // Reset the form
      setScholarship({
        id: '',
        title: '',
        description: '',
        maxAmountPerApplicant: 0,
        deadline: '',
        applicants: 0,
        requirements: [],
        balance: 0,
        creator: account||"",
      });

      // Navigate to scholarships page after a short delay to allow the user to see the success message
      setTimeout(() => {
        navigate('/scholarships');
      }, 2000);
      
    } catch(error) {
      console.log("Error creating scholarship: ", error);
      toast.update(pendingToast, { 
        render: `Error creating scholarship: ${error instanceof Error ? error.message : String(error)}`, 
        type: "error", 
        isLoading: false,
        autoClose: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If no wallet is connected, show a message with improved styling
  if (!account) {
    return (
      <div className="max-w-xl mx-auto p-6 mt-12 bg-white rounded-xl shadow-sm text-center">
        <User className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Connect Your Wallet</h1>
        <p className="text-gray-600 mb-6">Please connect your wallet to create a scholarship.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 'basics':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <span className="bg-blue-600 text-white h-6 w-6 rounded-full inline-flex items-center justify-center text-sm mr-2">1</span>
                Basic Information
              </h2>
            
              {/* Scholarship Title */}
              <div className="mb-4">
                <label htmlFor="title" className="block mb-1.5 font-medium text-gray-700">
                  Scholarship Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={scholarship.title}
                  onChange={handleChange}
                  className={`w-full border ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'} px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="e.g., STEM Excellence Scholarship"
                  required
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* Amount */}
              <div className="mb-2">
                <label htmlFor="maxAmountPerApplicant" className="block mb-1.5 font-medium text-gray-700">
                  Max Grant Amount (Wei) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-3.5 text-gray-500">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <input
                    id="maxAmountPerApplicant"
                    name="maxAmountPerApplicant"
                    type="number"
                    value={scholarship.maxAmountPerApplicant}
                    onChange={handleChange}
                    className={`w-full border ${errors.maxAmountPerApplicant ? 'border-red-300 bg-red-50' : 'border-gray-300'} pl-11 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="e.g., 1000"
                    required
                  />
                </div>
                {errors.maxAmountPerApplicant && (
                  <p className="mt-1 text-sm text-red-600">{errors.maxAmountPerApplicant}</p>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'details':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <span className="bg-blue-600 text-white h-6 w-6 rounded-full inline-flex items-center justify-center text-sm mr-2">2</span>
                Scholarship Details
              </h2>
              
              {/* Description */}
              <div className="mb-4">
                <label htmlFor="description" className="block mb-1.5 font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={scholarship.description}
                  onChange={handleChange}
                  className={`w-full border ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'} px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  rows={5}
                  placeholder="Provide a detailed description of your scholarship, including its purpose and who should apply..."
                  required
                />
                <div className="flex justify-between mt-1 text-sm">
                  <span className={`${scholarship.description.length < 50 ? 'text-red-600' : 'text-gray-500'}`}>
                    {scholarship.description.length} / 50 characters (minimum)
                  </span>
                  {errors.description && <p className="text-red-600">{errors.description}</p>}
                </div>
              </div>

              {/* Deadline */}
              <div className="mb-2">
                <label htmlFor="deadline" className="block mb-1.5 font-medium text-gray-700">
                  Application Deadline <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-3.5 text-gray-500">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <input
                    id="deadline"
                    name="deadline"
                    type="date"
                    value={scholarship.deadline}
                    onChange={handleChange}
                    className={`w-full border ${errors.deadline ? 'border-red-300 bg-red-50' : 'border-gray-300'} pl-11 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    required
                  />
                </div>
                {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>}
              </div>
            </div>
          </div>
        );
      
      case 'requirements':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <span className="bg-blue-600 text-white h-6 w-6 rounded-full inline-flex items-center justify-center text-sm mr-2">3</span>
                Scholarship Requirements
              </h2>
              
              <div className="mb-2">
                <label className="block mb-2 font-medium text-gray-700">
                  Requirements <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-500 mb-4">List the eligibility requirements for applicants (e.g., GPA, field of study, etc.)</p>
                
                {scholarship.requirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-3">
                    <div className="flex-1 relative">
                      <div className="absolute left-3 top-3.5 text-gray-400">
                        <ListChecks className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => handleRequirementChange(index, e.target.value)}
                        className={`w-full border ${
                          errors.requirements && errors.requirements[index] 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300'
                        } pl-11 pr-10 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                        placeholder="Enter requirement"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="absolute right-3 top-3.5 text-gray-400 hover:text-red-500 transition-colors"
                        disabled={scholarship.requirements.length <= 1}
                        title="Remove requirement"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    {errors.requirements && errors.requirements[index] && (
                      <p className="mt-1 text-sm text-red-600">{errors.requirements[index]}</p>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addRequirement}
                  className="mt-2 flex items-center text-blue-600 hover:text-blue-700 transition-colors font-medium"
                >
                  <PlusCircle className="h-5 w-5 mr-1" />
                  Add Requirement
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'review':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <span className="bg-blue-600 text-white h-6 w-6 rounded-full inline-flex items-center justify-center text-sm mr-2">4</span>
                Review and Submit
              </h2>
              
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-medium text-gray-800">Scholarship Summary</h3>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:justify-between mb-3 pb-3 border-b border-gray-200">
                    <div className="font-medium text-gray-700">Title</div>
                    <div className="text-gray-800">{scholarship.title}</div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between mb-3 pb-3 border-b border-gray-200">
                    <div className="font-medium text-gray-700">Max Grant Amount</div>
                    <div className="text-gray-800">{scholarship.maxAmountPerApplicant.toLocaleString()} Wei</div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between mb-3 pb-3 border-b border-gray-200">
                    <div className="font-medium text-gray-700">Deadline</div>
                    <div className="text-gray-800">{new Date(scholarship.deadline).toLocaleDateString()}</div>
                  </div>
                  
                  <div className="flex flex-col mb-3 pb-3 border-b border-gray-200">
                    <div className="font-medium text-gray-700 mb-1">Description</div>
                    <div className="text-gray-800 text-sm">{scholarship.description}</div>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="font-medium text-gray-700 mb-1">Requirements</div>
                    <ul className="list-disc list-inside text-gray-800 text-sm">
                      {scholarship.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="mr-3 mt-0.5 text-blue-500">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800">What happens next?</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        After submission, your scholarship will be created on the blockchain and will be immediately available for applicants to apply.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Create Scholarship</h1>
        
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {['basics', 'details', 'requirements', 'review'].map((step, index) => (
              <div 
                key={step} 
                className={`flex flex-col items-center ${index === 0 ? 'items-start' : index === 3 ? 'items-end' : ''}`}
                style={{ width: index === 0 || index === 3 ? 'auto' : '100%' }}
              >
                <div 
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${step === currentStep 
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                      : (['details', 'requirements', 'review'].includes(currentStep) && step === 'basics') || 
                        (['requirements', 'review'].includes(currentStep) && step === 'details') ||
                        (currentStep === 'review' && step === 'requirements')
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    } z-10`}
                >
                  {(['details', 'requirements', 'review'].includes(currentStep) && step === 'basics') || 
                   (['requirements', 'review'].includes(currentStep) && step === 'details') ||
                   (currentStep === 'review' && step === 'requirements') ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`text-xs mt-1 ${step === currentStep ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                  {step.charAt(0).toUpperCase() + step.slice(1)}
                </span>
              </div>
            ))}
          </div>
          <div className="relative">
            <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full rounded"></div>
            <div 
              className="absolute top-0 left-0 h-1 bg-blue-600 rounded transition-all duration-500 ease-in-out"
              style={{ 
                width: currentStep === 'basics' 
                  ? '25%' 
                  : currentStep === 'details' 
                    ? '50%' 
                    : currentStep === 'requirements' 
                      ? '75%' 
                      : '100%' 
              }}
            ></div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="relative">
          {renderStep()}
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            {currentStep !== 'basics' ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </button>
            ) : (
              <div></div> // Empty div to maintain flex layout
            )}
            
            {currentStep !== 'review' ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            ) : (
              <button
                type="submit"
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Create Scholarship
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateScholarship;