import '../styles/ProblemPage.css'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { apiClient } from '../authStore';
import Editor from '@monaco-editor/react';
import Topbar from './Topbar';

const ProblemPage = () => {
	const {contestKey,problemLetter} = useParams();
	const [problem, setProblem ] = useState(null);
	const [languageId,setLanguageId] = useState(71); 
	const [output,setOutput] = useState(null);
	const [allProblems, setAllProblems] = useState([]);
	const [contest, setContest] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	const editorRef = useRef(null);

	const handleEditorDidMount = (editor, monanco) => {
		editorRef.current = editor;
	}


	useEffect(() => {
		const fetchProblem = async () => {
			try {
				const [problemRes, allProblemRes, contestRes] = await Promise.all([
					apiClient.get(`/api/contests/${contestKey}/problems/${problemLetter}`),
					apiClient.get(`/api/contests/${contestKey}/problems`),
					apiClient.get(`/api/contests/${contestKey}`)
				]);
				setProblem(problemRes.data)
				setAllProblems(allProblemRes.data)
				setContest(contestRes.data)
			} catch (error) {
				console.log("Error while fetching problem",error)
			} finally {
				setIsLoading(false)
			}
		};
		fetchProblem();
	},[contestKey, problemLetter])

	const handleSubmit = async (e) => {
		e.preventDefault();
		setOutput({status:{description:'Running..'}});
		try{
			const res = await apiClient.post('/api/submit',{
				code:[editorRef.current.getValue()],
				languageId:languageId,
				problemId: problem._id,
				contestKey:contestKey
			});
			setOutput(res.data);
		} catch(error){
			console.error(error);
			setOutput({
				strerr:'An error occurred while submitting',
				status:{description:'error'}
			});
		}
	};

	if (isLoading) {
		return <div>Loading problem...</div>
	}

	if (!problem || !contest) {
		return <div>Problem not found.</div>
	}

	return (
		<>
			<Topbar 
			contest={contest}
			problems={allProblems}
			currentProblemLetter={problemLetter}
			/>
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
						{problem.sampleTestCases && problem.sampleTestCases.map((testcase, index) => (
							<div key={index}>
								<h3>Sample Input {index+1}</h3>
								<pre>{testcase.input}</pre>
								<h3>Sample Output {index+1}</h3>
								<pre>{testcase.output}</pre>
							</div>
						))}
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
						<Editor
						height="100vh"
						defaultValue='Write your code here'
						onMount={handleEditorDidMount}
						defaultLanguage='javascript'
						theme='vs-dark'
						loading='...'
						/>				
					<button type="submit" className="submit-code-btn" >Submit</button>
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
		</>	
	);    
	};

export default ProblemPage;

