import axios from "axios";

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
        if (error.response && error.response.status === 401 && localStorage.getItem('isLoggedin') === 'true') {
            alert("세션이 만료되었습니다. 다시 로그인해주세요.");
            localStorage.removeItem('isLoggedin');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
)

export default client;