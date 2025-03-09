import { useEffect, useState } from 'react';
import { getApplications, getScholarshipById } from '../services/helper';
import { Scholarship } from '../types';
import { useWeb3 } from '../Web3Context';

interface ApplicationWithScholarship {
  application: Application;
  scholarship?: Scholarship;
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
}

export function Applications() {
  const [applicationsWithScholarships, setApplicationsWithScholarships] = useState<ApplicationWithScholarship[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { account } = useWeb3();
  

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all applications for the current user.
        const applications = await getApplications();
        const combinedData: ApplicationWithScholarship[] = [];
        // Combine application data with its scholarship details.
        for (const app of applications) {
          const scholarship = await getScholarshipById(app.scholarshipId);
          combinedData.push({ application: app, scholarship });
        }
        setApplicationsWithScholarships(combinedData);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatus = (paid: boolean) => {
    return paid ? "Sent" : "Not Paid";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Applications</h1>
      {!account && <p>Please connect your wallet to manage your scholarships.</p>}
      {loading ? (
        <p>Loading applications...</p>
      ) : account && !loading &&applicationsWithScholarships.length === 0 ? (
        <p>You haven't applied to any scholarships yet.</p>
      ): (
        <div className="space-y-4">
          {applicationsWithScholarships.map((item, index) => (
            <div key={index} className="border p-4 rounded shadow-sm">
              <h2 className="text-2xl font-semibold">
                {item.scholarship ? item.scholarship.title : "Scholarship Not Found"}
              </h2>
              <p><strong>By:</strong> {item.scholarship? item.scholarship.creator:"NA"}</p>
              <p><strong>Balance:</strong> {item.scholarship? item.scholarship.balance:"NA"}</p>
              <p><strong>Max grant:</strong> {item.scholarship? item.scholarship.maxAmountPerApplicant:"NA"}</p>
              <p>
                <strong>Deadline:</strong>{" "}
                {item.scholarship ? new Date(item.scholarship.deadline).toLocaleDateString() : "N/A"}
              </p>
              <p>
                <strong>Status:</strong> {ApplicationStatus[item.application.status]}
              </p>
              <p>
                <strong>Payment Status:</strong> {getStatus(item.application.paid)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
