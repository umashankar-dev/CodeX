import { useParams, Link, Outlet } from 'react-router-dom';
import '../styles/ContestPage.css';
import { useState, useEffect } from 'react';
import { apiClient } from '../authStore';


const ContestPage = () => {
    const [problems, setProblems] = useState([]);
    const [contest, setContest] = useState({});
    const { contestKey } = useParams();
    
    useEffect(()=>{
        const fetchContests = async () => {
            try {
                setContest((await apiClient.get(`/api/contests/${contestKey}`)).data)
                const response = await apiClient.get(`/api/contests/${contestKey}/problems`);
                setProblems(response.data)
            } catch (error) {
                console.log('Error while fetching problems',error)
            }
        }
        fetchContests();
    },[contestKey]);
    
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