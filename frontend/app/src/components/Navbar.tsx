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
                    <img src="/logo.png" alt="Logo" width="48" height="48" />
                    ChoSun <span>codeForces</span>
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
