'use client'

import {useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'
import {AuthService} from '@/services/auth'
import {UserService} from '@/services/user'
import {AvatarUploadButton} from "@/components/uploadthing";

export default function ProfilePage() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const {data} = await AuthService.getProfile()
                setUser(data)
            } catch (err) {
                router.push('../auth/login')
            } finally {
                setLoading(false)
            }
        }
        loadProfile()
    }, [])

    const handleLogout = () => {
        AuthService.logout()
        router.push('../auth/login')
    }

    const handleAvatarUpload = async (res) => {
        if (!res?.[0]?.url) return
        await UserService.updateAvatar(res[0].url)
        const {data} = await AuthService.getProfile()
        setUser(data)
    }

    const handleAvatarDelete = async () => {
        await UserService.deleteAvatar()
        const {data} = await AuthService.getProfile()
        setUser(data)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-gray-600 text-lg">Загрузка...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md text-center">
                <h1 className="text-2xl font-bold mb-6">Профиль пользователя</h1>

                {user && (
                    <>
                        <div className="mb-6 flex flex-col items-center">
                            {user.avatarUrl ? (
                                <>
                                    <img
                                        src={user.avatarUrl}
                                        alt="Аватар"
                                        className="w-32 h-32 object-cover rounded-full mb-2 border border-gray-300 shadow"
                                    />
                                    <button
                                        onClick={handleAvatarDelete}
                                        className="text-red-500 text-sm hover:underline"
                                    >
                                        Удалить аватар
                                    </button>
                                </>
                            ) : (
                                <AvatarUploadButton
                                    endpoint="imageUploader"
                                    onClientUploadComplete={handleAvatarUpload}
                                    onUploadError={(err) => alert(`Ошибка: ${err.message}`)}
                                />
                            )}
                        </div>

                        <div className="space-y-2 mb-6">
                            <p>
                                <span className="font-semibold">Login:</span> {user.username}
                            </p>
                            <p>
                                <span className="font-semibold">Email:</span> {user.email}
                            </p>
                            <p>
                                <span className="font-semibold">Phone:</span> {user.phoneNumber}
                            </p>
                        </div>
                    </>
                )}

                <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition duration-200"
                >
                    Выйти
                </button>
            </div>
        </div>
    )
}