import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import ContestSelectionModal from '../../components/admin/ContestSelectionModal';
import { problemApi, Problem } from '../../api/problemApi';
import { contestApi } from '../../api/contestApi';
import './Admin.css';

const EditContest = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContest, setSelectedContest] = useState<{id: number, name: string} | null>(null);
    const [problems, setProblems] = useState<Problem[]>([]);
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteProblemsChecked, setDeleteProblemsChecked] = useState(false);

    // Function to fetch problems for a selected contest
    const fetchProblems = async (contestId: string) => {
        try {
            const data = await problemApi.getProblemsByContest(contestId);
            // Sort by index
            const sortedData = data.sort((a, b) => a.index.localeCompare(b.index));
            setProblems(sortedData);
        } catch (error) {
            console.error("Failed to fetch problems:", error);
            setProblems([]);
        }
    };

    const handleContestSelect = (contestId: number, contestName: string) => {
        setSelectedContest({ id: contestId, name: contestName });
        fetchProblems(contestId.toString());
        setIsModalOpen(false);
    };

    const handleProblemClick = (problemId: number) => {
        navigate(`/admin/edit-problem/${problemId}`);
    };

    const handleDeleteContest = async () => {
        if (!selectedContest) return;
        
        try {
            if (deleteProblemsChecked) {
                // Delete all problems sequentially
                for (const problem of problems) {
                    await problemApi.deleteProblem(problem.id);
                }
            }
            
            // Delete contest
            await contestApi.deleteContest(selectedContest.id);
            
            alert('대회가 성공적으로 삭제되었습니다.');
            // Reset state
            setSelectedContest(null);
            setProblems([]);
            setIsDeleteModalOpen(false);
            setDeleteProblemsChecked(false);
        } catch (error) {
            console.error("Failed to delete contest:", error);
            alert('대회 삭제에 실패했습니다.');
        }
    };

    return (
        <div>
            <Navbar />
            <div className={`admin-page-container ${isDeleteModalOpen ? 'blur-background' : ''}`}>
                <div className="admin-card">
                    <h1 className="admin-header">대회 수정 (Admin)</h1>
                    
                    <div className="admin-form-group">
                        <label className="admin-form-label">대회 선택</label>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <input 
                                type="text"
                                value={selectedContest ? `${selectedContest.name} (ID: ${selectedContest.id})` : ''}
                                placeholder="대회를 선택해주세요"
                                className="admin-form-input"
                                readOnly
                                onClick={() => setIsModalOpen(true)}
                                style={{cursor: 'pointer', backgroundColor: '#f7fafc'}}
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

                    {selectedContest && (
                        <div style={{marginTop: '30px'}}>
                            <h2 style={{fontSize: '1.2rem', color: '#2d3748', marginBottom: '15px'}}>
                                문제 목록 (Problems)
                            </h2>
                            {problems.length === 0 ? (
                                <p style={{color: '#718096'}}>등록된 문제가 없습니다.</p>
                            ) : (
                                <table className="admin-table" style={{width: '100%', borderCollapse: 'collapse'}}>
                                    <thead>
                                        <tr style={{backgroundColor: '#f7fafc', borderBottom: '2px solid #edf2f7'}}>
                                            <th style={{padding: '12px', textAlign: 'left', width: '10%'}}>#</th>
                                            <th style={{padding: '12px', textAlign: 'left'}}>문제명</th>
                                            <th style={{padding: '12px', textAlign: 'left', width: '15%'}}>배점</th>
                                            <th style={{padding: '12px', textAlign: 'left', width: '15%'}}>관리</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {problems.map(problem => (
                                            <tr key={problem.id} style={{borderBottom: '1px solid #edf2f7'}}>
                                                <td style={{padding: '12px'}}>{problem.index}</td>
                                                <td style={{padding: '12px', fontWeight: 'bold'}}>{problem.index}. {problem.description_kr || "설명 없음"}</td>
                                                <td style={{padding: '12px'}}>{problem.points}</td>
                                                <td style={{padding: '12px'}}>
                                                    <button 
                                                        className="admin-btn-small"
                                                        onClick={() => handleProblemClick(problem.id)}
                                                        style={{
                                                            padding: '4px 10px',
                                                            fontSize: '0.8rem',
                                                            backgroundColor: '#3182ce',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        수정
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            <div style={{marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <button 
                                    className="admin-btn" 
                                    style={{backgroundColor: '#e53e3e'}}
                                    onClick={() => setIsDeleteModalOpen(true)}
                                >
                                    대회 삭제
                                </button>
                                <button 
                                    className="admin-btn" 
                                    onClick={() => navigate('/admin/create-problem')}
                                    style={{fontSize: '0.9rem'}}
                                >
                                    + 새 문제 추가
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
            
            {isModalOpen && (
                <ContestSelectionModal 
                    onClose={() => setIsModalOpen(false)}
                    onSelect={handleContestSelect}
                />
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{maxWidth: '450px', textAlign: 'center'}}>
                        <h2 style={{color: '#e53e3e', marginBottom: '15px'}}>대회 삭제</h2>
                        <p style={{marginBottom: '20px', color: '#4a5568'}}>
                            정말로 이 대회를 삭제하시겠습니까?<br/>
                            삭제된 데이터는 복구할 수 없습니다.
                        </p>
                        
                        <div style={{marginBottom: '25px', textAlign: 'left', backgroundColor: '#fff5f5', padding: '15px', borderRadius: '6px', border: '1px solid #feb2b2'}}>
                            <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#c53030', fontWeight: 'bold'}}>
                                <input 
                                    type="checkbox" 
                                    checked={deleteProblemsChecked}
                                    onChange={(e) => setDeleteProblemsChecked(e.target.checked)}
                                    style={{marginRight: '10px', width: '18px', height: '18px'}}
                                />
                                종속된 문제들 제거 ({problems.length}개)
                            </label>
                            <p style={{marginTop: '5px', fontSize: '0.85rem', color: '#e53e3e'}}>
                                * 체크 시, 대회에 속한 모든 문제가 함께 영구 삭제됩니다.
                            </p>
                        </div>

                        <div style={{display: 'flex', justifyContent: 'center', gap: '15px'}}>
                            <button 
                                className="admin-btn" 
                                style={{backgroundColor: '#e53e3e'}}
                                onClick={handleDeleteContest}
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

export default EditContest;
