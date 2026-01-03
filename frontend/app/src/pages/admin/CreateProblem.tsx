import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import Navbar from '../../components/Navbar';
import ContestSelectionModal from '../../components/admin/ContestSelectionModal';
import './Admin.css';

const CreateProblem = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        contest: '', // Contest ID (FK)
        contestName: '', // For display purposes
        index: '', // e.g. 'A', 'B'
        points: 0,
        rating: 0,
        url: '', // Problem Link
        description_kr: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleContestSelect = (contestId: number, contestName: string) => {
        setFormData(prev => ({
            ...prev,
            contest: contestId.toString(),
            contestName: contestName
        }));
        setIsModalOpen(false);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            // Remove contestName before sending to API
            const { contestName, ...submitData } = formData;
            const response = await client.post('/admin/problems/', submitData);
            
            if (response.status === 201) {
                alert('문제가 성공적으로 생성되었습니다.');
                // Optionally maintain state or clear
                setFormData({
                    contest: '', contestName: '', index: '', points: 0, rating: 0, url: '', description_kr: ''
                });
            }
        } catch (error: any) {
            console.error('Failed to create problem:', error);
            const errorMessage = error.response?.data ? 
                JSON.stringify(error.response.data) : '문제 생성에 실패했습니다.';
            alert(errorMessage);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="admin-page-container">
                <div className="admin-card">
                    <h1 className="admin-header">문제 생성 (Admin)</h1>
                    
                    <form onSubmit={handleSubmit}>
                        
                        {/* Contest Selection */}
                        <div className="admin-form-group">
                            <label className="admin-form-label">대회 선택</label>
                            <div style={{display: 'flex', gap: '10px'}}>
                                <input 
                                    type="text"
                                    value={formData.contestName || formData.contest}
                                    placeholder="대회를 선택해주세요"
                                    className="admin-form-input"
                                    readOnly
                                    onClick={() => setIsModalOpen(true)}
                                    style={{cursor: 'pointer', backgroundColor: '#f7fafc'}}
                                    required
                                />
                                <button 
                                    type="button" 
                                    className="admin-btn"
                                    onClick={() => setIsModalOpen(true)}
                                >
                                    선택
                                </button>
                            </div>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">문제 번호 (Index)</label>
                            <input 
                                name="index"
                                type="text"
                                value={formData.index}
                                onChange={handleChange}
                                className="admin-form-input"
                                placeholder="예: A, B, C..."
                                required
                            />
                        </div>

                        <div style={{display: 'flex', gap: '20px'}}>
                            <div className="admin-form-group" style={{flex: 1}}>
                                <label className="admin-form-label">배점 (Points)</label>
                                <input 
                                    name="points"
                                    type="number"
                                    value={formData.points}
                                    onChange={handleChange}
                                    className="admin-form-input"
                                    placeholder="0"
                                />
                            </div>
                            <div className="admin-form-group" style={{flex: 1}}>
                                <label className="admin-form-label">난이도 (Rating)</label>
                                <input 
                                    name="rating"
                                    type="number"
                                    value={formData.rating}
                                    onChange={handleChange}
                                    className="admin-form-input"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">문제 링크 (URL)</label>
                            <input 
                                name="url"
                                type="url"
                                value={formData.url}
                                onChange={handleChange}
                                className="admin-form-input"
                                placeholder="https://codeforces.com/..."
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">문제 설명 (한글)</label>
                            <textarea 
                                name="description_kr"
                                value={formData.description_kr}
                                onChange={handleChange}
                                className="admin-form-input"
                                rows={5}
                                placeholder="문제 설명을 입력하세요..."
                            />
                        </div>

                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                            <button type="button" className="admin-btn" style={{backgroundColor: '#718096'}} onClick={() => navigate(-1)}>
                                취소
                            </button>
                            <button type="submit" className="admin-btn">
                                문제 생성
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            {isModalOpen && (
                <ContestSelectionModal 
                    onClose={() => setIsModalOpen(false)}
                    onSelect={handleContestSelect}
                />
            )}
        </div>
    );
};

export default CreateProblem;
