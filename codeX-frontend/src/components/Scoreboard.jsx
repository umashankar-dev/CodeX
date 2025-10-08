import { useState, useEffect } from 'react';
import { apiClient } from '../authStore';
import '../styles/Scoreboard.css';

const Scoreboard = () => {
    const [contests, setContests] = useState([]);
    const [selectedContestKey, setSelectedContestKey] = useState('');
    const [scoreboardData, setScoreboardData] = useState([]);
    const [problems, setProblems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const res = await apiClient.get('/api/contests');
                setContests(res.data);
                if (res.data.length > 0) {
                    setSelectedContestKey(res.data[0].contestKey);
                }
            } catch (err) {
                setError('Failed to fetch contests.');
                console.error(err);
            }
        };
        fetchContests();
    }, []);

    // fetch scoreboard data when a contest is selected
    useEffect(() => {
        if (!selectedContestKey) {
            setScoreboardData([]);
            setProblems([]);
            return;
        };

        const fetchScoreboard = async () => {
            setIsLoading(true);
            setError('');
            try {
                const [scoreboardRes, contestRes] = await Promise.all([
                    apiClient.get(`/api/scoreboard/${selectedContestKey}`),
                    apiClient.get(`/api/contests/${selectedContestKey}`)
                ]);
                setScoreboardData(scoreboardRes.data);
                // sorting problems by letter for consistent column order
                const sortedProblems = contestRes.data.problems.sort((a, b) => 
                    a.problemLetter.localeCompare(b.problemLetter)
                );
                setProblems(sortedProblems);
            } catch (err) {
                setError('Failed to fetch scoreboard data.');
                console.error(err);
                setScoreboardData([]);
                setProblems([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchScoreboard();
    }, [selectedContestKey]);

    const handleContestChange = (e) => {
        setSelectedContestKey(e.target.value);
    };

    const renderProblemCell = (team, problemId) => {
        const isSolved = team.solvedProblems[problemId];
        const attempts = team.penaltyAttempts[problemId] || 0;

        if (isSolved) {
            return (
                <div className="cell-solved">
                    <span className="attempts">+{attempts}</span>
                </div>
            );
        } else if (attempts > 0) {
            return (
                <div className="cell-attempted">
                    <span className="attempts">-{attempts}</span>
                </div>
            );
        }
        return <div className="cell-unattempted">-</div>;
    };

    return (
        <div className="scoreboard-container">
            <h2>Scoreboard</h2>
            <div className="contest-selector">
                <label htmlFor="contest-select">Select Contest:</label>
                <select id="contest-select" value={selectedContestKey} onChange={handleContestChange}>
                    {contests.length === 0 && <option>No contests available</option>}
                    {contests.map(contest => (
                        <option key={contest._id} value={contest.contestKey}>
                            {contest.name}
                        </option>
                    ))}
                </select>
            </div>

            {isLoading && <p>Loading scoreboard...</p>}
            {error && <p className="error-message">{error}</p>}

            {!isLoading && !error && selectedContestKey && (
                <table className="scoreboard-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Team</th>
                            <th>Score</th>
                            <th>Time</th>
                            {problems.map(p => (
                                <th key={p._id}>{p.problemLetter}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {scoreboardData.map((team, index) => (
                            <tr key={team.teamname}>
                                <td>{index + 1}</td>
                                <td>{team.teamname}</td>
                                <td>{team.totalScore}</td>
                                <td>{Math.round(team.totalTime)}</td>
                                {problems.map(p => (
                                    <td key={p._id}>{renderProblemCell(team, p._id)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Scoreboard;