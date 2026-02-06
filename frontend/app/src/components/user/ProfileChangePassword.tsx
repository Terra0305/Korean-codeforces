import React, { useState, useEffect } from 'react';
import { User } from '../../types/auth.d';
import client from '../../api/client';
import './Profile.css';

interface ProfileChangePasswordProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onBack: () => void;
}

const ProfileChangePassword: React.FC<ProfileChangePasswordProps> = ({ user, isOpen, onClose, onBack }) => {
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        new_password_confirm: ''
    });
    const [isLoading, setIsLoading] = useState(false);

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
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.new_password_confirm) {
            alert("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
            return;
        }

        setIsLoading(true);
        try {
            await client.post('/api/users/change-password/', {
                old_password: passwordData.old_password,
                new_password: passwordData.new_password,
                new_password_confirm: passwordData.new_password_confirm
            });
            alert("비밀번호가 성공적으로 변경되었습니다.");
            onBack(); // Go back to profile view
        } catch (error: any) {
            console.error("Password change failed:", error);
            if (error.response?.data) {
                const data = error.response.data;
                let errorMsg = "";
                if (typeof data === 'object') {
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
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="profile-card" onClick={(e) => e.stopPropagation()}>
                <div className="edit-header">
                    <button className="close-btn" onClick={onClose} style={{ color: '#94a3b8' }}>&times;</button>
                    <h1 className="edit-title">비밀번호 변경 🔒</h1>
                </div>

                <div className="edit-form">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">현재 비밀번호</label>
                            <input 
                                type="password" 
                                name="old_password" 
                                className="form-input" 
                                value={passwordData.old_password} 
                                onChange={handleChange}
                                required 
                                placeholder="현재 비밀번호를 입력하세요"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">새 비밀번호</label>
                            <input 
                                type="password" 
                                name="new_password" 
                                className="form-input" 
                                value={passwordData.new_password} 
                                onChange={handleChange}
                                required 
                                placeholder="새 비밀번호 (영문, 숫자, 특수문자 포함 8자 이상)"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">새 비밀번호 확인</label>
                            <input 
                                type="password" 
                                name="new_password_confirm" 
                                className="form-input" 
                                value={passwordData.new_password_confirm} 
                                onChange={handleChange}
                                required 
                                placeholder="새 비밀번호를 다시 입력하세요"
                            />
                        </div>

                        <div className="btn-group">
                            <button type="button" className="btn-cancel" onClick={onBack}>취소</button>
                            <button type="submit" className="btn-save" disabled={isLoading} style={{backgroundColor: '#f59e0b'}}>
                                {isLoading ? '변경 중...' : '비밀번호 변경'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileChangePassword;
