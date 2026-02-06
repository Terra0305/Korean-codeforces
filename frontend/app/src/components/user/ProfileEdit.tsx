import React, { useState, useEffect } from 'react';
import { User } from '../../types/auth.d';
import client from '../../api/client';
import './Profile.css';

interface ProfileEditProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onBack: () => void;
    onUpdate: () => void; // Callback to refresh user data
}

const ProfileEdit: React.FC<ProfileEditProps> = ({ user, isOpen, onClose, onBack, onUpdate }) => {
    const [formData, setFormData] = useState({
        real_name: '',
        school: '',
        department: '',
        student_id: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    
    // 비밀번호 변경 관련 상태
    const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        new_password_confirm: ''
    });
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);


    useEffect(() => {
        if (user) {
            setFormData({
                real_name: user?.profile?.real_name || '',
                school: user?.profile?.school || '',
                department: user?.profile?.department || '',
                student_id: user?.profile?.student_id || ''
            });
        }
    }, [user]);

    // ESC to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen || !user) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await client.put('/api/users/profile/', formData);
            alert("정보가 수정되었습니다.");
            onUpdate(); // Refresh user data
            onBack();   // Go back to profile view
        } catch (error: any) {
            console.error("Update failed:", error);
            if (error.response?.data) {
                // Handle dict based errors or single string
                const data = error.response.data;
                const errorMsg = typeof data === 'object' 
                    ? Object.values(data).join('\n') 
                    : String(data);
                alert(`수정 실패:\n${errorMsg}`);
            } else {
                alert("정보 수정 중 오류가 발생했습니다.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.new_password_confirm) {
            alert("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
            return;
        }

        setIsPasswordLoading(true);
        try {
            await client.post('/api/users/change-password/', {
                old_password: passwordData.old_password,
                new_password: passwordData.new_password,
                new_password_confirm: passwordData.new_password_confirm
            });
            alert("비밀번호가 성공적으로 변경되었습니다.");
            // 초기화 및 닫기
            setPasswordData({
                old_password: '',
                new_password: '',
                new_password_confirm: ''
            });
            setIsPasswordSectionOpen(false);
        } catch (error: any) {
            console.error("Password change failed:", error);
            if (error.response?.data) {
                // Handle dict based errors (e.g., old_password mismatch, weak password)
                const data = error.response.data;
                let errorMsg = "";
                if (typeof data === 'object') {
                   // Flatten unexpected nested objects or arrays if necessary, but simple join usually works for DRF
                   Object.entries(data).forEach(([key, value]) => {
                       errorMsg += `${value}\n`;
                   });
                } else {
                    errorMsg = String(data);
                }
                alert(`비밀번호 변경 실패:\n${errorMsg}`);
            } else {
                alert("비밀번호 변경 중 오류가 발생했습니다.");
            }
        } finally {
            setIsPasswordLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="profile-card" onClick={(e) => e.stopPropagation()}>
                <div className="edit-header">
                    <button className="close-btn" onClick={onClose} style={{ color: '#94a3b8' }}>&times;</button>
                    <h1 className="edit-title">회원정보 수정 ✏️</h1>
                </div>

                <div className="edit-form">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Username (ID)</label>
                            <input type="text" className="form-input" value={user.username} disabled />
                            <small style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                아이디는 변경할 수 없습니다.
                            </small>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Codeforces Handle</label>
                            <input type="text" className="form-input" value={user?.profile?.codeforces_id} disabled />
                            <small style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                 핸들 변경은 관리자에게 문의하세요.
                            </small>
                        </div>

                        <div className="form-group">
                            <label className="form-label">이름</label>
                            <input 
                                type="text" 
                                name="real_name" 
                                className="form-input" 
                                value={formData.real_name} 
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">학교</label>
                            <input 
                                type="text" 
                                name="school" 
                                className="form-input" 
                                value={formData.school} 
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">전공</label>
                            <input 
                                type="text" 
                                name="department" 
                                className="form-input" 
                                value={formData.department} 
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">학번</label>
                            <input 
                                type="text" 
                                name="student_id" 
                                className="form-input" 
                                value={formData.student_id} 
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="btn-group">
                            <button type="button" className="btn-cancel" onClick={onBack}>취소</button>
                            <button type="submit" className="btn-save" disabled={isLoading}>
                                {isLoading ? '저장 중...' : '변경 사항 저장'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileEdit;
