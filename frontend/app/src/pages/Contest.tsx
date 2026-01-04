import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Contest.css';

interface Problem {
    id: string;
    name: string;
    points: number;
    status: 'AC' | 'Attempt' | 'None';
    attempts?: number;
    timeLimit: string;
    memoryLimit: string;
}

const Contest = () => {
    const { id } = useParams();
    const isDebugMode = id === '1234567890';
    
    // 1시간 45분 30초 = 6330초
    const [remainingSeconds, setRemainingSeconds] = useState(6330);
    const [activeTab, setActiveTab] = useState('problems');

    useEffect(() => {
        if (isDebugMode) {
            console.log("Debug Mode Activated: You are viewing the contest with ID 1234567890");
        }
    }, [isDebugMode]);

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



    const openProblem = (problemId: string) => {
        alert(`[문제 ${problemId} 번역본 보기]\n\n실제 구현 시 이 페이지에서 문제의 번역 전문을 보여줍니다.\n\n사용자는 번역본을 읽고 Codeforces Virtual Contest Submission 페이지로 이동하여 답안을 제출합니다.`);
    };

    const problems: Problem[] = [
        { id: 'A', name: 'A. 최소 사각형 만들기 (Minimizing Rectangle)', points: 500, status: 'AC', timeLimit: '1.0s', memoryLimit: '256MB' },
        { id: 'B', name: 'B. 문자열 균형 맞추기 (Balancing Strings)', points: 1000, status: 'Attempt', attempts: 3, timeLimit: '2.0s', memoryLimit: '512MB' },
        { id: 'C', name: 'C. 가장 긴 팰린드롬 경로 (Longest Palindrome Path)', points: 1500, status: 'None', timeLimit: '1.5s', memoryLimit: '256MB' },
        { id: 'D', name: 'D. 분할 정복 기반 수열 정렬 (Divide and Conquer Sort)', points: 2000, status: 'None', timeLimit: '3.0s', memoryLimit: '1024MB' },
    ];

    return (
        <div className="contest-page">
            <Navbar 
                contestTitle="제 12회 정기 가상 대회" 
                remainingTime={remainingSeconds} 
            />

            <main className="contest-main">
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
                                <th style={{width: '5%'}}>#</th>
                                <th style={{width: '45%'}}>문제명 (Problem Name)</th>
                                <th style={{width: '15%'}}>점수 (Points)</th>
                                <th style={{width: '15%'}}>상태 (Status)</th>
                                <th style={{width: '20%'}}>제한 (Constraints)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {problems.map(problem => (
                                <tr key={problem.id}>
                                    <td>{problem.id}</td>
                                    <td>
                                        <div className="problem-link" onClick={() => openProblem(problem.id)}>
                                            {problem.name}
                                        </div>
                                    </td>
                                    <td>{problem.points}</td>
                                    <td>
                                        {problem.status === 'AC' && (
                                            <span className="status status-ac">Accepted</span>
                                        )}
                                        {problem.status === 'Attempt' && (
                                            <>
                                                <span className="status status-attempt">Failed Attempts</span>
                                                <span className="status-attempts-count">{problem.attempts} Attempts</span>
                                            </>
                                        )}
                                        {problem.status === 'None' && (
                                            <span className="status status-none">Not Attempted</span>
                                        )}
                                    </td>
                                    <td>Time: {problem.timeLimit} / Memory: {problem.memoryLimit}</td>
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
