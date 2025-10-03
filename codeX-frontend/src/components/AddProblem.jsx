import '../styles/AddProblem.css';
import { apiClient } from '../authStore';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AddProblem = () => {
    const navigate = useNavigate();
    const [contests, setContests] = useState([]);
    const [selectedContest, setSelectedContest] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [problemLetter, setProblemLetter] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [constraints, setConstraints] = useState('');
    const [sampleTestCases, setSampleTestCases] = useState([{input:'', output:''}]);
    const [hiddenTestCases, setHiddenTestCases] = useState([{input:'', output:''}]);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const response = await apiClient.get('/api/contests');
                setContests(response.data)
            } catch (error) {
                setError(error)
            }
        };
        fetchContests();
    },[])

    //Sample Test Cases
    const handleSampleTestCaseChange = (index, field, value) => {
        const newSampleTestCases = [...sampleTestCases];
        newSampleTestCases[index][field] = value;
        setSampleTestCases(newSampleTestCases);
    };

    const addSampleTestCase = () => {
        setSampleTestCases([...sampleTestCases, { input: '', output: '' }]);
    };

    const removeSampleTestCase = (index) => {
        setSampleTestCases(sampleTestCases.filter((_, i) => i !== index));
    };

    //Hidden Test cases
    const handleTestCaseChange = (index, field, value) => {
        const newTestCases = [...hiddenTestCases];
        newTestCases[index][field] = value;
        setHiddenTestCases(newTestCases);
    };

    const addTestCase = () => {
        setHiddenTestCases([...hiddenTestCases, { input: '', output: '' }]);
    };

    const removeTestCase = (index) => {
        setHiddenTestCases(hiddenTestCases.filter((_, i) => i !== index));
    };

    const HandleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedContest) {
            setError('Please select a contest!')
            return;
        }

        try {
            const response = await apiClient.post(`/api/contests/${selectedContest}/problems`,{
                problemLetter,
                title,
                description,
                constraints,
                sampleTestCases,
                hiddenTestCases,
                score,
            });
            setSuccess(`Problem ${response.data.title} added successfully!`)
            setTimeout(()=>navigate(`/contests/${selectedContest}`),2000)

        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add problem')
        }
    }

    return (
        <div className='form-container'>
            <form className='add-problem-form'>
                <h2>Add Problem</h2>
                {error && <p className='error-message'>{error}</p>}
                {success && <p className='success-message'>{success}</p>}
                <div className='form-group'>
                    <label htmlFor='contest-select'>Select Contest</label>
                    <select 
                        id='contest-select'
                        value={selectedContest}
                        onChange={(e)=> setSelectedContest(e.target.value)}
                        required
                    >
                        <option value="" disabled>Please select a Contest</option>
                        {contests.map((contest) => (
                            <option key={contest._id} value={contest._id}>{contest.name}</option>
                        ))}
                    </select>
                </div>
                <div className='form-row'>
                    <div className='form-group'>
                        <label htmlFor='problemLetter' >Problem Letter (in CAPS)</label>
                        <input id='problemLetter' type='text' value={problemLetter} onChange={(e)=>setProblemLetter(e.target.value)} required/>
                    </div>
                    <div className='form-group'>
                        <label htmlFor='score' >Score</label>
                        <input id='score' type='number' min={0} value={score} onChange={(e)=>setScore(e.target.value)} required/>
                    </div>
                    <div className='form-group'>
                        <label htmlFor='title' >Title</label>
                        <input id='title' type='text' value={title} onChange={(e)=>setTitle(e.target.value)} required/>
                    </div>
                </div>
                <div className='form-group'>
                    <label htmlFor='description'>Description</label>
                    <textarea id='description' value={description} onChange={(e)=>setDescription(e.target.value)} required/>
                </div>
                <div className='form-group'>
                    <label htmlFor='constraints'>Constraints</label>
                    <textarea id='constraints' value={constraints} onChange={(e)=>setConstraints(e.target.value)} required/>
                </div>
                <fieldset className='test-cases-fieldset'>
                    <legend>Sample Test Cases</legend>
                    {sampleTestCases.map((sample, index) => (
                        <div key={index} className='test-case-group'>
                            <p className='test-case-label'>Sample Test Case #{index + 1}</p>
                            <div className='form-group'>
                                <label>Input</label>
                                <textarea value={sample.input} onChange={(e) => handleSampleTestCaseChange(index, 'input', e.target.value)} required />
                            </div>
                            <div className='form-group'>
                                <label>Output</label>
                                <textarea value={sample.output} onChange={(e) => handleSampleTestCaseChange(index, 'output', e.target.value)} required />
                            </div>
                            <button type='button' className='remove-btn' onClick={() => removeSampleTestCase(index)}>Remove</button>
                        </div>
                    ))}
                    <button type='button' className='add-btn' onClick={addSampleTestCase}>Add Sample Test Case</button>
                </fieldset>
                <fieldset className='test-cases-fieldset'>
                    <legend>Hidden Test Cases</legend>
                    {hiddenTestCases.map((testCase, index) => (
                        <div key={index} className='test-case-group'>
                            <p className='test-case-label'>Test Case #{index + 1}</p>
                            <div className='form-group'>
                                <label>Input</label>
                                <textarea value={testCase.input} onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)} required />
                            </div>
                            <div className='form-group'>
                                <label>Output</label>
                                <textarea value={testCase.output} onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)} required />
                            </div>
                            <button type='button' className='remove-btn' onClick={() => removeTestCase(index)}>Remove</button>
                        </div>
                    ))}
                    <button type='button' className='add-btn' onClick={addTestCase}>Add Test Case</button>
                </fieldset>
                <button type='submit' className='submit-btn' onClick={HandleSubmit}>Add</button>
            </form>
        </div>
    )
}

export default AddProblem;