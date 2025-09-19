import { useParams, Link, Outlet } from 'react-router-dom';
import '../styles/ContestPage.css';

const contestData = {
  id: 'codelogik1',
  title: 'Codelogik',
  problems: [
    { id: 'A', title: 'Potions', timeLimit: '2s', memoryLimit: '1024MB' },
    { id: 'B', title: 'MissingNo.', timeLimit: '2s', memoryLimit: '1024MB' },
    { id: 'C', title: 'Ideal Holidays', timeLimit: '2s', memoryLimit: '1024MB' },
    { id: 'D', title: 'President', timeLimit: '2s', memoryLimit: '1024MB' },
    { id: 'E', title: 'Avoid Eye Contact', timeLimit: '4s', memoryLimit: '1024MB' },
    { id: 'F', title: 'Eradication', timeLimit: '2s', memoryLimit: '1024MB' },
  ]
};

const ContestPage = () => {
    const { contestId } = useParams();
    return (
        <div className="contest-page-container">
            <h1>{contestData.title}</h1>
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
                {contestData.problems.map((problem) => (
                    <tr key={problem.id}>
                    <td>
                        <Link to={`/contest/${contestId}/problem/${problem.id}`}>{problem.id}</Link>
                    </td>
                    <td>
                        <Link to={`/contest/${contestId}/problem/${problem.id}`}>{problem.title}</Link>
                    </td>
                    <td>{problem.timeLimit}</td>
                    <td>{problem.memoryLimit}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <Outlet/>
        </div>
    );
};


export default ContestPage;