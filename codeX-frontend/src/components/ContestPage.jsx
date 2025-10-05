import { useParams, Link, Outlet } from 'react-router-dom';
import '../styles/ContestPage.css';
import { useState, useEffect } from 'react';
import { apiClient } from '../authStore';
import WaitingPage from "./WaitingPage";


const ContestPage = () => {
    const [problems, setProblems] = useState([]);
    const [contest, setContest] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { contestKey } = useParams();
    
    useEffect(()=>{
        const fetchContests = async () => {
            setIsLoading(true);
            try {
                const contestRes = await apiClient.get(`/api/contests/${contestKey}`);
                setContest(contestRes.data);
                if (new Date() >= new Date(contestRes.data.startTime)) {
                    const response = await apiClient.get(`/api/contests/${contestKey}/problems`);
                    setProblems(response.data)
                }
                
            } catch (error) {
                console.log('Error while fetching problems',error)
            } finally {
                setIsLoading(false);
            }
        }
        fetchContests();
    },[contestKey]);

    if (isLoading) {
        return <div className="contest-page-container"><p>Loading contest...</p></div>;
    }

    if (!contest) {
         return <div className="contest-page-container"><p>Contest not found.</p></div>;
    }

    if (new Date() < new Date(contest.startTime)) {
        return <WaitingPage contest={contest} />;
    }
    
    return (
        <div className="contest-page-container">
            <h1>{contest.name}</h1>
            <table className="problems-table">
                <thead>
                <tr>
                    <th>Task</th>
                    <th>Title</th>
                    <th>Time Limit</th>
                    <th>Memory Limit</th>
                </tr>
                </thead>
                <tbody>
                {problems.map((problem) => (
                    <tr key={problem._id}>
                    <td>
                        <Link to={`/contests/${contestKey}/problems/${problem.problemLetter}`}>{problem.problemLetter}</Link>
                    </td>
                    <td>
                        <Link to={`/contests/${contestKey}/problems/${problem.problemLetter}`}>{problem.title}</Link>
                    </td>
                    <td>{problem.timeLimit} sec</td>
                    <td>{problem.memoryLimit} MB</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <Outlet/>
        </div>
    );
};


export default ContestPage;