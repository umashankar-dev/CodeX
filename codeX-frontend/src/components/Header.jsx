import './Header.css';
import { Link, useNavigate } from 'react-router-dom';
import computeXLogo from '../assets/ComputeX-logo.png';
import useAuthStore from '../authStore';

const Header = () => {
    const navigate = useNavigate();
    const team = useAuthStore((state) => state.team);
    const logout = useAuthStore((state) => state.logout);
    
    const logoutFunction = () => {
        logout();
        navigate('/')
    }

    return (
        <header className='header-left'>
            <div className="logo">
                <Link className='logo-link' to={'/'}>
                    <img src={computeXLogo} alt="ComputeX Logo" />
                </Link>
            </div>
            <nav className="main-nav">
                <Link className='nav-link' to={"/"}>Home</Link>
                <Link className='nav-link' to={"/contest"}>Contests</Link>
                <Link className='nav-link' to={"/scoreboard"}>Scoreboard</Link>
                {team && team.role === 'admin' && (
                    <Link className='nav-link' to={"/create-contest"}>Create Contest</Link>
                )}
            </nav>
            <div className="header-right">
                {team ? (
                <>
                    <span className='cur-teamname'>Welcome, {team.teamname}</span>
                    <button className='logout-btn' onClick={logoutFunction}>Logout</button>
                </>
                ) : (
                <>
                    <Link className='signin-link' to={"/login"}>Login</Link>
                    <Link className='signin-link' to={"/register"}>Register</Link>
                </>
                )}
                
            </div>
        </header>
    );
};

export default Header;
