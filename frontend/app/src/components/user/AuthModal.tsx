import Login from "./Login";


interface AuthModalProps {
    onClose: () => void;
}

const AuthModal = ({onClose}: AuthModalProps) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="auth-container" onClick={(e) => e.stopPropagation()}>
                <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                     <button onClick={onClose} style={{background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-sub)'}}>&times;</button>
                </div>
                <Login onClose={onClose} />
            </div>
        </div>
    );
}

export default AuthModal;
