import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Topbar.css';

const Topbar = ({ contest, problems, currentProblemLetter }) => {
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState('Calculating...');

    useEffect(() => {
        if (!contest || !contest.startTime || !contest.duration) return;

        const startTime = new Date(contest.startTime);
        const endTime = new Date(startTime.getTime() + contest.duration * 60 * 1000);

        const updateTimer = () => {
            const now = new Date();
            const difference = endTime - now;

            if (difference <= 0) {
                setTimeLeft('Contest Ended');
                return;
            }

            const hours = Math.floor((difference / (1000 * 60 * 60)));
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            setTimeLeft(
                `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            );
        };

        updateTimer(); 
        const timerInterval = setInterval(updateTimer, 1000);

        return () => clearInterval(timerInterval); 
    }, [contest]);

    const currentIndex = problems.findIndex(p => p.problemLetter === currentProblemLetter);
    const currentProblem = problems[currentIndex];

    const navigateToProblem = (offset) => {
        const nextIndex = currentIndex + offset;
        if (nextIndex >= 0 && nextIndex < problems.length) {
            const nextProblemLetter = problems[nextIndex].problemLetter;
            navigate(`/contests/${contest.contestKey}/problems/${nextProblemLetter}`);
        }
    };

    return (
        <div className="problem-topbar">
            <div className="problem-nav">
                <button 
                    onClick={() => navigateToProblem(-1)} 
                    disabled={currentIndex === 0}
                    className="nav-arrow"
                >
                    Prev
                </button>
                <div className="problem-title-display">
                    {currentProblem ? `${currentProblem.problemLetter} - ${currentProblem.title}` : 'Problem'}
                </div>
                <button 
                    onClick={() => navigateToProblem(1)} 
                    disabled={currentIndex === problems.length - 1}
                    className="nav-arrow"
                >
                    Next
                </button>
            </div>
            <div className="contest-timer">
                <span>Time Remaining: </span>
                {(timeLeft && timeLeft == 'Contest Ended') ? 
                    <span className="timer-display-ended">{timeLeft}</span>
                : <span className="timer-display">{timeLeft}</span>}
            </div>
        </div>
    );
};

export default Topbar;