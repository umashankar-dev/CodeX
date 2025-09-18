import { Navigate } from "react-router-dom";
import useAuthStore from "../authStore";

const ProtectedRoute = ({ children }) => {
    const team = useAuthStore((state) => state.team);

    if (!team) {
        return <Navigate to={'/login'} replace />
    }

    return children;
};

export default ProtectedRoute;