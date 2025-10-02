import { Navigate } from "react-router-dom";
import useAuthStore from "../authStore";

const AdminRoute = ({children}) => {
    const team = useAuthStore((state) => state.team)

    if (!team) {
        return <Navigate to={'/login'} replace/>
    }

    if (team.role !== 'admin') {
        return <Navigate to={'/'} replace />
    }
    return children
};

export default AdminRoute;
