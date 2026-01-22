import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { problemApi, Problem } from '../api/problemApi';
import { contestApi } from '../api/contestApi';
import './Leaderboard.css';

interface Participant {
    id: number;
    user: string;
    score: number;
    penalty: number;
    problem_status: string;
}

const Leaderboard = () => {
    const { id } = useParams(); // Contest ID
    const [problems, setProblems] = useState<Problem[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);

    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                try {
                    // Fetch Problems
                    const problemsData = await problemApi.getProblemsByContest(id);
                    const sortedProblems = problemsData.sort((a, b) => a.index.localeCompare(b.index));
                    setProblems(sortedProblems);

                    // Fetch Participants
                    const participantsData = await contestApi.getParticipants(id);
                    // Sort participants by rank (score desc, penalty asc)
                    // Assuming API returns them or we sort here:
                    const sortedParticipants = participantsData.sort((a: Participant, b: Participant) => {
                        if (a.score !== b.score) return b.score - a.score;
                        return a.penalty - b.penalty;
                    });
                    setParticipants(sortedParticipants);
                } catch (error) {
                    console.error("Failed to fetch leaderboard data:", error);
                }
            };
            fetchData();
        }
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
        <div className="card">
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
                                <span className="handle" onClick={handleDummyClick}>{p.user}</span>
                            </td>
                            <td className="score-cell">{p.score}</td>
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
