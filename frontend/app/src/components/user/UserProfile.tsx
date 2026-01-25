import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

const UserProfile = () => {
    const {user, logout} = useAuth();
    const navigate = useNavigate();
    
    // Admin check
    const isAdmin = user?.is_staff;

    const handleUserInfoClick = async () => {
        try {
            const response = await client.get('/api/users/me/');
            console.log("User Info Response:", response.data);
            alert("User info logged to console");
        } catch (error) {
            console.error("Failed to fetch user info:", error);
        }
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
          </div>
    );
}

export default UserProfile;