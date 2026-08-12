import { Problem } from "../api/problemApi";

interface ProblemSetProps {
    problems: Problem[];
    onProblemClick: (problemId: number) => void;
    statusMap: Record<string, string>; // e.g. { 'A': 'AC', 'B': 'WA' }
    startTime?: string;
}

const ProblemSet = ({ problems, onProblemClick, statusMap, startTime }: ProblemSetProps) => {
    const isStarted = !startTime || new Date() >= new Date(startTime);

    if (!isStarted) {
        return (
            <div className="problem-container" style={{textAlign: 'center', padding: '50px', color: '#718096', fontSize: '1.2rem', fontWeight: 600}}>
                대회 시작 전입니다.
            </div>
        );
    }

    return (
        <div className="problem-container">
            <table className="contest-table">
                <thead>
                    <tr>
                        <th style={{ width: '10%' }}>#</th>
                        <th style={{ width: '60%' }}>문제명 (Problem Name)</th>
                        <th style={{ width: '15%' }}>점수 (Points)</th>
                        <th style={{ width: '15%' }}>상태 (Status)</th>
                    </tr>
                </thead>
                <tbody>
                    {problems.map(problem => (
                        <tr key={problem.id}>
                            <td>{problem.index}</td>
                            <td>
                                <div className="problem-link" onClick={() => onProblemClick(problem.id)}>
                                    {problem.name}
                                </div>
                            </td>
                            <td>{problem.points ?? '-'}</td>
                            <td>
                                {statusMap[problem.index] === 'AC' ? (
                                    <span style={{color: 'green', fontWeight: 'bold'}}>성공</span>
                                ) : statusMap[problem.index] === 'WA' ? (
                                    <span style={{color: 'red', fontWeight: 'bold'}}>실패</span>
                                ) : (
                                    <span></span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProblemSet;
