import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useWeb3 } from '../Web3Context';
import { getScholarships, getApplications } from '../services/helper';
import { Clock, Users, CheckCircle } from 'lucide-react';
import { Scholarship } from '../types';

// Interface for tracking applied scholarships
interface AppliedScholarship {
  [scholarshipId: string]: boolean;
}

export function Scholarships() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [appliedScholarships, setAppliedScholarships] = useState<AppliedScholarship>({});
  const [loading, setLoading] = useState<boolean>(true);
  const { account } = useWeb3();

  useEffect(() => {
    fetchScholarships();
  },
  [account]);

  useEffect(() => {
    if (account) {
      fetchUserApplications();
    }
  }, [account, scholarships]);

  const fetchUserApplications = async () => {
    try {
      const applications = await getApplications();
      const applied: AppliedScholarship = {};
      
      applications.forEach(app => {
        applied[app.scholarshipId.toString()] = true;
      });
      
      setAppliedScholarships(applied);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const fetchScholarships = async () => {
    setLoading(true);
    try{
      const scholarshipsResp = await getScholarships();
      setScholarships(scholarshipsResp);
    }catch(error){
      console.log("Error: ",error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Scholarships</h1>
          <Link
            to="/create-scholarship"
            className="border-2 border-blue-600 border-dotted text-blue-600 px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition-colors"
          >
            Create Scholarship
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <p>Loading scholarships...</p>
          </div>
        ) : scholarships.length === 0 ? (
          <div className="text-center py-8">
            <p>No scholarships available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {scholarships.map((scholarship) => {
              const hasApplied = appliedScholarships[scholarship.id] || false;
              
              return (
                <div
                  key={scholarship.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden relative"
                >
                  {hasApplied && (
                    <div className="absolute top-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center text-sm font-medium">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Applied
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-2xl font-semibold mb-2">
                      {scholarship.title}
                    </h2>
                    <div className="flex items-center space-x-4 text-gray-600 mb-4">
                      By: {scholarship.creator}
                    </div>
                    <div className="flex items-center space-x-4 text-gray-600 mb-4">
                      <div className="flex items-center">
                          Max grant: {scholarship.maxAmountPerApplicant.toLocaleString()} Wei
                      </div>
                      <div className="flex items-center">
                          Balance: {scholarship.balance.toLocaleString()} Wei
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-600 mb-4">
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
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Requirements:</h3>
                      <ul className="list-disc list-inside text-gray-600">
                        {scholarship.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex justify-end">
                      {hasApplied ? (
                        <button
                          disabled
                          className="bg-gray-300 text-gray-600 px-6 py-2 rounded-full font-semibold cursor-not-allowed"
                        >
                          Already Applied
                        </button>
                      ) : (
                        <Link
                          to={`/apply/${scholarship.id}`}
                          className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Apply Now
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}