import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import ProfileEdit from './ProfileEdit';
import Profile from './Profile';
import ProfileChangePassword from './ProfileChangePassword';

const UserProfile = () => {
    const {user, logout} = useAuth();
    const navigate = useNavigate();
    
    // Admin check
    const isAdmin = user?.is_staff;

    const [modalMode, setModalMode] = useState<'none' | 'view' | 'edit' | 'password'>('none');

    const handleUserInfoClick = () => {
        setModalMode('view');
    };

    const handleEditClick = () => {
        setModalMode('edit');
    };

    const handlePasswordClick = () => {
        setModalMode('password');
    }

    const handleClose = () => {
        setModalMode('none');
    };

    const handleRefresh = () => {
        // Option to refresh user data if necessary
        // refreshUser(); // If provided by AuthContext
        window.location.reload(); // Simple refresh to reflect changes
    };

    return (
        <div className="user-profile">
            <span style={{color:'var(--text-sub)'}}>Time (KST): <span className="clock-text">Loading...</span></span>
            {isAdmin && (
                <button 
                    onClick={() => navigate('/create-contest')} 
                    className="button"
                    style={{backgroundColor: '#e53e3e', color: 'white', border: 'none', marginRight: '10px'}}
                >
                    대회 생성
                </button>
            )}
            {isAdmin && (
                <button 
                    onClick={() => navigate('/edit-contest')} 
                    className="button"
                    style={{backgroundColor: '#e53e3e', color: 'white', border: 'none', marginRight: '10px'}}
                >
                    대회 수정
                </button>
            )}
            <div 
                className="user-badge"
                style={isAdmin ? {backgroundColor: '#e53e3e', color: 'white'} : {}}
            >
                {user?.profile.student_id}
            </div>
            <button className="user-name-btn" onClick={handleUserInfoClick}>{user?.profile.real_name}</button>
            <button onClick={logout} className="button">Logout</button>
            
            <Profile 
                user={user as any} 
                isOpen={modalMode === 'view'} 
                onClose={handleClose}
                onEdit={handleEditClick}
                onChangePassword={handlePasswordClick}
            />
            
            {modalMode === 'edit' && (
                <ProfileEdit 
                    user={user as any}
                    isOpen={modalMode === 'edit'}
                    onClose={handleClose}
                    onBack={() => setModalMode('view')}
                    onUpdate={handleRefresh}
                />
            )}

            {modalMode === 'password' && (
                <ProfileChangePassword 
                    user={user as any}
                    isOpen={modalMode === 'password'}
                    onClose={handleClose}
                    onBack={() => setModalMode('view')}
                />
            )}
          </div>
    );
}

export default UserProfile;