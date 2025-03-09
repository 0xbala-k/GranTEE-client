import { Shield, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LogoProps {
  isScrolled?: boolean;
}

export function Logo({ isScrolled = false }: LogoProps) {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <div className="relative">
        <Shield className="h-8 w-8 text-blue-500" />
        <CheckCircle className="h-4 w-4 text-blue-600 absolute -bottom-1 -right-1" />
      </div>
      <span className={`text-2xl font-bold transition-colors ${isScrolled ? 'text-white' : ''}`}>
        Gran<span className={`${isScrolled ? 'text-blue-200' : 'text-blue-600'} transition-colors`}>TEE</span>
      </span>
    </Link>
  );
}