import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { useWeb3 } from '../Web3Context.tsx';
import { 
  MessageCircleQuestion, 
  Loader2, 
  Award, 
  Server, 
  Zap, 
  Wallet
} from 'lucide-react';
import { useState, useEffect } from 'react';

// Add CSS styles as a string
const navStyles = `
  .nav-item {
    position: relative;
    font-weight: 500;
    padding: 0.25rem 0;
    display: flex;
    align-items: center;
    transition: color 0.3s;
  }

  .nav-item:after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: 0;
    left: 0;
    background-color: #3B82F6;
    transition: width 0.3s;
  }

  .nav-item:hover:after {
    width: 100%;
  }

  .wallet-btn, .wallet-connect-btn {
    position: relative;
    overflow: hidden;
  }

  .wallet-btn::before, .wallet-connect-btn::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    z-index: -1;
    background: linear-gradient(45deg, #3B82F6, #818CF8, #3B82F6);
    background-size: 200% 200%;
    animation: shine 1.5s linear infinite;
    border-radius: 9999px;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .wallet-btn:hover::before, .wallet-connect-btn:hover::before {
    opacity: 1;
  }

  @keyframes shine {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: 200% 0%;
    }
  }
`;

export function Navigation() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { account, connect, disconnect, isConnecting } = useWeb3();
  const [scrolled, setScrolled] = useState(false);

  // Track scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-16 ${
      scrolled ? 'bg-gradient-to-r from-blue-600 to-indigo-700 shadow-md' : 'bg-white shadow-sm'
    }`}>
      
      {/* Main navbar content */}
      <div className="container mx-auto h-full px-6 flex items-center justify-between relative z-10">
        <div className="flex items-center">
          <Logo isScrolled={scrolled} />
        </div>

        {/* For medium+ screens, show nav items */}
        <div className="hidden md:flex items-center space-x-6">
          {isHomePage ? (
            <></>
          ) : (
            <Link to="/" className={`text-gray-600 hover:text-blue-600 ${scrolled ? 'text-white hover:text-blue-200' : ''} transition-colors flex items-center`}>
              <Server className="h-4 w-4 mr-1.5" />
              <span>Home</span>
            </Link>
          )}
          <Link to="/scholarships" className={`nav-item group ${scrolled ? 'text-white' : 'text-gray-700'}`}>
            <Award className="h-4 w-4 inline mr-1.5 group-hover:text-blue-500 transition-colors" />
            <span>Scholarships</span>
          </Link>
          <Link to="/applications" className={`nav-item group ${scrolled ? 'text-white' : 'text-gray-700'}`}>
            <Zap className="h-4 w-4 inline mr-1.5 group-hover:text-blue-500 transition-colors" />
            <span>Applications</span>
          </Link>
          <Link to="/chatbot" className={`nav-item group ${scrolled ? 'text-white' : 'text-gray-700'}`}>
            <MessageCircleQuestion className="h-4 w-4 inline mr-1.5 group-hover:text-blue-500 transition-colors" />
            <span>Assistant</span>
          </Link>

          {account ? (
            <div className="flex items-center space-x-3 ml-2">
              <Link
                to="/profile"
                className="wallet-btn bg-blue-600 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-5 py-2 rounded-full font-semibold transition-all shadow-md hover:shadow-lg flex items-center space-x-2"
              >
                <span className="flex items-center space-x-2">
                  <div className="h-5 w-5 rounded-full bg-blue-400 flex items-center justify-center">
                    <Wallet className="h-3 w-3 text-white" />
                  </div>
                  <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
                </span>
              </Link>
              <button 
                onClick={disconnect} 
                className={`${scrolled ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'} px-5 py-2 rounded-full font-semibold transition-all`}
                disabled={isConnecting}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              className={`wallet-connect-btn ${
                isConnecting ? 'animate-pulse' : 'animate-none'
              } ${scrolled 
                ? 'bg-white text-blue-600 hover:bg-blue-50' 
                : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white'
              } px-5 py-2 rounded-full font-semibold transition-all shadow-md hover:shadow-lg flex items-center space-x-2`}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  <span>Connect Wallet</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Add CSS styles */}
      <style dangerouslySetInnerHTML={{ __html: navStyles }} />
    </nav>
  );
}