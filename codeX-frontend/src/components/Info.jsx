import '../styles/Info.css';
import {apiClient} from '../authStore';
import { useState, useEffect } from 'react';

const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    //local time
    return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

const formatDuration = (minutes) => {
    if (isNaN(minutes)) return 'N/A';
    return `${minutes} minutes`;
};

const Info = () => {
    const [contests, setContests] = useState([]);
    useEffect(()=> {
        const fetchContests = async () => {
            try {
                const res = await apiClient(`/api/contest/`);
                setContests(res.data);
            } catch (error) {
                console.log('Error while fetching contests',error)
            }
        };
        fetchContests();
    },[]);

    return (
        <div className='info-container'>
            <h1>Contest Information</h1>
            
            {contests.map(contest => (
                <div className='contest-container' key={contest._id}>
                    <h2>{contest.name}</h2>
                    <ul>
                        <li>Start Time: <span>{formatDateTime(contest.startTime)}</span></li>
                        <li>Duration: <span>{formatDuration(contest.duration)}</span></li>
                        <li>Participation: <span>1 - 3 members per team</span></li>
                        <li>Problems: <span>{contest.problems.length}</span></li>
                        
                    </ul>
                    <h2>Point Values</h2>
                    <table className='problems-table'>
                        <thead>
                            <tr>
                                <th>Problems</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contest.problems.map(problem => (
                                <tr key={problem._id}>
                                    <td>{problem.problemLetter}</td>
                                    <td>{problem.score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>                
                </div>
            ))}
        </div>
    );
};

export default Info;