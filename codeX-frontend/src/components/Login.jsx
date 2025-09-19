import './Login.css'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../authStore';

const Login = () => {
    const [teamname, setTeamname] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const login = useAuthStore((state)=> state.login);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        try {
            const response = await axios.post('http://localhost:3000/api/login',
                {
                    "teamname": teamname,
                    "password": password
                });
            const token = response.data.token;
            if (token) {
                login(token);
                navigate('/')
            }
        } catch(err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message)
            } else {
                setError('Login failed, Please try again!')
            }
        }
    }
    return (
        <div className='form-container'>
            <form className='login-form' onSubmit={handleSubmit}>
                <h2>Login</h2>
                {error && <p className='error-message'>{error}</p>}
                <div className='form-group'>
                    <label htmlFor='Teamname'>Teamname</label>
                    <input 
                    id='teamname' type='text' placeholder='Teamname' 
                    required value={teamname} onChange={(e)=>setTeamname(e.target.value) }/>
                </div>
                <div className='form-group'>
                    <label htmlFor='Password'>Password</label>
                    <input 
                    id='password' type='password' placeholder='Password'
                    required value={password} onChange={(e)=>setPassword(e.target.value)}/>
                </div>
                <button type='submit' className='submit-btn' >Login</button>
            </form >
        </div>
    );
};

export default Login;