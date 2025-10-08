import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../authStore';
import '../styles/Submissions.css';

const Submissions = () => {
    const [allSubmissions, setAllSubmissions] = useState([]);
    const [filteredSubmissions, setFilteredSubmissions] = useState([]);
    const [contests, setContests] = useState([]);
    const [selectedContestKey, setSelectedContestKey] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [subsRes, contestsRes] = await Promise.all([
                    apiClient.get('/api/submissions'),
                    apiClient.get('/api/contests')
                ]);
                setAllSubmissions(subsRes.data);
                setFilteredSubmissions(subsRes.data); // initially show all
                setContests(contestsRes.data);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // effect to filter submissions when the selected contest changes
    useEffect(() => {
        if (selectedContestKey === 'all') {
            setFilteredSubmissions(allSubmissions);
        } else {
            const filtered = allSubmissions.filter(sub => 
                sub.problemId?.contestId?.contestKey === selectedContestKey
            );
            setFilteredSubmissions(filtered);
        }
    }, [selectedContestKey, allSubmissions]);


    const getVerdictClass = (verdict) => {
        if (verdict === 'Accepted') return 'verdict-accepted';
        if (!verdict || verdict === 'In Queue' || verdict === 'Processing') return 'verdict-pending';
        return 'verdict-wrong';
    };

    if (isLoading) {
        return <div>Loading submissions...</div>;
    }

    return (
        <div className="submissions-container">
            <h2>Submissions</h2>
            
            <div className="contest-selector">
                <label htmlFor="contest-select">Filter by Contest:</label>
                <select id="contest-select" value={selectedContestKey} onChange={(e) => setSelectedContestKey(e.target.value)}>
                    <option value="all">All Contests</option>
                    {contests.map(contest => (
                        <option key={contest._id} value={contest.contestKey}>
                            {contest.name}
                        </option>
                    ))}
                </select>
            </div>

            <table className="submissions-table">
                <thead>
                    <tr>
                        <th>When</th>
                        <th>Team</th>
                        <th>Problem</th>
                        <th>Language</th>
                        <th>Verdict</th>
                        <th>Time</th>
                        <th>Memory</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredSubmissions.map((sub) => (
                        <tr key={sub._id}>
                            <td>{new Date(sub.submittedAt).toLocaleString()}</td>
                            <td>{sub.teamname}</td>
                            <td>
                                {sub.problemId && sub.problemId.contestId ? (
                                    <Link to={`/contests/${sub.problemId.contestId.contestKey}/problems/${sub.problemId.problemLetter}`}> 
                                        {sub.problemId.problemLetter} - {sub.problemId.title}
                                    </Link>
                                ) : 'N/A'}
                            </td>
                            <td>
                                {sub.languageId === 54 && 'C++'}
                                {sub.languageId === 62 && 'Java'}
                                {sub.languageId === 71 && 'Python'}
                            </td>
                            <td className={getVerdictClass(sub.verdict)}>{sub.verdict || sub.status}</td>
                            <td>{sub.executionTime ? `${sub.executionTime.toFixed(3)} s` : '-'}</td>
                            <td>{sub.memory ? `${sub.memory} KB` : '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Submissions;