import './Navbar.css';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import UserProfile from './user/UserProfile';
import LoginButton from './user/LoginButton';
import AuthModal from './user/AuthModal';

const Navbar = () => {
    const {isLoggedin} = useAuth();

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const handleAuthClick = () => {
        setIsAuthModalOpen(true);
    }

  return (
    <>
    <nav className="navbar">
      <div className="navbar-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
            </svg>
            Korean <span>Codeforces</span>
        </div>
        {isLoggedin ? (
          <UserProfile />
        ) : (
          <LoginButton onClick={handleAuthClick} />
        )}
    </nav>
    {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
    </>
  );
};

export default Navbar;
