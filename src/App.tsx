import { Routes, Route, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation.tsx';
import { Home } from './pages/Home.tsx';
import { Scholarships } from './pages/Scholarships.tsx';
import { Apply } from './pages/Apply.tsx';
import { Applications } from './pages/Applications.tsx';
import { Web3Provider } from './Web3Context.tsx';
import Profile from './pages/Profile.tsx';
import CreateScholarship from './pages/CreateScholarship.tsx';
import ManageScholarships from './pages/ManageScholarships.tsx';
import ChatBot from './pages/ChatBot.tsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MainContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <div className={`min-h-screen bg-gray-50 ${!isHomePage ? 'pt-16' : ''}`}>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scholarships" element={<Scholarships />} />
        <Route path="/apply/:scholarshipId" element={<Apply />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/create-scholarship" element={<CreateScholarship />} />
        <Route path="/manage-scholarships" element={<ManageScholarships/>} />
        <Route path="/chatbot" element={<ChatBot />} />
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} 
        newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}

function App() {
  return (
    <Web3Provider>
      <MainContent />
    </Web3Provider>
  );
}

export default App;