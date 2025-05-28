import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = 'http://localhost:3001/api'

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use((config) => {
    const token = Cookies.get('accessToken')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

let isRefreshing = false
let failedQueue = []
const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error)
        else prom.resolve(token)
    })
    failedQueue = []
}
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({resolve, reject})
                })
                    .then(() => api(originalRequest))
                    .catch((err) => Promise.reject(err))
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                const refreshToken = Cookies.get('refreshToken')
                const {data} = await axios.post(`${API_URL}/auth/refresh-token`, {refreshToken})

                Cookies.set('accessToken', data.accessToken)
                Cookies.set('refreshToken', data.refreshToken)
                api.defaults.headers['Authorization'] = `Bearer ${data.accessToken}`

                processQueue(null, data.accessToken)
                return api(originalRequest)
            } catch (refreshError) {
                processQueue(refreshError)

                Cookies.remove('accessToken')
                Cookies.remove('refreshToken')

                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)

export default api