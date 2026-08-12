import React, { useEffect } from 'react';

import './Profile.css';

import { User } from '../../types/auth.d';

interface ProfileProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: () => void;
    onChangePassword: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, isOpen, onClose, onEdit, onChangePassword }) => {

    // ESC 키로 닫기
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen || !user) return null;

    const getRatingColor = (rating: number) => {
        if (rating >= 3000) return '#a00'; // Legendary Grandmaster
        if (rating >= 2600) return '#f33'; // International Grandmaster
        if (rating >= 2400) return '#f77'; // Grandmaster
        if (rating >= 2300) return '#fb5'; // International Master
        if (rating >= 2100) return '#fc8'; // Master
        if (rating >= 1900) return '#a0a'; // Candidate Master
        if (rating >= 1600) return '#aaf'; // Expert
        if (rating >= 1400) return '#77ddbb'; // Specialist
        if (rating >= 1200) return '#7f7'; // Pupil
        return '#fbbf24'; // Default/Newbie (Gold for visual consistency in card header)
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="profile-card" onClick={(e) => e.stopPropagation()}>
                <div className="profile-header">
                    <button className="close-btn" onClick={onClose}>&times;</button>
                    <h1 className="username">{user.username}</h1>
                    
                    <div className="handle-box">
                        <span>Codeforces:</span>
                        <a 
                            href={`https://codeforces.com/profile/${user.profile.codeforces_id}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="handle-link"
                        >
                            @{user.profile.codeforces_id}
                        </a>
                    </div>

                    <div className="rating-badge">
                        <span className="rating-label">ELO RATING</span>
                        <span style={{ color: getRatingColor(user.profile.elo_rating) }}>
                            {user.profile.elo_rating}
                        </span>
                    </div>
                </div>

                <div className="profile-body">
                    <div className="info-row">
                        <span className="info-label">이름</span>
                        <span className="info-value">{user.profile.real_name}</span>
                    </div>

                    <div className="info-row">
                        <span className="info-label">학교</span>
                        <span className="info-value">{user.profile.school}</span>
                    </div>

                    <div className="info-row">
                        <span className="info-label">전공</span>
                        <span className="info-value">{user.profile.department}</span>
                    </div>

                    <div className="info-row">
                        <span className="info-label">학번</span>
                        <span className="info-value">{user.profile.student_id}</span>
                    </div>
                </div>

                <div className="action-area">
                    <div className="btn-group" style={{marginTop: 0, gap: '10px'}}>
                        <button 
                            className="btn-edit" 
                            style={{flex: 2}}
                            onClick={onEdit}
                        >
                            회원정보 변경
                        </button>
                        <button 
                            className="btn-edit" 
                            style={{flex: 1, backgroundColor: '#f59e0b'}}
                            onClick={onChangePassword}
                        >
                            비밀번호 변경
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
