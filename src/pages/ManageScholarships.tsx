import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '../Web3Context';
import { Clock, Users, Settings, Trash2, AlertTriangle } from 'lucide-react';
import { 
  getScholarshipsByCreator, 
  deleteScholarship,
} from '../services/helper';
import { Scholarship } from '../types';
import { AddFundsModal } from '../components/AddFundsModal';
import FundManagersModal from '../components/FundManagersModal';
import { toast } from 'react-toastify';

interface DeleteModalState {
  isOpen: boolean;
  scholarshipId: string;
  scholarshipTitle: string;
  isDeleting: boolean;
}

const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  title: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ isOpen, title, isDeleting, onClose, onConfirm }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          
          <h3 className="text-xl font-bold text-center mb-2">Delete Scholarship</h3>
          <p className="text-gray-600 text-center mb-6">
            Are you sure you want to delete "{title}"? This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
            >
              {isDeleting ? (
                <React.Fragment>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </React.Fragment>
              ) : (
                <React.Fragment>Delete</React.Fragment>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ManageScholarships: React.FC = () => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { account } = useWeb3();
  const [fundsModalScholarshipId, setFundsModalScholarshipId] = useState<string | null>(null);
  const [fundManagersModalScholarshipId, setFundManagersModalScholarshipId] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    scholarshipId: '',
    scholarshipTitle: '',
    isDeleting: false
  });

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      if (account) {
        const createdScholarships = await getScholarshipsByCreator(account);
        setScholarships(createdScholarships);
      }
    } catch (error) {
      console.error('Error fetching scholarships:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, [account]);

  const handleOpenFundsModal = (scholarshipId: string) => {
    setFundsModalScholarshipId(scholarshipId);
  };

  const openFundManagersModal = (scholarshipId: string) => {
    setFundManagersModalScholarshipId(scholarshipId);
  };

  const handleDeleteScholarship = async (id: string, title: string) => {
    setDeleteModal({
      isOpen: true,
      scholarshipId: id,
      scholarshipTitle: title,
      isDeleting: false
    });
  };
  
  const confirmDelete = async () => {
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));
    
    try {
      const toastId = toast.loading("Deleting scholarship...");
      
      await deleteScholarship(deleteModal.scholarshipId);
      
      toast.update(toastId, {
        render: `Scholarship "${deleteModal.scholarshipTitle}" has been successfully deleted`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeButton: true
      });
      
      fetchScholarships();
      
      setDeleteModal({
        isOpen: false,
        scholarshipId: '',
        scholarshipTitle: '',
        isDeleting: false
      });
      
    } catch (error) {
      console.error("Error deleting scholarship:", error);
      
      toast.error(
        <div className="flex items-start">
          <AlertTriangle className="text-red-500 mr-2 flex-shrink-0 h-5 w-5" />
          <div>
            <p className="font-medium">Failed to delete scholarship</p>
            <p className="text-sm text-gray-500">
              {error instanceof Error ? error.message : "Unknown error occurred"}
            </p>
          </div>
        </div>,
        {
          autoClose: 5000,
          closeButton: true
        }
      );
      
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Manage your scholarships</h1>
          <Link
            to="/create-scholarship"
            className="border-2 border-blue-600 border-dotted text-blue-600 px-8 py-4 rounded-full font-bold hover:bg-blue-50 transition-colors"
          >
            Create Scholarship
          </Link>
        </div>
        {!account && <p>Please connect your wallet to manage your scholarships.</p>}
        {loading && <p>Loading scholarships...</p>}
        {account && !loading && scholarships.length === 0 && (
          <p>You haven't created any scholarships yet.</p>
        )}
        {account && scholarships.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {scholarships.map((scholarship) => (
              <div key={scholarship.id} className="relative bg-white rounded-lg shadow-md overflow-hidden">
                {/* Gear icon for fund manager settings */}
                <button 
                  onClick={() => openFundManagersModal(scholarship.id)}
                  className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
                >
                  <Settings className="h-6 w-6" />
                </button>
                <div className="p-6">
                  <h2 className="text-2xl font-semibold mb-2">
                    {scholarship.title}
                  </h2>
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
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleOpenFundsModal(scholarship.id)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Add Funds
                      </button>
                      <button
                        onClick={() => handleDeleteScholarship(scholarship.id, scholarship.title)}
                        className="bg-red-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {fundsModalScholarshipId && (
        <AddFundsModal
          scholarshipId={fundsModalScholarshipId}
          onClose={() => setFundsModalScholarshipId(null)}
          onFundsAdded={fetchScholarships}
        />
      )}
      {fundManagersModalScholarshipId && (
        <FundManagersModal
          scholarshipId={fundManagersModalScholarshipId}
          onClose={() => setFundManagersModalScholarshipId(null)}
        />
      )}
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.scholarshipTitle}
        isDeleting={deleteModal.isDeleting}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ManageScholarships;