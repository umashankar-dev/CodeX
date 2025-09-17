import {create} from 'zustand';
import {jwtDecode} from 'jwt-decode';

const useAuthStore = create ((set) => ({
    team: null,

    login: (token) => {
        localStorage.setItem('token',token);
         const decoded = jwtDecode(token);
         set({team: decoded.team});
    },

    logout: () => {
        localStorage.removeItem("token");
        set({team:null})
    },

    checkAuth: () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decodedTeam.exp * 1000 > Date.now()) {
                    set({team: decoded.team});
                } else {
                    localStorage.removeItem('token');
                    set({team: null})
                }
            } catch (error) {
                localStorage.removeItem('token');
                set({team: null})
            }
        }
    },
}));

useAuthStore.getState().checkAuth();

export default useAuthStore;