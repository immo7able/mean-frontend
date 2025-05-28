'use client'
import {useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'
import Cookies from 'js-cookie'
import {AuthService, isTokenExpired} from '@/services/auth'

export default function LoginPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    const [error, setError] = useState('')
    useEffect(() => {
        console.log('ENV:', process.env.NEXT_PUBLIC_BACKEND_URL)
        const token = Cookies.get('accessToken')
        if (token && !isTokenExpired(token)) router.push('/protected/profile')
    }, [])
    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value})
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const {data} = await AuthService.login(formData)
            Cookies.set('accessToken', data.accessToken)
            Cookies.set('refreshToken', data.refreshToken)
            router.push('/protected/profile')
        } catch (err) {
            setError('Ошибка входа: проверьте данные')
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Вход</h1>
                {error && (
                    <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type='email'
                        name='email'
                        placeholder='Email'
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type='password'
                        name='password'
                        placeholder='Пароль'
                        onChange={handleChange}
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type='submit'
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition duration-200"
                    >
                        Войти
                    </button>
                </form>
            </div>
        </div>
    )
}