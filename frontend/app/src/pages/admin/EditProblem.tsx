import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { problemApi } from '../../api/problemApi';
import './Admin.css';

const EditProblem = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Problem ID
    const [isLoading, setIsLoading] = useState(true);
    
    const [formData, setFormData] = useState({
        id: -1,
        contest: 0,
        index: '', // e.g. 'A', 'B'
        points: 0,
        rating: 0,
        url: '', // Problem Link
        description_kr: ''
    });

    useEffect(() => {
        if (id) {
            const fetchProblem = async () => {
                try {
                    const data = await problemApi.getProblem(id);
                    setFormData(prev => ({
                        ...prev,
                        id: data.id,
                        contest: data.contest,
                        index: data.index,
                        points: data.points,
                        rating: data.rating,
                        url: data.url,
                        description_kr: data.description_kr
                    }));
                } catch (error) {
                    console.error("Failed to fetch problem:", error);
                    alert("문제를 불러오는데 실패했습니다.");
                    navigate(-1);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchProblem();
        }
    }, [id, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            await problemApi.updateProblem(formData.id, {
                index: formData.index,
                points: Number(formData.points),
                rating: Number(formData.rating),
                url: formData.url,
                description_kr: formData.description_kr
            });
            alert('문제가 성공적으로 수정되었습니다.');
            navigate(-1); // Go back to contest edit page
        } catch (error: any) {
            console.error('Failed to update problem:', error);
            alert('문제 수정에 실패했습니다.');
        }
    };

    if (isLoading) {
        return (
            <div>
                <Navbar />
                <div className="admin-page-container">
                    <div className="loading-text">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className="admin-page-container">
                <div className="admin-card">
                    <h1 className="admin-header">문제 수정 (Admin)</h1>
                    
                    <form onSubmit={handleSubmit}>
                        <div style={{marginBottom: '20px', color: '#4a5568'}}>
                            Contest ID: {formData.contest} / Problem ID: {formData.id}
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
                                수정사항 저장
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProblem;
