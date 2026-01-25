import './Navbar.css';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import UserProfile from './user/UserProfile';
import LoginButton from './user/LoginButton';
import AuthModal from './user/AuthModal';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const {isLoggedin, isLoading} = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleAuthClick = () => {
        setIsAuthModalOpen(true);
    }

    return (
        <>
        {isLoading && (
            <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <div className="loading-text">Loading...</div>
            </div>
        )}
        <nav className="navbar">
            <div style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
                <div className="navbar-logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
                    </svg>
                    Korean <span>Codeforces</span>
                </div>
            </div>

            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                {isLoggedin ? (
                <UserProfile />
                ) : (
                <LoginButton onClick={handleAuthClick} />
                )}
            </div>
        </nav>
        {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
        </>
    );
};

export default Navbar;
