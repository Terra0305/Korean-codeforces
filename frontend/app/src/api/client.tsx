import axios from "axios";
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
    headers: {
        "Content-Type": "application/json",
    },
});

client.interceptors.response.use(
    response => response,
    error => {
        if (error.response.status === 401) {
            alert("세션이 만료되었습니다.");
            navigate('/login');
        }
        return Promise.reject(error);
    }
)

export default client;