import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { problemApi, Problem } from '../api/problemApi';
import { contestApi, Contest as ContestType } from '../api/contestApi';
import { useAuth } from '../context/AuthContext';
import ProblemSet from '../components/ProblemSet';
import Leaderboard from './Leaderboard';
import './Contest.css';

const Contest = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isDebugMode = id === '1234567890';
    
    const [activeTab, setActiveTab] = useState('problems');
    const [problems, setProblems] = useState<Problem[]>([]);
    const [contest, setContest] = useState<ContestType | null>(null);
    const [timerText, setTimerText] = useState("Loading...");
    const [statusMap, setStatusMap] = useState<Record<string, string>>({});

    // Fetch Contest Details
    useEffect(() => {
        if (id) {
            const fetchContest = async () => {
                try {
                    const data = await contestApi.getContestDetail(id);
                    setContest(data);
                } catch (error) {
                    console.error("Failed to fetch contest:", error);
                }
            };
            fetchContest();
        }
    }, [id]);

    useEffect(() => {
        if (isDebugMode) {
            console.log("Debug Mode Activated: You are viewing the contest with ID 1234567890");
        }
    }, [isDebugMode]);

    // Fetch Problems
    useEffect(() => {
        if (id) {
            const fetchProblems = async () => {
                try {
                    const data = await problemApi.getProblemsByContest(id);
                    const sortedData = data.sort((a, b) => a.index.localeCompare(b.index));
                    setProblems(sortedData);
                } catch (error) {
                    console.error("Failed to fetch problems:", error);
                }
            };
            fetchProblems();
        }
    }, [id]);
    // Fetch User Status
    useEffect(() => {
        if (!id || !user || problems.length === 0) return;

        const fetchStatus = async () => {
            try {
                // Warning: fetching all participants is not efficient for large contests
                const participants = await contestApi.getParticipants(id);
                const me = participants.find((p: any) => p.user === user.username);
                
                if (me) {
                    const newStatusMap: Record<string, string> = {};
                    const parts = me.problem_status.split(':');
                    
                    problems.forEach((prob, idx) => {
                        if (idx < parts.length) {
                             const stat = parts[idx];
                             if (stat.startsWith('+')) {
                                 newStatusMap[prob.index] = 'AC';
                             } else if (stat.startsWith('-')) {
                                 newStatusMap[prob.index] = 'WA';
                             }
                        }
                    });
                    setStatusMap(newStatusMap);
                    console.log(me);
                    console.log(newStatusMap);
                }
            } catch (error) {
                console.error("Failed to fetch user status:", error);
            }
        };
        fetchStatus();
    }, [id, user, problems]);

    // Timer Logic
    useEffect(() => {
        if (!contest) return;

        const updateTimer = () => {
            const now = new Date();
            const start = new Date(contest.start_time);
            const end = new Date(contest.end_time);

            if (now < start) {
                // Before start: Show total duration
                const durationSeconds = Math.floor((end.getTime() - start.getTime()) / 1000);
                setTimerText(formatSeconds(durationSeconds));
            } else if (now > end) {
                // After end
                setTimerText("대회가 종료되었습니다.");
            } else {
                // Ongoing: Show remaining time
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

        updateTimer(); // Initial call
        const intervalId = setInterval(updateTimer, 1000);

        return () => clearInterval(intervalId);
    }, [contest]);

    const openProblem = (problemId: number) => {
        navigate(`/contest/${id}/${problemId}`);
    };

    const openLeaderboard = () => {
        setActiveTab('standings');
    };

    return (
        <div className="contest-page">
            <Navbar />
            
            <main className="contest-main">
                <header className="contest-header">
                    <h1 className="contest-title">{contest ? contest.name : `Contest #${id}`}</h1>
                    <div className="contest-timer">
                        {timerText}
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
                        onClick={() => openLeaderboard()}
                    >
                        스코어보드
                    </div>
                </nav>

                {activeTab === 'problems' && (
                    <ProblemSet problems={problems} onProblemClick={openProblem} statusMap={statusMap} />
                )}
                {activeTab === 'standings' && (
                    <Leaderboard />
                )}
            </main>
        </div>
    );
};

export default Contest;
