import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/WaitingPage.css';

const WaitingPage = ({ contest }) => {
    const navigate = useNavigate();

    const calculateTimeLeft = () => {
        const difference = +new Date(contest.startTime) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            if (Object.keys(newTimeLeft).length === 0) {
                navigate(`/contests/${contest.contestKey}`, { replace: true });
            }
        }, 1000);

        return () => clearTimeout(timer);
    });

    const timerComponents = [];

    Object.keys(timeLeft).forEach((interval) => {
        if (!timeLeft[interval] && interval !== 'seconds') { // Don't skip seconds if it's 0
            if(timerComponents.length > 0) { // only show if a larger unit is present
                 timerComponents.push(
                    <span key={interval}>
                        <strong>0</strong> {interval}{" "}
                    </span>
                 );
            }
            return;
        }

        timerComponents.push(
            <span key={interval}>
                <strong>{String(timeLeft[interval]).padStart(2, '0')}</strong> {interval}{" "}
            </span>
        );
    });

    return (
        <div className="waiting-page-container">
            <h1 className="contest-title">{contest.name}</h1>
            <div className="countdown-container">
                <h2 className="countdown-header">Contest Starts In</h2>
                <div className="timer">
                    {timerComponents.length ? timerComponents : <span>Time's up!</span>}
                </div>
            </div>
        </div>
    );
};

export default WaitingPage;