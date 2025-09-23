import '../styles/Register.css'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [teamname,setTeamname] = useState('');
    const [password,setPassword] = useState('');
    const [confirmPassword,setConfirmPassword] = useState('');
    const navigate = useNavigate();
    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (password != confirmPassword){
            setStatus('Passwords does not match!');
        } else {
            try {
                const response = await axios.post('http://localhost:3000/api/register',
                    {
                        "teamname": teamname,
                        "password": password
                    });
                setStatus('Your account is created!')
                setTimeout( () => {
                    navigate('/login');
                },1500)
                
                
            } catch(error) {
                if (error.response.status === 409){
                    setStatus(`${error.response.data.message}!`)
                } else {
                    setStatus(`Error while registering, Please try again!`)
                }
                
            }
        }
    }

    return (
        <div className='form-container'>
            <form className='register-form' onSubmit={handleSubmit}>
                <h2>Create Account</h2>
                {status && ( 
                    <p className= {status==="Your account is created!" ? 'acc-created-message': 'error-message'} >{status}</p>
                ) }
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
                <div className='form-group'>
                    <label htmlFor='Confirm Password'>Confirm Password</label>
                    <input 
                    id='confirmPassword' type='password' placeholder='Confirm password' 
                    required value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)}/>
                </div>
                <button type='submit' className='submit-btn' >Register</button>
            </form >
        </div>
    );
};

export default Register;