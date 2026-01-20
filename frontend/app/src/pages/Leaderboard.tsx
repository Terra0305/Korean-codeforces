import './Leaderboard.css';

const Leaderboard = () => {
    
    const handleDummyClick = (e: React.MouseEvent) => {
        e.preventDefault();
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
                        <th>A</th>
                        <th>B</th>
                        <th>C</th>
                        <th>D</th>
                        <th>E</th>
                        <th>F</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Rank 1 */}
                    <tr>
                        <td className="rank-cell rank-1">1</td>
                        <td className="user-cell"><span className="handle" onClick={handleDummyClick}>tourist</span></td>
                        <td className="score-cell">6</td>
                        <td>142</td>
                        <td className="prob-cell ac">+<span className="time-mark">00:05</span></td>
                        <td className="prob-cell ac">+<span className="time-mark">00:12</span></td>
                        <td className="prob-cell ac">+1<span className="time-mark">00:25</span></td>
                        <td className="prob-cell ac">+<span className="time-mark">00:41</span></td>
                        <td className="prob-cell ac">+<span className="time-mark">00:54</span></td>
                        <td className="prob-cell ac">+2<span className="time-mark">01:10</span></td>
                    </tr>
                    {/* Rank 2 */}
                    <tr>
                        <td className="rank-cell rank-2">2</td>
                        <td className="user-cell"><span className="handle" onClick={handleDummyClick}>Benq</span></td>
                        <td className="score-cell">5</td>
                        <td>98</td>
                        <td className="prob-cell ac">+<span className="time-mark">00:04</span></td>
                        <td className="prob-cell ac">+<span className="time-mark">00:10</span></td>
                        <td className="prob-cell ac">+<span className="time-mark">00:20</span></td>
                        <td className="prob-cell ac">+1<span className="time-mark">00:35</span></td>
                        <td className="prob-cell ac">+<span className="time-mark">01:30</span></td>
                        <td className="prob-cell wa">-2</td>
                    </tr>
                    {/* Rank 3 */}
                    <tr>
                        <td className="rank-cell rank-3">3</td>
                        <td className="user-cell"><span className="handle" onClick={handleDummyClick}>Um_nik</span></td>
                        <td className="score-cell">4</td>
                        <td>85</td>
                        <td className="prob-cell ac">+<span className="time-mark">00:06</span></td>
                        <td className="prob-cell ac">+<span className="time-mark">00:15</span></td>
                        <td className="prob-cell pending">?1<span className="time-mark">01:31</span></td>
                        <td className="prob-cell ac">+<span className="time-mark">00:50</span></td>
                        <td className="prob-cell wa">-1</td>
                        <td className="prob-cell ac">+<span className="time-mark">01:05</span></td>
                    </tr>
                    {/* Rank 4 */}
                    <tr>
                        <td className="rank-cell">4</td>
                        <td className="user-cell"><span className="handle" onClick={handleDummyClick}>mnbv</span></td>
                        <td className="score-cell">3</td>
                        <td>45</td>
                        <td className="prob-cell ac">+<span className="time-mark">00:08</span></td>
                        <td className="prob-cell ac">+<span className="time-mark">00:22</span></td>
                        <td className="prob-cell ac">+<span className="time-mark">00:45</span></td>
                        <td className="prob-cell"></td>
                        <td className="prob-cell"></td>
                        <td className="prob-cell"></td>
                    </tr>
                    {/* Rank 5 */}
                    <tr>
                        <td className="rank-cell">5</td>
                        <td className="user-cell"><span className="handle" onClick={handleDummyClick}>Myungwoo</span></td>
                        <td className="score-cell">2</td>
                        <td>30</td>
                        <td className="prob-cell ac">+<span className="time-mark">00:10</span></td>
                        <td className="prob-cell ac">+<span className="time-mark">00:40</span></td>
                        <td className="prob-cell wa">-3</td>
                        <td className="prob-cell"></td>
                        <td className="prob-cell"></td>
                        <td className="prob-cell"></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default Leaderboard;
