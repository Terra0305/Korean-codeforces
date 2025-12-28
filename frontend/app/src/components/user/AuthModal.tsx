import Login from "./Login";
import Signup from "./Signup";
import { useState } from "react";

interface AuthModalProps {
    onClose: () => void;
}

type AuthModalType = 'login' | 'signup';

const AuthModal = ({onClose}: AuthModalProps) => {
    const [type, setType] = useState<AuthModalType>('login');
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="auth-container" onClick={(e) => e.stopPropagation()}>
                <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                     <button onClick={onClose} style={{background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-sub)'}}>&times;</button>
                </div>
                {type === 'login' ? <Login onClose={onClose} onSwitchToSignup={() => setType('signup')}/> : <Signup onSwitchToLogin={() => setType('login')}/>}
            </div>
        </div>
    );
}

export default AuthModal;
