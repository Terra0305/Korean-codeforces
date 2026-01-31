import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contestApi, Contest } from '../api/contestApi';
import axios from 'axios';
import client from '../api/client';
import JoinContestModal from './user/JoinContestModal';
import './Main.css';

const Main = () => {
    const navigate = useNavigate();
    // Timer Logic for Countdown
    const [contests, setContests] = useState<Contest[]>([]);
    const [now, setNow] = useState(new Date());
    const [systemStatus, setSystemStatus] = useState<any>(null);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [registerContest, setRegisterContest] = useState<Contest | null>(null);
    const [topRankers, setTopRankers] = useState<any[]>([]);

    useEffect(() => {
        const fetchRankers = async () => {
            try {
                // Fetch profiles directly using axios based on USER request
                const response = await client.get('/api/users/profile/');
                const profiles = response.data.results || response.data; // Handle pagination if present or direct list
                
                // Ensure profile has necessary fields and sort by elo_rating
                const sorted = profiles
                    .filter((p: any) => p.user_username) // Ensure username exists
                    .sort((a: any, b: any) => b.elo_rating - a.elo_rating)
                    .slice(0, 4);
                
                setTopRankers(sorted);
            } catch (error) {
                console.error("Failed to fetch rankers:", error);
            }
        };
        fetchRankers();
    }, []);

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const response = await axios.get(import.meta.env.VITE_API_BASE_URL + '/api/health/', {
                    headers: {
                        'Accept': 'application/json',
                    }
                });
                setSystemStatus(response.data);
            } catch (error) {
                console.error("Health check failed:", error);
                // Keep previous status or set to specific error state if desired
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const results = await contestApi.getAllContests();
                setContests(results);
            } catch (error) {
                console.error("Failed to fetch contests:", error);
            }
        };
        fetchContests();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Logic for Hero Banner
    let heroContest: Contest | null = null;
    let heroStatus: 'coming' | 'running' | 'none' = 'none';

    // 1. Check for running contests
    const runningContest = contests.find(c => {
        const start = new Date(c.start_time);
        const end = new Date(c.end_time);
        return now >= start && now < end;
    });

    // 2. Check for upcoming contests
    const upcomingContests = contests
        .filter(c => new Date(c.start_time) > now)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    
    if (runningContest) {
        heroContest = runningContest;
        heroStatus = 'running';
    } else if (upcomingContests.length > 0) {
        heroContest = upcomingContests[0];
        heroStatus = 'coming';
    }

    // Timer Display Logic
    const getTimerDisplay = () => {
        if (!heroContest) return "00:00:00";
        
        const target = heroStatus === 'running' 
            ? new Date(heroContest.end_time) 
            : new Date(heroContest.start_time);
            
        const diff = Math.floor((target.getTime() - now.getTime()) / 1000);
        
        if (diff < 0) return "00:00:00";

        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // Logic for Contest Table (Show latest 3 contests regardless of status)
    const recentContests = contests
        .sort((a, b) => new Date(b.end_time).getTime() - new Date(a.end_time).getTime())
        .slice(0, 3);
    
    // Fill empty rows if less than 3
    const tableRows = [...recentContests];
    while (tableRows.length < 3) {
        tableRows.push(null as any);
    }

    const handleDummyClick = (e: React.MouseEvent) => {
        e.preventDefault();
        // Canned response/action as requested
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`;
    };

    const handleRegisterClick = (contest: Contest) => {
        setRegisterContest(contest);
        setIsRegisterModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsRegisterModalOpen(false);
        setRegisterContest(null);
    };

    const getContestStatus = (contest: Contest) => {
        const start = new Date(contest.start_time);
        const end = new Date(contest.end_time);

        if (now < start) return { text: '예정', className: 'status-badge status-upcoming', style: { background: '#ebf8ff', color: '#2b6cb0' } };
        if (now >= start && now < end) return { text: '진행중', className: 'status-badge status-running', style: { background: '#c6f6d5', color: '#2f855a' } };
        return { text: '종료됨', className: 'status-badge status-done', style: { background: '#edf2f7', color: '#4a5568' } };
    };

    return (
        <>
            <main className={`main-container ${isRegisterModalOpen ? 'blur-background' : ''}`}>
            <section>
                <div className="hero-banner">
                    {heroContest ? (
                        <>
                            <div className="hero-tag">
                                {heroStatus === 'running' ? 'In Progress' : 'Coming Soon'}
                            </div>
                            <h1 className="hero-title">{heroContest.name}</h1>
                            
                            <div className="hero-secret-info">
                                <span style={{ fontSize: '1.5rem' }}>🔒</span>
                                <span>Target Round: </span>
                                <span className="blur-text">Codeforces Round #991 (Div. 2)</span>
                                <span style={{ fontSize: '0.8rem', opacity: 0.8, marginLeft: '10px' }}>(Hidden)</span>
                            </div>

                            <div className="hero-timer">
                                {heroStatus === 'running' ? 'Ends in: ' : 'Starts in: '}
                                <span id="countdown">{getTimerDisplay()}</span>
                            </div>

                            <button className="btn-hero" onClick={() => handleRegisterClick(heroContest!)}>
                                {heroStatus === 'running' ? '참가하기' : '참가 등록'}
                            </button>
                        </>
                    ) : (
                        <div style={{padding: '2rem'}}>
                            <h1 className="hero-title">아직 예정된 대회가 없습니다</h1>
                            <p>새로운 대회가 곧 등록될 예정입니다.</p>
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">📚 Recent Contests</span>
                        <button className="btn-outline btn" style={{ fontSize: '0.8rem' }} onClick={handleDummyClick}>View All</button>
                    </div>
                    
                    <table className="main-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40%' }}>Contest Name</th>
                                <th>Start Time</th>
                                <th>Date (End)</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map((contest, index) => {
                                const status = contest ? getContestStatus(contest) : null;
                                return (
                                <tr key={contest ? contest.id : `empty-${index}`}>
                                    {contest && status ? (
                                        <>
                                            <td><strong>{contest.name}</strong></td>
                                            <td style={{ color: 'var(--text-sub)' }}>{new Date(contest.start_time).toLocaleTimeString()}</td>
                                            <td>{formatDate(contest.end_time)}</td>
                                            <td>
                                                <span className={status.className} style={status.style}>
                                                    {status.text}
                                                </span>
                                            </td>
                                            <td>
                                                <button 
                                                    className="btn-outline btn" 
                                                    style={{ padding: '4px 10px', fontSize: '0.8rem' }} 
                                                    onClick={() => navigate(`/contest/${contest.id}`)}
                                                >
                                                    대회 이동
                                                </button>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td><span style={{color: '#cbd5e0'}}>-</span></td>
                                            <td>-</td>
                                            <td>-</td>
                                            <td>-</td>
                                            <td>-</td>
                                        </>
                                    )}
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">📊 My Performance Analysis</span>
                    </div>
                    <div style={{ height: '150px', background: '#edf2f7', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#a0aec0', border: '2px dashed #cbd5e0' }}>
                        [Interactive Elo Graph Area]
                    </div>
                </div>
            </section>

                <aside>
                <div className="sidebar-section">
                    <h3 style={{ marginTop: 0 }}>🏆 Top Rankers</h3>
                    {topRankers.length > 0 ? (
                        topRankers.map((ranker, index) => (
                            <div key={ranker.id || index} className="rank-item" style={index === 0 ? { borderBottom: '2px solid #ecc94b' } : {}}>
                                <span>{index + 1}. <strong>{ranker.user_username}</strong></span>
                                <span className={index < 3 ? "rank-high" : ""}>{ranker.elo_rating}</span>
                            </div>
                        ))
                    ) : (
                        <div style={{color: '#a0aec0', fontSize: '0.9rem'}}>No ranking data</div>
                    )}
                </div>

                <div className="sidebar-section">
                    <h3 style={{ marginTop: 0, fontSize: '1rem' }}>🖥 System Status</h3>
                    <div style={{ fontSize: '0.85rem', lineHeight: 1.8 }}>
                        {systemStatus ? (
                            Object.entries(systemStatus).map(([key, value]) => (
                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                                        <span style={{ color: value === 'working' ? 'green' : 'red', marginRight: '8px' }}>●</span>
                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }} title={key}>
                                            {key}
                                        </span>
                                    </div>
                                    <strong>{value === 'working' ? 'Online' : 'Error'}</strong>
                                </div>
                            ))
                        ) : (
                            <div style={{ color: '#718096', fontStyle: 'italic' }}>Checking status...</div>
                        )}
                    </div>
                </div>
            </aside>
        </main>
            {isRegisterModalOpen && registerContest && (
                <JoinContestModal 
                    isOpen={isRegisterModalOpen} 
                    onClose={handleCloseModal} 
                    contest={registerContest} 
                />
            )}
        </>
    );
};

export default Main;
