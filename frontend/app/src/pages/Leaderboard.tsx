import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { problemApi, Problem } from '../api/problemApi';
import { contestApi, LeaderboardParticipant } from '../api/contestApi';
import './Leaderboard.css';

const Leaderboard = () => {
    const { id } = useParams(); // Contest ID
    const [problems, setProblems] = useState<Problem[]>([]);
    const [participants, setParticipants] = useState<LeaderboardParticipant[]>([]);
    const [isFrozen, setIsFrozen] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchLeaderboard = async (contestId: string) => {
        try {
            const leaderboardData = await contestApi.getLeaderboard(contestId);
            setIsFrozen(leaderboardData.is_frozen);
            
            const sortedParticipants = leaderboardData.participants.sort((a, b) => {
                if (a.total_score !== b.total_score) return b.total_score - a.total_score;
                return a.penalty - b.penalty;
            });
            setParticipants(sortedParticipants);
        } catch (error) {
            console.error("Failed to fetch leaderboard data:", error);
        }
    };

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    // Fetch Problems
                    const problemsData = await problemApi.getProblemsByContest(id);
                    const sortedProblems = problemsData.sort((a, b) => a.index.localeCompare(b.index));
                    setProblems(sortedProblems);

                    // Fetch Leaderboard
                    await fetchLeaderboard(id);

                    // Fetch contest details to set up freeze timer
                    const contestDetail = await contestApi.getContestDetail(id);
                    const endTime = new Date(contestDetail.end_time).getTime();
                    const freezeTime = endTime - 30 * 60 * 1000; // 30 mins before end
                    const now = new Date().getTime();

                    // If we are currently before the freeze time, set a timeout to trigger exactly at freeze time
                    if (now < freezeTime) {
                        const timeUntilFreeze = freezeTime - now;
                        timeoutRef.current = setTimeout(() => {
                            fetchLeaderboard(id);
                        }, timeUntilFreeze);
                    }
                } catch (error) {
                    console.error("Failed to fetch initialization data:", error);
                }
            };
            fetchData();
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [id]);
    
    const handleDummyClick = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    const getProblemResult = (statusString: string, index: number) => {
        if (!statusString) return null;
        const parts = statusString.split(':');
        if (index >= parts.length) return null;
        
        const stat = parts[index];
        if (!stat) return null;

        if (stat.startsWith('+')) {
            const tries = stat.length > 1 ? stat.substring(1) : "";
            return { type: 'ac', text: tries ? `+${tries}` : '+' };
        } else if (stat.startsWith('-')) {
            const tries = stat.length > 1 ? stat.substring(1) : "1";
            return { type: 'wa', text: `-${tries}` };
        }
        return null; // Empty or unknown
    };

    return (
        <div className={`card ${isFrozen ? 'frozen-board' : ''}`}>
            {isFrozen && (
                <div className="frozen-indicator">
                    ❄️ Scoreboard is Frozen ❄️
                </div>
            )}
            <table className="leaderboard-table">
                <thead>
                    <tr>
                        <th style={{width: '50px'}}>#</th>
                        <th>Who</th>
                        <th style={{width: '60px'}}>=</th>
                        <th style={{width: '80px'}}>Penalty</th>
                        {problems.map(prob => (
                            <th key={prob.id}>{prob.index}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {participants.map((p, rank) => (
                        <tr key={p.id}>
                            <td className={`rank-cell ${rank < 3 ? `rank-${rank + 1}` : ''}`}>
                                {rank + 1}
                            </td>
                            <td className="user-cell">
                                <span className="handle" onClick={handleDummyClick}>{p.user_username}</span>
                            </td>
                            <td className="score-cell">{p.total_score}</td>
                            <td>{p.penalty}</td>
                            
                            {problems.map((prob, idx) => {
                                const result = getProblemResult(p.problem_status, idx);
                                return (
                                    <td key={prob.id} className={`prob-cell ${result ? result.type : ''}`}>
                                        {result ? result.text : ''}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    {participants.length === 0 && (
                        <tr>
                            <td colSpan={4 + problems.length} style={{textAlign: 'center', padding: '20px'}}>
                                No participants found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Leaderboard;
