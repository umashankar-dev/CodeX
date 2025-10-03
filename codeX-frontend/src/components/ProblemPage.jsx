import '../styles/ProblemPage.css'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { apiClient } from '../authStore';

const ProblemPage = () => {
	const {contestId,problemId} = useParams();
	const [problem, setProblem ] = useState(null);
	const [code, setCode] = useState('');
	const [languageId,setLanguageId] = useState(71); 
	const [output,setOutput] = useState(null);

	useEffect(() => {
		const fetchProblem = async () => {
			try {
				const response = await apiClient.get(`/api/contests/${contestId}/problems/${problemId}`);
				setProblem(response.data)
			} catch (error) {
				console.log("Error while fetching problem",error)
			}
		};
		fetchProblem();
	},[contestId, problemId])

	const handleSubmit = async (e) => {
		e.preventDefault();
		setOutput({status:{description:'Running..'}});
		try{
			const res =  axios.post('/api/submit',{
				code:code,
				languageId:languageId
			});
			setOutput(res.data);
		} catch(error){
			console.error(error);
			setOutput({
				strerr:'an error while submitting',
				status:{description:'error'}
			});
		}
	};

	return (
		<div className="problem-page-container">
		{problem && (
			<div className="problem-statement">
				<h2>{problem.problemLetter} - {problem.title}</h2>
				<p>
				{problem.description}
				</p>
				<h3>Constraints</h3>
				<ul>
					{problem.constraints.split('\n').map((constraint, index)=>(
						<li key={index}>{constraint}</li>
					))}
				</ul>
				<h3>Sample Input 1</h3>
				<pre>{problem.sampleInput}</pre>
				<h3>Sample Output 1</h3>
				<pre>{problem.sampleOutput}</pre>
			</div>	
		)}


		<div className="code-editor-container">
			<form onSubmit={handleSubmit}>
			<label htmlFor="language">Language:</label>
			<select
				id="language"
				value={languageId}
				onChange={(e) => setLanguageId(e.target.value)}
			>
				<option value="71">Python</option>
				<option value="54">C++</option>
				<option value="62">Java</option>
			</select>
			<textarea
				className="code-editor"
				value={code}
				onChange={(e) => setCode(e.target.value)}
				placeholder="Write your code here..."
			/>
			<button type="submit" className="submit-code-btn">Submit</button>
			</form>
			{ output && (
			<div className="output-container">
				<h3>Output</h3>
				<p>Status: {output.status.description}</p>
				{output.stdout && <pre>Stdout: {output.stdout}</pre>}
				{output.stderr && <pre>Stderr: {output.stderr}</pre>}
				{output.time && <p>Time: {output.time}s</p>}
				{output.memory && <p>Memory: {output.memory} KB</p>}
			</div>
			)}
		</div>
		</div>
	);    
	};

export default ProblemPage;

