import { useState, useEffect } from 'react';
import client from '../api/client';
import './Main.css';

interface Contest {
    id: number;
    name: string;
    start_time: string;
    end_time: string;
}

const Main = () => {
    // Timer Logic for Countdown
    const [timeLeft, setTimeLeft] = useState(4 * 3600 + 12 * 60 + 59); // Example: 4h 12m 59s
    const [contests, setContests] = useState<Contest[]>([]);

    useEffect(() => {
        const fetchContests = async () => {
            try {
                // User asked for /api/contests/contests
                const response = await client.get('/api/contests/contests/');
                setContests(response.data.results);
                console.log("Fetched contests:", response.data.results);
            } catch (error) {
                console.error("Failed to fetch contests:", error);
            }
        };
        fetchContests();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatCountdown = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const handleDummyClick = (e: React.MouseEvent) => {
        e.preventDefault();
        // Canned response/action as requested
    };

    return (
        <main className="main-container">
            <section>
                <div className="hero-banner">
                    <div className="hero-tag">Coming Soon</div>
                    <h1 className="hero-title">제 12회 CF-KR 정기 가상 대회</h1>
                    
                    <div className="hero-secret-info">
                        <span style={{ fontSize: '1.5rem' }}>🔒</span>
                        <span>Target Round: </span>
                        <span className="blur-text">Codeforces Round #991 (Div. 2)</span>
                        <span style={{ fontSize: '0.8rem', opacity: 0.8, marginLeft: '10px' }}>(Hidden)</span>
                    </div>

                    <div className="hero-timer">
                        Starts in: <span id="countdown">{formatCountdown(timeLeft)}</span>
                    </div>

                    <button className="btn-hero" onClick={handleDummyClick}>
                        참가 등록 대기중
                    </button>
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
                                <th>Original Source</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>제 11회 CF-KR 정기 대회</strong></td>
                                <td style={{ color: 'var(--text-sub)' }}>CF Round #988</td>
                                <td>2025. 11. 15</td>
                                <td><span className="status-badge status-done">종료됨</span></td>
                                <td><button className="btn-outline btn" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={handleDummyClick}>결과 보기</button></td>
                            </tr>
                            <tr>
                                <td><strong>제 10회 CF-KR 정기 대회</strong></td>
                                <td style={{ color: 'var(--text-sub)' }}>Global Round 40</td>
                                <td>2025. 11. 10</td>
                                <td><span className="status-badge status-done">종료됨</span></td>
                                <td><button className="btn-outline btn" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={handleDummyClick}>결과 보기</button></td>
                            </tr>
                            <tr>
                                <td><strong>제 9회 특별 모의고사</strong></td>
                                <td style={{ color: 'var(--text-sub)' }}>Edu Round 170</td>
                                <td>2025. 10. 28</td>
                                <td><span className="status-badge status-done">종료됨</span></td>
                                <td><button className="btn-outline btn" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={handleDummyClick}>결과 보기</button></td>
                            </tr>
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
