import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { problemApi, Problem } from '../api/problemApi';
import './Contest.css';

const Contest = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isDebugMode = id === '1234567890';
    
    // 1시간 45분 30초 = 6330초 (임시 타이머)
    const [remainingSeconds, setRemainingSeconds] = useState(6330);
    const [activeTab, setActiveTab] = useState('problems');
    const [problems, setProblems] = useState<Problem[]>([]);

    useEffect(() => {
        if (isDebugMode) {
            console.log("Debug Mode Activated: You are viewing the contest with ID 1234567890");
        }
    }, [isDebugMode]);

    useEffect(() => {
        if (id) {
            const fetchProblems = async () => {
                try {
                    const data = await problemApi.getProblemsByContest(id);
                    // 인덱스 기준 정렬 (A, B, C, D...)
                    const sortedData = data.sort((a, b) => a.index.localeCompare(b.index));
                    setProblems(sortedData);
                } catch (error) {
                    console.error("Failed to fetch problems:", error);
                }
            };
            fetchProblems();
        }
    }, [id]);

    useEffect(() => {
        const timerInterval = setInterval(() => {
            setRemainingSeconds(prev => {
                if (prev <= 0) {
                    clearInterval(timerInterval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerInterval);
    }, []);

    const openProblem = (problemId: number) => {
        navigate(`/problem/${problemId}`);
    };

    return (
        <div className="contest-page">
            <Navbar />
            
            

            <main className="contest-main">
                <header className="contest-header">
                <h1 className="contest-title">{`Contest #${id}`}</h1>
                <div className="contest-timer">
                    {(() => {
                        if (remainingSeconds <= 0) return "Contest Ended";
                        const h = Math.floor(remainingSeconds / 3600);
                        const m = Math.floor((remainingSeconds % 3600) / 60);
                        const s = remainingSeconds % 60;
                        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                    })()}
                </div>
            </header>
                <nav className="tabs">
                    <div 
                        className={`tab-item ${activeTab === 'problems' ? 'active' : ''}`}
                        onClick={() => setActiveTab('problems')}
                    >
                        문제 (Problems)
                    </div>
                    <div 
                        className={`tab-item ${activeTab === 'standings' ? 'active' : ''}`}
                        onClick={() => alert('스코어보드(Standings) 페이지로 이동합니다. (구현 예정)')}
                    >
                        스코어보드
                    </div>
                    <div 
                        className={`tab-item ${activeTab === 'status' ? 'active' : ''}`}
                        onClick={() => alert('제출 현황(Submissions) 페이지로 이동합니다. (구현 예정)')}
                    >
                        제출 현황
                    </div>
                </nav>

                <div className="problem-container">
                    <table className="contest-table">
                        <thead>
                            <tr>
                                <th style={{width: '10%'}}>#</th>
                                <th style={{width: '60%'}}>문제명 (Problem Name)</th>
                                <th style={{width: '15%'}}>점수 (Points)</th>
                                <th style={{width: '15%'}}>상태 (Status)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {problems.map(problem => (
                                <tr key={problem.id}>
                                    <td>{problem.index}</td>
                                    <td>
                                        <div className="problem-link" onClick={() => openProblem(problem.id)}>
                                            {problem.index}. {problem.description_kr || "No Description"}
                                        </div>
                                    </td>
                                    <td>{problem.points ?? '-'}</td>
                                    <td>
                                        {/* Status column initially empty as requested */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};


export default Contest;
