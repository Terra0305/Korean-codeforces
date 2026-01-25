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
        name: '', // Problem Name
        points: 0,
        rating: 0,
        url: '', // Problem Link
        description_kr: ''
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
                        name: data.name,
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

    const handleDelete = async () => {
        try {
            await problemApi.deleteProblem(formData.id);
            alert('문제가 성공적으로 삭제되었습니다.');
            navigate('/edit-contest');
        } catch (error: any) {
            console.error('Failed to delete problem:', error);
            alert('문제 삭제에 실패했습니다.');
            setIsDeleteModalOpen(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            await problemApi.updateProblem(formData.id, {
                index: formData.index,
                name: formData.name,
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
            <div className={`admin-page-container ${isDeleteModalOpen ? 'blur-background' : ''}`}>
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

                        <div className="admin-form-group">
                            <label className="admin-form-label">문제 이름 (Name)</label>
                            <input 
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                className="admin-form-input"
                                placeholder="예: 최소 사각형 만들기"
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

                        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '30px'}}>
                            <button 
                                type="button" 
                                className="admin-btn" 
                                style={{backgroundColor: '#e53e3e'}} 
                                onClick={() => setIsDeleteModalOpen(true)}
                            >
                                삭제
                            </button>

                            <div style={{display: 'flex', gap: '10px'}}>
                                <button type="button" className="admin-btn" style={{backgroundColor: '#718096'}} onClick={() => navigate(-1)}>
                                    취소
                                </button>
                                <button type="submit" className="admin-btn">
                                    수정사항 저장
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

             {/* Delete Confirmation Modal */}
             {isDeleteModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{maxWidth: '400px', textAlign: 'center'}}>
                        <h2 style={{color: '#e53e3e', marginBottom: '15px'}}>문제 삭제</h2>
                        <p style={{marginBottom: '20px', color: '#4a5568'}}>
                            정말로 이 문제를 삭제하시겠습니까?<br/>
                            삭제된 데이터는 복구할 수 없습니다.
                        </p>
                        <div style={{display: 'flex', justifyContent: 'center', gap: '15px'}}>
                            <button 
                                className="admin-btn" 
                                style={{backgroundColor: '#e53e3e'}}
                                onClick={handleDelete}
                            >
                                예, 삭제합니다
                            </button>
                            <button 
                                className="admin-btn" 
                                style={{backgroundColor: '#718096'}}
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                아니오
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                .blur-background {
                    filter: blur(5px);
                    transition: filter 0.3s ease;
                }
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    width: 90%;
                    max-width: 500px;
                }
            `}</style>
        </div>
    );
};

export default EditProblem;
