import "../styles/ContestList.css";
import { Link } from 'react-router-dom';
import { apiClient } from "../authStore";
import { useState , useEffect} from "react";

const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    const pad = (num) => String(num).padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const dayOfMonth = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${dayOfMonth} ${hours}:${minutes}`;
};

const ContestList = () => {
    const [contests, setContests] = useState([]);
    useEffect(()=> {
        const fetchContests = async () => {
            try {
                const res = await apiClient(`/api/contests`);
                setContests(res.data);
            } catch (error) {
                console.log('Error while fetching contests',error)
            }
        };
        fetchContests();
    },[]);

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
                    <tr key={contest._id}>
                    <td>{formatDateTime(contest.startTime)}</td>
                    <td><Link className="contest-link" to={`/contests/${contest.contestKey}`}>{contest.name}</Link></td>
                    <td>{contest.duration} minutes</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ContestList;