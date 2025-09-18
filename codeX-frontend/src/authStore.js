import {create} from 'zustand';
import {jwtDecode} from 'jwt-decode';
import axios from "axios";

const apiClient = axios.create({
    baseURL: 'http://localhost:3000/',
});

const setAuthHeader = (token) => {
    if (token) {
        apiClient.defaults.headers.common["x-auth-token"] = token;
    } else {
        delete apiClient.defaults.headers.common["x-auth-token"]
    }
}

const useAuthStore = create ((set) => ({
    team: null,

    login: (token) => {
        localStorage.setItem('x-auth-token',token);
         const decoded = jwtDecode(token);
         set({team: decoded.team});
    },

    logout: () => {
        localStorage.removeItem('x-auth-token');
        set({team:null})
    },

    checkAuth: () => {
        const token = localStorage.getItem('x-auth-token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 > Date.now()) {
                    set({team: decoded.team});
                } else {
                    localStorage.removeItem('x-auth-token');
                    set({team: null})
                }
            } catch (error) {
                localStorage.removeItem('x-auth-token');
                set({team: null})
            }
        }
    },
}));

useAuthStore.getState().checkAuth();

export {apiClient};     //use apiClient in place of axios wherever auth is required!
export default useAuthStore;