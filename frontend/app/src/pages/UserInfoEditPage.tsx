import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import './UserInfoEditPage.css';



const UserInfoEditPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        real_name: '',
        school: '',
        department: '',
        student_id: ''
    });

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await client.get('/api/users/me/');
                const profile = response.data.profile;
                setFormData({
                    real_name: profile.real_name,
                    school: profile.school,
                    department: profile.department,
                    student_id: profile.student_id
                });
            } catch (error) {
                console.error("Failed to fetch user info:", error);
                alert("사용자 정보를 불러오는데 실패했습니다.");
                navigate('/user/info');
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, [navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await client.put('/api/users/profile/', formData);
            alert("정보가 수정되었습니다.");
            navigate('/user/info');
        } catch (error: any) {
            console.error("Update failed:", error);
            if (error.response?.data) {
                const errorMsg = Object.values(error.response.data).join('\n');
                alert(`수정 실패:\n${errorMsg}`);
            } else {
                alert("정보 수정 중 오류가 발생했습니다.");
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div className="user-edit-container">
            <header className="user-edit-header">
                <h1>정보 수정</h1>
            </header>
            
            <form className="edit-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">이름</label>
                    <input
                        type="text"
                        name="real_name"
                        value={formData.real_name}
                        onChange={handleChange}
                        className="form-input"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">학교</label>
                    <input
                        type="text"
                        name="school"
                        value={formData.school}
                        onChange={handleChange}
                        className="form-input"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">학과</label>
                    <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="form-input"
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">학번</label>
                    <input
                        type="text"
                        name="student_id"
                        value={formData.student_id}
                        onChange={handleChange}
                        className="form-input"
                        required
                    />
                    <small style={{ color: '#64748b', marginTop: '4px' }}>
                        * 학번 변경 시 관리자 승인이 필요할 수 있습니다. (현재 바로 반영됨)
                    </small>
                </div>

                <div className="button-group">
                    <button type="button" className="cancel-btn" onClick={() => navigate('/user/info')}>
                        취소
                    </button>
                    <button type="submit" className="save-btn">
                        저장하기
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserInfoEditPage;
