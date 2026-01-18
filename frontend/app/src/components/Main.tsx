import { useState, useEffect } from 'react';
import { contestApi, Contest } from '../api/contestApi';
import './Main.css';

const Main = () => {
    // Timer Logic for Countdown
    const [contests, setContests] = useState<Contest[]>([]);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const results = await contestApi.getAllContests();
                setContests(results);
                console.log("Fetched contests:", results);
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

    // Logic for Past Contest Table
    const pastContests = contests
        .filter(c => new Date(c.end_time) < now)
        .sort((a, b) => new Date(b.end_time).getTime() - new Date(a.end_time).getTime())
        .slice(0, 3);
    
    // Fill empty rows if less than 3
    const tableRows = [...pastContests];
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

    return (
        <main className="main-container">
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

                            <button className="btn-hero" onClick={handleDummyClick}>
                                {heroStatus === 'running' ? '참가하기' : '참가 등록 대기중'}
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
                        <span className="card-title">📚 Past Contest History</span>
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
                            {tableRows.map((contest, index) => (
                                <tr key={contest ? contest.id : `empty-${index}`}>
                                    {contest ? (
                                        <>
                                            <td><strong>{contest.name}</strong></td>
                                            <td style={{ color: 'var(--text-sub)' }}>{new Date(contest.start_time).toLocaleTimeString()}</td>
                                            <td>{formatDate(contest.end_time)}</td>
                                            <td><span className="status-badge status-done">종료됨</span></td>
                                            <td><button className="btn-outline btn" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={handleDummyClick}>결과 보기</button></td>
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
                            ))}
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
                    <div className="rank-item">
                        <span>1. <strong>Genius_Park</strong></span>
                        <span className="rank-high">1850</span>
                    </div>
                    <div className="rank-item">
                        <span>2. <strong>Algorithm_King</strong></span>
                        <span className="rank-high">1720</span>
                    </div>
                    <div className="rank-item">
                        <span>3. <strong>Django_Master</strong></span>
                        <span>1605</span>
                    </div>
                    <div className="rank-item" style={{ background: '#ebf8ff', margin: '5px -10px', padding: '10px' }}>
                        <span>12. <strong>Me (Taegeon)</strong></span>
                        <span>1400</span>
                    </div>
                </div>

                <div className="sidebar-section">
                    <h3 style={{ marginTop: 0, fontSize: '1rem' }}>🖥 System Status</h3>
                    <div style={{ fontSize: '0.85rem', lineHeight: 1.8 }}>
                        <div><span style={{ color: 'green' }}>●</span> API Gateway: <strong>Online</strong></div>
                        <div><span style={{ color: 'green' }}>●</span> Crawler: <strong>Standby</strong></div>
                        <div><span style={{ color: 'green' }}>●</span> DB Connection: <strong>Stable</strong></div>
                    </div>
                </div>
            </aside>
        </main>
    );
};

export default Main;
