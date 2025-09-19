import "../styles/ContestList.css";
import { Link } from 'react-router-dom';

const contests = [
  { id: 'codelogik1', name: 'Codelogik', 
    startTime: '16-10-2025 15:00', duration: '03:00' }
];
const ContestList = () => {
    return (
        <div className="contest-list-container">
            <h2>Contests</h2>
            <table className="contest-table">
                <thead>
                <tr>
                    <th>Start Time</th>
                    <th>Contest Name</th>
                    <th>Duration</th>
                </tr>
                </thead>
                <tbody>
                {contests.map(contest => (
                    <tr key={contest.id}>
                    <td>{contest.startTime}</td>
                    <td><Link className="contest-link" to={`/contest/${contest.id}`}>{contest.name}</Link></td>
                    <td>{contest.duration}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ContestList;