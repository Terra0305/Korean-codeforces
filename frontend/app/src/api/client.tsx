import axios from "axios";
import { Cookies } from "react-cookie";

const cookies = new Cookies();
const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken',
    headers: {
        "Content-Type": "application/json",
    },
});

client.interceptors.request.use(
    (config) => {
        const token = cookies.get('csrftoken');
        if (token) {
            config.headers['X-CSRFToken'] = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

client.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401 && localStorage.getItem('isLoggedin') === 'true') {
            alert("세션이 만료되었습니다. 다시 로그인해주세요.");
            localStorage.removeItem('isLoggedin');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
)

export default client;