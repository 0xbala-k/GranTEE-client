import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useWeb3 } from '../Web3Context';
import { getScholarships, getApplications } from '../services/helper';
import { Clock, Users, CheckCircle, Plus, Search, RefreshCw, GraduationCap, DollarSign, Award } from 'lucide-react';
import { Scholarship } from '../types';

// Interface for tracking applied scholarships
interface AppliedScholarship {
  [scholarshipId: string]: boolean;
}

export function Scholarships() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [appliedScholarships, setAppliedScholarships] = useState<AppliedScholarship>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
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

  const filteredScholarships = scholarships.filter(scholarship => 
    scholarship.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    scholarship.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format currency numbers
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M Wei`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K Wei`;
    } else {
      return `${value} Wei`;
    }
  };

  // Calculate days remaining
  const getDaysRemaining = (deadline: string): string => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Last day";
    if (diffDays === 1) return "1 day left";
    return `${diffDays} days left`;
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <div className="max-w-6xl mx-auto">
        {/* Header with search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Scholarships</h1>
            <p className="text-gray-600">Discover and apply for available scholarship opportunities</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search scholarships..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full md:w-64"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <button 
              onClick={() => fetchScholarships()}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title="Refresh scholarships"
            >
              <RefreshCw className="h-5 w-5 text-gray-600" />
            </button>
            
            <Link
              to="/create-scholarship"
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-all transform hover:scale-105 shadow-md"
            >
              <Plus className="h-5 w-5" />
              <span>Create</span>
            </Link>
          </div>
        </div>
        
        {/* Loading state */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading scholarships...</p>
          </div>
        ) : filteredScholarships.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-sm text-center">
            {searchQuery ? (
              <>
                <Search className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No matching scholarships</h3>
                <p className="text-gray-600 mb-4">We couldn't find any scholarships matching "{searchQuery}"</p>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="text-blue-600 font-medium hover:text-blue-700"
                >
                  Clear search
                </button>
              </>
            ) : (
              <>
                <GraduationCap className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No scholarships available</h3>
                <p className="text-gray-600 mb-4">Be the first to create a scholarship opportunity</p>
                <Link
                  to="/create-scholarship"
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
                >
                  Create Scholarship
                </Link>
              </>
            )}
          </div>
        ) : (
          // Scholarships grid
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScholarships.map((scholarship, idx) => {
              const hasApplied = appliedScholarships[scholarship.id] || false;
              const daysRemaining = getDaysRemaining(scholarship.deadline);
              const isExpired = daysRemaining === "Expired";
              
              return (
                <div
                  key={scholarship.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden relative border border-gray-100 transition-all hover:shadow-lg transform hover:-translate-y-1 animate-fadeIn"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {/* Top colored bar with deadline */}
                  <div className={`h-2 w-full ${isExpired ? 'bg-red-500' : (hasApplied ? 'bg-green-500' : 'bg-blue-500')}`}></div>
                  
                  {/* Badge */}
                  {hasApplied && (
                    <div className="absolute top-4 right-4 bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center text-xs font-medium shadow-sm">
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Applied
                    </div>
                  )}
                  
                  {/* Deadline badge */}
                  <div className={`absolute top-4 left-4 ${
                    isExpired 
                      ? 'bg-red-100 text-red-800' 
                      : (daysRemaining.includes('day') && parseInt(daysRemaining) <= 7 && !isExpired)
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                  } px-3 py-1 rounded-full text-xs font-medium shadow-sm`}>
                    <Clock className="h-3.5 w-3.5 inline mr-1" />
                    {daysRemaining}
                  </div>
                  
                  <div className="p-6 pt-12">
                    <h2 className="text-xl font-semibold mb-2 text-gray-800 line-clamp-2">
                      {scholarship.title}
                    </h2>
                    
                    <div className="text-sm text-gray-600 mb-4 flex items-center">
                      <Award className="h-4 w-4 mr-1 text-gray-400" />
                      <span className="truncate">By: {scholarship.creator.slice(0, 6)}...{scholarship.creator.slice(-4)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Max Grant</div>
                        <div className="font-medium text-gray-800 flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                          {formatCurrency(scholarship.maxAmountPerApplicant)}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Balance</div>
                        <div className="font-medium text-gray-800 flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-blue-500" />
                          {formatCurrency(scholarship.balance)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-4">
                      <Users className="h-4 w-4 mr-1 text-gray-400" />
                      <span className="text-sm">{scholarship.applicants} applicant{scholarship.applicants !== 1 ? 's' : ''}</span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 text-sm line-clamp-3">{scholarship.description}</p>
                    
                    {scholarship.requirements.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Requirements:</h3>
                        <ul className="text-xs text-gray-600 space-y-1 ml-1">
                          {scholarship.requirements.slice(0, 3).map((req, index) => (
                            <li key={index} className="flex items-start">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                              <span className="line-clamp-1">{req}</span>
                            </li>
                          ))}
                          {scholarship.requirements.length > 3 && (
                            <li className="text-blue-500 text-xs">
                              +{scholarship.requirements.length - 3} more requirements
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      {hasApplied ? (
                        <button
                          disabled
                          className="bg-gray-100 text-gray-500 px-6 py-2.5 rounded-lg font-medium cursor-not-allowed border border-gray-200"
                        >
                          Already Applied
                        </button>
                      ) : isExpired ? (
                        <button
                          disabled
                          className="bg-gray-100 text-gray-500 px-6 py-2.5 rounded-lg font-medium cursor-not-allowed border border-gray-200"
                        >
                          Deadline Passed
                        </button>
                      ) : (
                        <Link
                          to={`/apply/${scholarship.id}`}
                          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
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