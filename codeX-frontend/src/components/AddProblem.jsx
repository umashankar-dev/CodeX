import '../styles/AddProblem.css';
import { apiClient } from '../authStore';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const AddProblem = () => {
    const {contestId} = useParams();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [problemLetter, setProblemLetter] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [constraints, setConstraints] = useState('');
    const [sampleInput, setSampleInput] = useState('');
    const [sampleOutput, setSampleOutput] = useState('');
    const [hiddenTestCases, setHiddenTestCases] = useState([{input:'', output:''}])

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

        try {
            const response = await apiClient.post('/api/contest/:contestId/',{
                contestId,
                problemLetter,
                title,
                description,
                constraints,
                sampleInput,
                sampleOutput,
                hiddenTestCases,
            });
            setSuccess(`Problem ${response.data.title} added successfully!`)
            setTimeout(()=>navigate(`/api/contest/${contestId}`),2000)

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
                <div className='form-row'>
                    <div className='form-group'>
                        <label htmlFor='problemLetter' >Problem Letter (in CAPS)</label>
                        <input id='problemLetter' type='text' value={problemLetter} onChange={(e)=>setProblemLetter(e.target.value)} required/>
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
                    <input id='constraints' type='text' onChange={(e) => setConstraints(e.target.value)} required/>
                </div>
                <div className='form-group'>
                    <label htmlFor='sampleInput'>Sample Input</label>
                    <input id='sampleInput' type='text' onChange={(e)=>setSampleInput(e.target.value)} required/>
                </div>
                <div className='form-group'>
                    <label htmlFor='sampleOutput'>Sample Output</label>
                    <input id='sampleOutput' type='text' onChange={(e)=>setSampleOutput(e.target.value)} required/>
                </div>
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