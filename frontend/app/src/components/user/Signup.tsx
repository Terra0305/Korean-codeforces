import './Login.css';
import { useState } from 'react';

interface SignupProps{
    onSwitchToLogin: () => void;
}

const Signup = ({onSwitchToLogin}: SignupProps) => {
    const [formData, setFormData] = useState({
        handle: '',
        studentId: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleSignup = (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        alert("회원가입 성공");
        onSwitchToLogin();
    }

    return (
    <div className="signup-wrapper">
        <div className="header-text">
            <h1>Create Account</h1>
            <p>우리 학교 학생 인증을 통해 가입하세요.</p>
        </div>

        <form action="login.html" onSubmit={handleSignup}>
            <div className="form-group">
                <label className="form-label">Codeforces Handle</label>
                <div className="input-group">
                    <input onChange={(e)=>setFormData({...formData, handle: e.target.value})} type="text" className="form-input" placeholder="ex) tourist" required/>
                    <button type="button" className="btn-verify" onClick={(e)=>(e.preventDefault())}>Check</button>
                </div>
                <div className="helper-text">실제 사용하는 Codeforces 핸들을 입력해주세요.</div>
            </div>

            <div className="form-group">
                <label className="form-label">Student ID (학번)</label>
                <div className="input-group">
                    <input onChange={(e)=>setFormData({...formData, studentId: e.target.value})} type="number" className="form-input" placeholder="20250000" id="studentId" required/>
                    <button type="button" className="btn-verify" onClick={(e)=>(e.preventDefault())}>Verify</button>
                </div>
                <div className="helper-text" id="verify-msg">학번 입력 후 Verify 버튼을 눌러주세요.</div>
            </div>

            <div className="form-group">
                <label className="form-label">School Email</label>
                <input onChange={(e)=>setFormData({...formData, email: e.target.value})} type="email" className="form-input" placeholder="example@univ.ac.kr" required/>
            </div>

            <div className="form-group">
                <label className="form-label">Password</label>
                <input onChange={(e)=>setFormData({...formData, password: e.target.value})} type="password" className="form-input" placeholder="Min. 8 characters" required/>
            </div>

            <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input onChange={(e)=>setFormData({...formData, confirmPassword: e.target.value})} type="password" className="form-input" placeholder="Re-enter password" required/>
            </div>

            <button type="submit" className="btn-submit">회원가입 완료</button>
        </form>

        <div className="footer-links">
            이미 계정이 있으신가요? <a href="#" onClick={onSwitchToLogin}>로그인 하기</a>
        </div>
    </div>
    );
}

export default Signup;