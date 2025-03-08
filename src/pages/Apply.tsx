import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';
import { Scholarship } from '../types';
import { applyScholarship, getScholarshipById } from '../services/helper';

export function Apply() {
  const { scholarshipId } = useParams();
  const navigate = useNavigate();
  const [essay, setEssay] = useState('');
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);

  useEffect(() => {
    if (scholarshipId) {
      fetchScholarship();
    } else {
      navigate('/scholarships');
    }
  }, [scholarshipId, navigate]);

  const fetchScholarship = async () => {
    try {
      const found = await getScholarshipById(Number(scholarshipId));
      if (found) {
        setScholarship(found);
      } else {
        navigate('/scholarships');
      }
    } catch (error) {
      console.error('Error fetching scholarship:', error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    try{
      await applyScholarship(Number(scholarshipId), {essay:essay});
    }
    catch(error){
      console.log("Error: ",error);
    }
    console.log('Form submitted:', { scholarshipId, essay });
  };

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