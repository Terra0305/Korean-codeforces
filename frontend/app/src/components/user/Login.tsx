import './Login.css';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

interface LoginProps {
    onClose: () => void;
    onSwitchToSignup: () => void;
}

const Login = ({ onClose, onSwitchToSignup }: LoginProps) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        handle: '',
        password: '',
    });

    const handleLogin = (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const success = login(formData.handle, formData.password);
        if (success) {
            onClose();
        }
        else{
            alert('로그인 실패');
        }
    }

    return (
        <>
                <div className="login-logo">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
                    </svg>
                    Korean <span>Codeforces</span>
                </div>

                <form onSubmit={handleLogin}> 
                    <div className="form-group">
                        <label className="form-label">코드포스 핸들 (ID)</label>
                        <input type="text" className="form-input" placeholder="핸들(Handle)을 입력해주세요." required value={formData.handle} onChange={(e) => setFormData({...formData, handle: e.target.value})}/>
                    </div>

                    <div className="form-group">
                        <label className="form-label">비밀번호</label>
                        <input type="password" className="form-input" placeholder="비밀번호를 입력해주세요." required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}/>
                    </div>

                    <button type="submit" className="btn-submit">로그인</button>
                </form>

                <div className="footer-links">
                    계정이 없으신가요? <a href="#" onClick={onSwitchToSignup}>회원가입 하기</a>
                </div>
        </>
    );
}

export default Login;