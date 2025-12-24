import './Navbar.css';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const {user, isLoggedin, login, logout} = useAuth();

    const handleLogin = () => {
      login('박윤수', '20213099');
    }
    
  return (
    <nav className="navbar">
      <div className="logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
            </svg>
            Korean <span>Codeforces</span>
        </div>
        {isLoggedin ? (
          <div className="user-profile">
            <span style={{color:'var(--text-sub)'}}>Time (KST): <span id="clock" style={{fontFamily:'monospace'}}>Loading...</span></span>
            <div className="user-badge">{user?.studentId}</div>
            <button style={{background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontWeight: 'bold',
                            color: 'var(--text-main)'}} onClick={()=>{}}>{user?.name}</button>
            <button onClick={logout} style={styles.button}>Logout</button>
          </div>
        ) : (
          <button onClick={handleLogin} style={styles.button}>Login</button>
        )}
    </nav>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1rem',
    background: 'var(--card-bg)', // CSS 변수 사용
    borderBottom: '1px solid var(--border-color)',
    alignItems: 'center',
  },
  logo: {
    fontWeight: 'bold',
    fontSize: '1.2rem',
    color: 'var(--primary-color)',
  },
  menu: {
    display: 'flex',
    alignItems: 'center',
  },
  userInfo: {
    color: 'var(--text-main)',
    fontWeight: 500,
  },
  button: {
    padding: '0.5rem 1rem',
    background: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '10px',
  }
} as const;

export default Navbar;
