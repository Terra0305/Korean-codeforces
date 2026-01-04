import '../components/user/Login.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const SignupPage = () => {
    const {setIsLoading} = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        password_confirm: '',
        school: '',
        department: '',
        student_id: '',
        real_name: '',
        codeforces_id: ''
    });

    const handleSignup = async (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (formData.password !== formData.password_confirm) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            setIsLoading(true);
            const response = await client.post('/api/users/register/', formData);
            if (response.status === 201) {
                alert('회원가입이 완료되었습니다.');
                navigate('/'); // Go back to home, user can login there
            }
        } catch (error: any) {
            console.error('Signup failed:', error);
            const errorMessage = error.response?.data ? 
                Object.values(error.response.data as Record<string, string[]>).flat().join('\n') :
                '회원가입에 실패했습니다.';
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="signup-page-container" style={{display: 'flex', justifyContent: 'center', padding: '50px 0'}}>
            <div className="signup-wrapper" style={{width: '100%', maxWidth: '500px', background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                <div className="header-text">
                    <h1>Create Account</h1>
                    <p>우리 학교 학생 인증을 통해 가입하세요.</p>
                </div>

                <form onSubmit={handleSignup}>
                    <div className="form-group">
                        <label className="form-label">아이디 (ID)</label>
                        <input 
                            name="username"
                            value={formData.username}
                            onChange={handleChange} 
                            type="text" 
                            className="form-input" 
                            placeholder="아이디를 입력해주세요" 
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">비밀번호</label>
                        <input 
                            name="password"
                            value={formData.password}
                            onChange={handleChange} 
                            type="password" 
                            className="form-input" 
                            placeholder="영문/숫자/특수문자 포함 8자 이상" 
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">비밀번호 확인</label>
                        <input 
                            name="password_confirm"
                            value={formData.password_confirm}
                            onChange={handleChange} 
                            type="password" 
                            className="form-input" 
                            placeholder="비밀번호를 다시 입력해주세요" 
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">이름 (Real Name)</label>
                        <input 
                            name="real_name"
                            value={formData.real_name}
                            onChange={handleChange} 
                            type="text" 
                            className="form-input" 
                            placeholder="실명을 입력해주세요" 
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Codeforces Handle</label>
                        <div className="input-group">
                            <input 
                                name="codeforces_id"
                                value={formData.codeforces_id}
                                onChange={handleChange} 
                                type="text" 
                                className="form-input" 
                                placeholder="ex) tourist" 
                                required
                            />
                            <button type="button" className="btn-verify" onClick={(e)=>(e.preventDefault())}>Check</button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">학교 (School)</label>
                        <input 
                            name="school"
                            value={formData.school}
                            onChange={handleChange} 
                            type="text" 
                            className="form-input" 
                            placeholder="학교명을 입력해주세요" 
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">학과 (Department)</label>
                        <input 
                            name="department"
                            value={formData.department}
                            onChange={handleChange} 
                            type="text" 
                            className="form-input" 
                            placeholder="학과를 입력해주세요" 
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">학번 (Student ID)</label>
                        <div className="input-group">
                            <input 
                                name="student_id"
                                value={formData.student_id}
                                onChange={handleChange} 
                                type="text" 
                                className="form-input" 
                                placeholder="학번을 입력해주세요" 
                                required
                            />
                            <button type="button" className="btn-verify" onClick={(e)=>(e.preventDefault())}>Verify</button>
                        </div>
                    </div>

                    <button type="submit" className="btn-submit">회원가입 완료</button>
                </form>
                <div className="footer-links">
                    이미 계정이 있으신가요? <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}>로그인 하기</a>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;
