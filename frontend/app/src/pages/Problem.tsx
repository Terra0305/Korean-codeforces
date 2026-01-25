import React, { useEffect, useState } from 'react';
import './Problem.css';
import { useNavigate, useParams } from 'react-router-dom';
import { problemApi, Problem as ProblemType } from '../api/problemApi';
import { contestApi, Contest as ContestType } from '../api/contestApi';
import { useAuth } from '../context/AuthContext';

const Problem = () => {
    const navigate = useNavigate();
    const { contestId, problemId } = useParams();
    const { user } = useAuth();
    const [problem, setProblem] = useState<ProblemType | null>(null);
    const [contest, setContest] = useState<ContestType | null>(null);
    const [timerText, setTimerText] = useState("Loading...");
    const [userStatus, setUserStatus] = useState<{ type: string, text: string } | null>(null);

    // Fetch Problem
    useEffect(() => {
        if (contestId && problemId) {
            const fetchProblem = async () => {
                try {
                    const data = await problemApi.getProblemDetail(contestId, problemId);
                    setProblem(data);
                } catch (error) {
                    console.error("Failed to fetch problem:", error);
                }
            };
            fetchProblem();
        }
    }, [contestId, problemId]);

    // Fetch Contest
    useEffect(() => {
        if (contestId) {
            const fetchContest = async () => {
                try {
                    const data = await contestApi.getContestDetail(contestId);
                    setContest(data);
                } catch (error) {
                    console.error("Failed to fetch contest:", error);
                }
            };
            fetchContest();
        }
    }, [contestId]);

    // Fetch User Status
    useEffect(() => {
        if (!contestId || !problem || !user) return;

        const fetchStatus = async () => {
            try {
                // Fetch participants to find current user
                // Note: Real implementation might need a dedicated 'my-status' API to avoid fetching all participants.
                // But following the user's request to use getParticipants:
                const participants = await contestApi.getParticipants(contestId);
                const me = participants.find((p: any) => p.user === user.username);
                
                if (!me) {
                    setUserStatus(null);
                    return;
                }

                // Fetch all problems to identify current problem's index
                const problems = await problemApi.getProblemsByContest(contestId);
                const sortedProblems = problems.sort((a, b) => a.index.localeCompare(b.index));
                const myProblemIndex = sortedProblems.findIndex(p => p.index === problem.index);

                if (myProblemIndex === -1) return;

                // Parse status
                const parts = me.problem_status.split(':');
                if (myProblemIndex >= parts.length) return;
                
                const stat = parts[myProblemIndex];
                if (!stat) {
                    setUserStatus(null);
                    return;
                }

                if (stat.startsWith('+')) {
                    const tries = stat.length > 1 ? stat.substring(1) : "1"; 
                    setUserStatus({ type: 'AC', text: `Accepted\n${tries}회 제출` });
                } else if (stat.startsWith('-')) {
                    const tries = stat.length > 1 ? stat.substring(1) : "1";
                    setUserStatus({ type: 'WA', text: `Not Accepted\n${tries}회 제출` });
                } else {
                    setUserStatus(null);
                }

            } catch (error) {
                console.error("Failed to fetch status:", error);
            }
        };

        fetchStatus();
    }, [contestId, problem, user]);

    // Timer Logic
    useEffect(() => {
        if (!contest) return;

        const updateTimer = () => {
            const now = new Date();
            const start = new Date(contest.start_time);
            const end = new Date(contest.end_time);

            if (now < start) {
                // Before start
                const durationSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);
                setTimerText(formatSeconds(durationSeconds));
            } else if (now > end) {
                // After end
                setTimerText("대회가 종료되었습니다.");
            } else {
                // Ongoing
                const remaining = Math.floor((end.getTime() - now.getTime()) / 1000);
                setTimerText(formatSeconds(remaining));
            }
        };

        const formatSeconds = (sec: number) => {
            if (sec < 0) return "00:00:00";
            const h = Math.floor(sec / 3600);
            const m = Math.floor((sec % 3600) / 60);
            const s = sec % 60;
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        };

        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);

        return () => clearInterval(intervalId);
    }, [contest]);

    const openContest = () => {
        navigate(`/contest/${contestId}`);
    }

    const handleDummyClick = (e: React.MouseEvent) => {
        e.preventDefault();
        // Canned response/action as requested
    };

    const handleCodeforcesSubmit = () => {
        if (contest) {
            window.open(`https://codeforces.com/contest/${contest.id}/submit`, '_blank', 'noopener,noreferrer');
        }
    };

    if (!problem) {
        return <div className="problem-page-body" style={{display: 'flex', justifyContent:'center', alignItems:'center'}}>Loading...</div>;
    }

    return (
        <div className="problem-page-body">
            <header className="problem-header">
                <a href="#" className="back-btn" onClick={openContest}>← 문제 목록으로 돌아가기</a>
                <div className="problem-timer">{timerText}</div>
                <div style={{fontWeight: 600}}>{contest ? contest.name : "Loading..."}</div>
            </header>

            <div className="split-container">
                <div className="left-panel">
                    <h1>{problem.index}. {problem.name}</h1>
                    <div className="problem-meta">
                        시간 제한: 1.0초 &nbsp;|&nbsp; 메모리 제한: 256MB &nbsp;|&nbsp; 입력: 표준 입력 &nbsp;|&nbsp; 출력: 표준 출력
                    </div>

                    <div style={{whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#2d3748'}}>
                        {problem.description_kr}
                    </div>
                    
                    <p style={{marginTop: '50px', color: '#718096', fontSize: '0.8rem'}}>
                        * 본 문제는 Codeforces의 문제를 학습 목적으로 번역한 것입니다. <br />
                        Original Problem: <a href="#" style={{color:'#3182ce'}} onClick={handleDummyClick}>Codeforces {problem.index}</a>
                    </p>
                </div>

                <div className="right-panel">
                    
                    <div className="cf-card">
                        <h2 style={{marginTop:0, fontSize:'1.2rem'}}>Codeforces Linkage</h2>
                        <p style={{fontSize:'0.9rem', color:'#718096', marginBottom: '20px'}}>
                            이곳에서 답안을 제출하면 Codeforces Virtual Contest에 자동으로 반영됩니다.
                        </p>
                        
                        <button className="btn-submit" onClick={handleCodeforcesSubmit}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                            Codeforces에서 제출하기
                        </button>
                    </div>

                    <div className="cf-card" style={{flex: 1}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                            <h3 style={{margin:0, border:'none', fontSize:'1rem'}}>Real-time Status</h3>
                            <span style={{fontSize:'0.8rem', background:'#edf2f7', padding:'2px 6px', borderRadius:'4px'}}>Auto-refreshing</span>
                        </div>

                        <div className="status-box" id="status-container" style={{
                            backgroundColor: userStatus?.type === 'AC' ? '#c6f6d5' : userStatus?.type === 'WA' ? '#fed7d7' : '#f7fafc',
                            color: userStatus?.type === 'AC' ? '#2f855a' : userStatus?.type === 'WA' ? '#c53030' : '#718096',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '100px',
                            borderRadius: '8px',
                            transition: 'all 0.3s ease'
                        }}>
                             {userStatus ? (
                                <div style={{textAlign: 'center', whiteSpace: 'pre-wrap', fontWeight: 'bold', fontSize: '1.1rem'}}>
                                    {userStatus.text}
                                </div>
                            ) : (
                                <div style={{textAlign:'center', padding: '20px'}}>
                                    아직 제출 이력이 없습니다.<br />
                                    위 버튼을 눌러 제출을 진행해주세요.
                                </div>
                            )}
                        </div>

                        <div style={{marginTop:'20px', fontSize:'0.75rem', color:'#a0aec0', fontFamily:'monospace'}}>
                            &gt; Connected to CF API (v.2.0)<br />
                            &gt; Fetching user status: OK<br />
                            &gt; Last Sync: <span id="sync-time">Just now</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Problem;
