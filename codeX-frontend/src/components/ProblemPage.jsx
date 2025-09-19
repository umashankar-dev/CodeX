import '../styles/ProblemPage.css'
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ProblemPage = () => {
  const {contestId,problemId} = useParams();
  const [code, setCode] = useState('');
  const [languageId,setLanguageId] = useState(71); 
  const [output,setOutput] = useState(null);

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
      <div className="problem-statement">
        <h2>A - Welcome to AtCoder</h2>
        <p>
          You are given two positive integers a and b, and a string S.
          Your task is to read these three inputs and print the sum of a and b,
           followed by a space, and then the string S.
        </p>
        <h3>Constraints</h3>
        <ul>
          <li>1 ≤ a, b ≤ 1,000</li>
          <li>1 ≤ length of S ≤ 100</li>
        </ul>
        <h3>Example Input 1</h3>
        <pre>1 5 Hello</pre>
        <h3>Example Output 1</h3>
        <pre>6 Hello</pre>
      </div>

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

