import './Login.css';
import { useState } from 'react';

interface SignupProps{
    onClose: () => void;
}

const Signup = ({onClose}: SignupProps) => {
    const [formData, setFormData] = useState({
        handle: '',
        studentId: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    return (
    <div className="auth-container">
        <div className="header-text">
            <h1>Create Account</h1>
            <p>우리 학교 학생 인증을 통해 가입하세요.</p>
        </div>

        <form action="login.html" onSubmit={(e)=>(e.preventDefault())}>
            <div className="form-group">
                <label className="form-label">Codeforces Handle</label>
                <div className="input-group">
                    <input type="text" className="form-input" placeholder="ex) tourist" required/>
                    <button type="button" className="btn-verify" onClick={(e)=>(e.preventDefault())}>Check</button>
                </div>
                <div className="helper-text">실제 사용하는 Codeforces 핸들을 입력해주세요.</div>
            </div>

            <div className="form-group">
                <label className="form-label">Student ID (학번)</label>
                <div className="input-group">
                    <input type="number" className="form-input" placeholder="20250000" id="studentId" required/>
                    <button type="button" className="btn-verify" onClick={(e)=>(e.preventDefault())}>Verify</button>
                </div>
                <div className="helper-text" id="verify-msg">학번 입력 후 Verify 버튼을 눌러주세요.</div>
            </div>

            <div className="form-group">
                <label className="form-label">School Email</label>
                <input type="email" className="form-input" placeholder="example@univ.ac.kr" required/>
            </div>

            <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" className="form-input" placeholder="Min. 8 characters" required/>
            </div>

            <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input type="password" className="form-input" placeholder="Re-enter password" required/>
            </div>

            <button type="submit" className="btn-submit">회원가입 완료</button>
        </form>

        <div className="footer-links">
            이미 계정이 있으신가요? <a href="login.html">로그인 하기</a>
        </div>
    </div>
    );
}

export default Signup;