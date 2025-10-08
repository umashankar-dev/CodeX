import '../styles/ProblemPage.css';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../authStore';
import Editor from '@monaco-editor/react';
import Topbar from './Topbar';

const ProblemPage = () => {
	const { contestKey, problemLetter } = useParams();
	const [problem, setProblem] = useState(null);
	const [languageId, setLanguageId] = useState(71);
	const [output, setOutput] = useState(null);
	const [allProblems, setAllProblems] = useState([]);
	const [contest, setContest] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [submissionStatus, setSubmissionStatus] = useState('');

	const editorRef = useRef(null);
	const pollIntervalRef = useRef(null);

	useEffect(() => {
		return () => {
			if (pollIntervalRef.current) {
				clearInterval(pollIntervalRef.current);
			}
		};
	}, []);

	const handleEditorDidMount = (editor, monaco) => {
		editorRef.current = editor;
	};

	useEffect(() => {
		const fetchProblem = async () => {
			setIsLoading(true);
			try {
				const [problemRes, allProblemRes, contestRes] = await Promise.all([
					apiClient.get(`/api/contests/${contestKey}/problems/${problemLetter}`),
					apiClient.get(`/api/contests/${contestKey}/problems`),
					apiClient.get(`/api/contests/${contestKey}`)
				]);
				setProblem(problemRes.data);
				setAllProblems(allProblemRes.data);
				setContest(contestRes.data);
			} catch (error) {
				console.log("Error while fetching problem", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchProblem();
	}, [contestKey, problemLetter]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (pollIntervalRef.current) {
			clearInterval(pollIntervalRef.current);
		}
		setOutput(null);
		setSubmissionStatus('Submitting...');
		
		try {
			const res = await apiClient.post('/api/submit', {
				code: editorRef.current.getValue(),
				languageId: languageId,
				problemId: problem._id,
			});
			
			const { submissionId } = res.data;
			setSubmissionStatus('In Queue');

			pollIntervalRef.current = setInterval(async () => {
				try {
					const statusRes = await apiClient.get(`/api/submissions/${submissionId}`);
					const { status, details, testCasesPassed, totalTestCases } = statusRes.data;

					if (status !== 'In Queue' && status !== 'Processing' && status !== 'Pending') {
						clearInterval(pollIntervalRef.current);
						const testCaseInfo = testCasesPassed !== undefined 
                            ? ` (${testCasesPassed}/${totalTestCases} passed)`
                            : '';
                        setSubmissionStatus(`Verdict: ${status}${testCaseInfo}`);
						setOutput(details);
					} else {
						setSubmissionStatus(status + '...');
					}
				} catch (pollError) {
					clearInterval(pollIntervalRef.current);
					setSubmissionStatus('Error fetching status.');
					console.error('Polling error:', pollError);
				}
			}, 2000);

		} catch (error) {
			setSubmissionStatus('Submission failed.');
			setOutput({ stderr: error.response?.data?.message || 'An error occurred while submitting.' });
		}
	};

	if (isLoading) {
		return <div>Loading problem...</div>;
	}

	if (!problem || !contest) {
		return <div>Problem not found.</div>;
	}

	return (
		<>
			<Topbar
				contest={contest}
				problems={allProblems}
				currentProblemLetter={problemLetter}
			/>
            
			<div className="problem-page-wrapper">
				<div className="problem-page-container">
					<div className="problem-statement">
						<h2>{problem.problemLetter} - {problem.title}</h2>
						<p>{problem.description}</p>
						<h3>Constraints</h3>
						<ul>
							{problem.constraints.split('\n').map((constraint, index) => (
								<li key={index}>{constraint}</li>
							))}
						</ul>
						{problem.sampleTestCases && problem.sampleTestCases.map((testcase, index) => (
							<div key={index}>
								<h3>Sample Input {index + 1}</h3>
								<pre>{testcase.input}</pre>
								<h3>Sample Output {index + 1}</h3>
								<pre>{testcase.output}</pre>
							</div>
						))}
					</div>
					<div className="code-editor-container">
						<form onSubmit={handleSubmit}>
							<label htmlFor="language">Language:</label>
							<select
								id="language"
								value={languageId}
								onChange={(e) => setLanguageId(e.target.value)}
							>
								<option value={71}>Python</option>
								<option value={54}>C++</option>
								<option value={62}>Java</option>
							</select>
							<Editor
								height="60vh"
								defaultValue='# Write your code here'
								onMount={handleEditorDidMount}
								defaultLanguage='python'
								theme='vs-dark'
								loading='...'
							/>
							<button type="submit" className="submit-code-btn">Submit</button>
						</form>
					</div>
				</div>

                {submissionStatus && (
                    <div className="submission-status-wrapper">
                        <div className="output-container">
                            <h3>Submission Status</h3>
                            <p>{submissionStatus}</p>
                            {output && (
                                <>
                                    {output.time && <p>Time: {parseFloat(output.time).toFixed(3)}s</p>}
                                    {output.memory && <p>Memory: {output.memory} KB</p>}
                                    {output.compile_output && <><h4>Compile Output</h4><pre>{output.compile_output}</pre></>}
                                    {output.stdout && <><h4>Output (stdout)</h4><pre>{output.stdout}</pre></>}
                                    {output.stderr && <><h4>Error (stderr)</h4><pre>{output.stderr}</pre></>}
                                </>
                            )}
                        </div>
                    </div>
                )}
			</div>
		</>
	);
};

export default ProblemPage;