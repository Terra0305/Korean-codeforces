import { Problem } from "../api/problemApi";

interface ProblemSetProps {
    problems: Problem[];
    onProblemClick: (problemId: number) => void;
}

const ProblemSet = ({ problems, onProblemClick }: ProblemSetProps) => {
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
    );
};

export default ProblemSet;
