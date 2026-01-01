import './Navbar.css';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import UserProfile from './user/UserProfile';
import LoginButton from './user/LoginButton';
import AuthModal from './user/AuthModal';

interface NavbarProps {
    contestTitle?: string;
    remainingTime?: number;
}

const Navbar = ({ contestTitle, remainingTime }: NavbarProps) => {
    const {isLoggedin} = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const handleAuthClick = () => {
        setIsAuthModalOpen(true);
    }

    const formatTime = (seconds: number) => {
        if (seconds <= 0) return "Contest Ended";
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <>
        <nav className="navbar">
            <div style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
                <div className="navbar-logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
                    </svg>
                    Korean <span>Codeforces</span>
                </div>
                {contestTitle && (
                    <div className="contest-info" style={{fontWeight: 'bold', fontSize: '1.2rem', color: '#2c5282'}}>
                        {contestTitle}
                    </div>
                )}
            </div>

            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                {remainingTime !== undefined && (
                    <div className="navbar-timer" style={{
                        color: '#e53e3e', 
                        fontWeight: '800', 
                        fontFamily: 'monospace', 
                        fontSize: '1.5rem',
                        border: '2px solid #e53e3e',
                        padding: '2px 10px',
                        borderRadius: '4px'
                    }}>
                        {formatTime(remainingTime)}
                    </div>
                )}

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
