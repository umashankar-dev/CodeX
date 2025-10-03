import { useParams, Link, Outlet } from 'react-router-dom';
import '../styles/ContestPage.css';
import { useState, useEffect } from 'react';
import { apiClient } from '../authStore';


const ContestPage = () => {
    const [problems, setProblems] = useState([]);
    const [contest, setContest] = useState({});
    const { contestId } = useParams();
    
    useEffect(()=>{
        const fetchContests = async () => {
            try {
                setContest((await apiClient.get(`/api/contests/${contestId}`)).data)
                const response = await apiClient.get(`/api/contests/${contestId}/problems`);
                setProblems(response.data)
            } catch (error) {
                console.log('Error while fetching problems',error)
            }
        }
        fetchContests();
    },[contestId]);
    
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
                        <Link to={`/contests/${contestId}/problems/${problem._id}`}>{problem.problemLetter}</Link>
                    </td>
                    <td>
                        <Link to={`/contests/${contestId}/problems/${problem._id}`}>{problem.title}</Link>
                    </td>
                    <td>{2} sec</td>
                    <td>{1024} MB</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <Outlet/>
        </div>
    );
};


export default ContestPage;