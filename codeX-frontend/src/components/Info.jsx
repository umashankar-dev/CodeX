import '../styles/Info.css'

const problems = [{pname:'A',pscore:100},{pname:'B',pscore:200},{pname:'C',pscore:300},
    {pname:'D',pscore:400},{pname:'E',pscore:500},{pname:'F',pscore:750}]

const Info = () => {
    return (
        <div className='info-container'>
            <h1>CodeLogik</h1>
            <h2>Contest Information</h2>
            <ul>
                <li>Duration: <span>180 mintues</span></li>
                <li>Participation: <span>1 - 3 members per team</span></li>
                <li>Problems: <span>6</span></li>
                <li>Start Time: <span>15:00 - 18:00 IST</span></li>
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
                    {problems.map(problem => (
                        <tr key={problem.pname}>
                            <td>{problem.pname}</td>
                            <td>{problem.pscore}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Info;