import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import ContestSelectionModal from '../../components/admin/ContestSelectionModal';
import { problemApi, Problem } from '../../api/problemApi';
import './Admin.css';

const EditContest = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContest, setSelectedContest] = useState<{id: number, name: string} | null>(null);
    const [problems, setProblems] = useState<Problem[]>([]);
    
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

    return (
        <div>
            <Navbar />
            <div className="admin-page-container">
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
                            <div style={{marginTop: '20px', textAlign: 'right'}}>
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
        </div>
    );
};

export default EditContest;
