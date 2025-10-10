import '../styles/ProblemPage.css';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../authStore';
import Editor from '@monaco-editor/react';
import Topbar from './Topbar';

const languageOptions = [
    { id: 71, name: 'Python', monacoName: 'python', defaultCode: '# Write your code here' },
    { id: 54, name: 'C++', monacoName: 'cpp', defaultCode: '// Write your code here' },
    { id: 62, name: 'Java', monacoName: 'java', defaultCode: '// Write your code here' },
    { id: 93, name: 'JavaScript', monacoName: 'javascript', defaultCode: '// Write your code here' },
    { id: 74, name: 'TypeScript', monacoName: 'typescript', defaultCode: '// Write your code here' }
];

const ProblemPage = () => {
	const { contestKey, problemLetter } = useParams();
	const [problem, setProblem] = useState(null);
	const [languageId, setLanguageId] = useState(languageOptions[0].id);
	const [output, setOutput] = useState(null);
	const [allProblems, setAllProblems] = useState([]);
	const [contest, setContest] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [submissionStatus, setSubmissionStatus] = useState('');
    const [isContestOver, setIsContestOver] = useState(false);

	const editorRef = useRef(null);
	const pollIntervalRef = useRef(null);

    const currentLanguage = useMemo(() => 
        languageOptions.find(lang => lang.id == languageId) || languageOptions[0], 
        [languageId]
    );

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
        if (!contest) return;

        const checkContestTime = () => {
            const startTime = new Date(contest.startTime);
            const endTime = new Date(startTime.getTime() + contest.duration * 60000); 
            const now = new Date();

            if (now > endTime) {
                setIsContestOver(true);
            }
        };

        checkContestTime();
        const timeCheckInterval = setInterval(checkContestTime, 15000);
        return () => clearInterval(timeCheckInterval);
    }, [contest]);


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

        if (isContestOver) {
            alert("The contest has ended. Submissions are no longer accepted.");
            return;
        }

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
								{languageOptions.map(lang => (
                                    <option key={lang.id} value={lang.id}>
                                        {lang.name}
                                    </option>
                                ))}
							</select>
							<Editor
								height="60vh"
                                key={currentLanguage.id}
								defaultValue={currentLanguage.defaultCode}
								onMount={handleEditorDidMount}
								// Dynamically set the language for syntax highlighting
								language={currentLanguage.monacoName}
								theme='vs-dark'
								loading='...'
							/>
							<button type="submit" className="submit-code-btn" disabled={isContestOver}>
                                {isContestOver ? 'Contest Over' : 'Submit'}
                            </button>
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