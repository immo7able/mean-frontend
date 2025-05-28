'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { handleApiError } from "@/services/errorHandler"
import { useRouter } from 'next/navigation'
import {AuthService, isTokenExpired} from "@/services/auth"
import {useEffect, useState} from "react"
import { Notification } from "@/components/Notification"
import Cookies from "js-cookie";

const schema = z.object({
    email: z.string().email('Некорректный email'),
    password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
    username: z.string().min(3, 'Имя пользователя слишком короткое'),
    phoneNumber: z.string().min(10, 'Введите корректный номер')
})

export default function RegisterPage() {
    const router = useRouter()
    const [notification, setNotification] = useState(null)

    const handleCloseNotification = () => {
        setNotification(null)
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
    })
    useEffect(() => {
        const token = Cookies.get('accessToken')
        if (token && !isTokenExpired(token)) router.push('/protected/profile')
    }, [])
    const onSubmit = async (data) => {
        try {
            await AuthService.register(data)
            await router.push('/auth/login')
        } catch (error) {
            console.error(error)
            const errorMessage = handleApiError(error)
            setNotification({ message: errorMessage, type: 'error' })
        }
    }

    return (
        <>
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={handleCloseNotification}
                />
            )}

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl space-y-4"
            >
                <h2 className="text-2xl font-semibold text-center">Регистрация</h2>

                <div>
                    <input
                        {...register('email')}
                        placeholder='Email'
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.email && (
                        <span className="text-red-500 text-sm">{errors.email.message}</span>
                    )}
                </div>

                <div>
                    <input
                        {...register('username')}
                        placeholder='Имя пользователя'
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.username && (
                        <span className="text-red-500 text-sm">{errors.username.message}</span>
                    )}
                </div>

                <div>
                    <input
                        {...register('phoneNumber')}
                        placeholder='Номер телефона'
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.phoneNumber && (
                        <span className="text-red-500 text-sm">{errors.phoneNumber.message}</span>
                    )}
                </div>

                <div>
                    <input
                        type='password'
                        {...register('password')}
                        placeholder='Пароль'
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.password && (
                        <span className="text-red-500 text-sm">{errors.password.message}</span>
                    )}
                </div>

                <button
                    type='submit'
                    className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200"
                >
                    Зарегистрироваться
                </button>
            </form>
        </>
    )
}
