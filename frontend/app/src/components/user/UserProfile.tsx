import { useAuth } from '../../context/AuthContext';

const UserProfile = () => {
    const {user, logout} = useAuth();
    return (
        <div className="user-profile">
            <span style={{color:'var(--text-sub)'}}>Time (KST): <span className="clock-text">Loading...</span></span>
            <div className="user-badge">{user?.profile.student_id}</div>
            <button className="user-name-btn" onClick={()=>{}}>{user?.profile.real_name}</button>
            <button onClick={logout} className="button">Logout</button>
          </div>
    );
}

export default UserProfile;