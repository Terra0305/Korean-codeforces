import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import './UserInfoPage.css';

interface UserInfo {
    username: string;
    profile: {
        codeforces_id: string;
        elo_rating: number;
        real_name: string;
        school: string;
        department: string;
        student_id: string;
    };
}

const UserInfoPage: React.FC = () => {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await client.get('/api/users/me/');
                setUserInfo(response.data);
            } catch (error) {
                console.error("Failed to fetch user info:", error);
                alert("사용자 정보를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

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
        return '#ccc'; // Newbie
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div>Loading...</div>
            </div>
        );
    }

    if (!userInfo) {
        return (
            <div className="loading-container">
                <div>사용자 정보를 찾을 수 없습니다.</div>
            </div>
        );
    }

    return (
        <div className="user-info-container">
            <header className="user-info-header">
                <h1>내 정보</h1>
            </header>
            
            <div className="user-main-info">
                <div className="info-badge">
                    <span className="info-label">Username</span>
                    <span className="info-value">{userInfo.username}</span>
                </div>
                <div className="info-badge">
                    <span className="info-label">Codeforces Handle</span>
                    <span className="info-value" style={{ color: getRatingColor(userInfo.profile.elo_rating) }}>
                        {userInfo.profile.codeforces_id}
                    </span>
                </div>
                <div className="info-badge">
                    <span className="info-label">ELO Rating</span>
                    <span className="info-value elo-rating" style={{ color: getRatingColor(userInfo.profile.elo_rating) }}>
                        {userInfo.profile.elo_rating}
                    </span>
                </div>
            </div>

            <div className="user-detail-section">
                <div className="detail-card">
                    <div className="detail-label">이름</div>
                    <div className="detail-value">{userInfo.profile.real_name}</div>
                </div>
                <div className="detail-card">
                    <div className="detail-label">학교</div>
                    <div className="detail-value">{userInfo.profile.school}</div>
                </div>
                <div className="detail-card">
                    <div className="detail-label">학과</div>
                    <div className="detail-value">{userInfo.profile.department}</div>
                </div>
                <div className="detail-card">
                    <div className="detail-label">학번</div>
                    <div className="detail-value">{userInfo.profile.student_id}</div>
                </div>
            </div>

            <div className="action-buttons">
                <button className="edit-btn" onClick={() => navigate('/user/edit')}>
                    정보 수정하기
                </button>
            </div>
        </div>
    );
};

export default UserInfoPage;
