import { useState } from "react";
import { apiClient } from "../authStore";
import './CreateContest.css';

const CreateContest = () => {

    const [name, setName] = useState('');
    const [startTime, setStartTIme] = useState('');
    const [duration, setDuration] = useState(180);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            const response = await apiClient.post('api/contest/create',{
                name,
                startTime,
                duration,
            })
            setSuccess(`Contest ${response.data.name} created successfully`)
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create Contest')
        }
    }

    return (
        <div className="form-container">
            <form className="create-contest-form" onSubmit={handleSubmit}>
                <h2>Create Contest</h2>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <div className="form-group">
                    <label htmlFor="name">Contest Name</label>
                    <input id="name" type="text" value={name} onChange={(e)=>setName(e.target.value)} required/>
                </div>
                <div className="form-group">
                    <label htmlFor="startTime">Start Time</label>
                    <input name="startTime" type="datetime-local" value={startTime} onChange={(e)=>setStartTIme(e.target.value)} required/>
                </div>
                <div className="form-group">
                    <label htmlFor="duration">Duration</label>
                    <input name="duration" type="number" value={duration} onChange={(e)=>setDuration(e.target.value)} required/>
                </div>
                <button type="submit" className="submit-btn">Create Contest</button>
            </form>
        </div>
    )

};

export default CreateContest;