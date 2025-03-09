import React, { useState } from 'react';
import { useWeb3 } from '../Web3Context';
import { Scholarship } from '../types';
import { createScholarship, uploadScholarshipData } from '../services/helper';
import { toast } from 'react-toastify';

const CreateScholarship: React.FC = () => {
  const { account } = useWeb3();
  const [scholarship, setScholarship] = useState<Scholarship>({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setScholarship((prev) => ({ ...prev, [name]: value }));
  };

    // Handle changes for the requirements array
    const handleRequirementChange = (index: number, value: string) => {
        const newRequirements = [...scholarship.requirements];
        newRequirements[index] = value;
        setScholarship(prev => ({ ...prev, requirements: newRequirements }));
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
        setScholarship(prev => ({
            ...prev,
            requirements: prev.requirements.filter((_, i) => i !== index),
        }));
    };    

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show toast for processing
    const pendingToast = toast.loading("Creating scholarship...");
    
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
        render: "Scholarship created successfully!", 
        type: "success", 
        isLoading: false,
        autoClose: 5000
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
    } catch(error) {
      console.log("Error creating scholarship: ", error);
      toast.update(pendingToast, { 
        render: `Error creating scholarship: ${error instanceof Error ? error.message : String(error)}`, 
        type: "error", 
        isLoading: false,
        autoClose: 5000
      });
    }
  };

    // If no wallet is connected, show a message
    if (!account) {
        return (
            <div className="max-w-xl mx-auto p-4">
            <h1 className="text-xl font-bold mb-4">Create Scholarship</h1>
            <p>Please connect your wallet to create a scholarship.</p>
            </div>
        );
    }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create Scholarship</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Scholarship Title */}
        <div>
          <label htmlFor="title" className="block mb-1 font-medium">
            Scholarship Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={scholarship.title}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block mb-1 font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={scholarship.description}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
            rows={4}
            required
          />
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="maxAmountPerApplicant" className="block mb-1 font-medium">
            Max Amount Per Applicant
          </label>
          <input
            id="maxAmountPerApplicant"
            name="maxAmountPerApplicant"
            type="number"
            value={scholarship.maxAmountPerApplicant}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
            placeholder="e.g., 1000"
            required
          />
        </div>

        {/* Deadline */}
        <div>
          <label htmlFor="deadline" className="block mb-1 font-medium">
            Deadline
          </label>
          <input
            id="deadline"
            name="deadline"
            type="date"
            value={scholarship.deadline}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Requirements</label>
          {scholarship.requirements.map((req, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={req}
                onChange={(e) => handleRequirementChange(index, e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded"
                placeholder="Enter requirement"
                required
              />
              <button
                type="button"
                onClick={() => removeRequirement(index)}
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addRequirement}
            className="text-blue-600 underline"
          >
            Add Requirement
          </button>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded font-semibold hover:bg-blue-700 transition-colors"
        >
          Create Scholarship
        </button>
      </form>
    </div>
  );
};

export default CreateScholarship;