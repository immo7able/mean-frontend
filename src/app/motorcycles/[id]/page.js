'use client'

import {useEffect, useState} from 'react'
import {useParams, useRouter} from 'next/navigation'
import {AuthService} from '@/services/auth'
import {Heart} from 'lucide-react'
import {MotorcycleService} from '@/services/motorcycle'
import {ChatService} from "@/services/chat";

export default function MotorcycleDetailPage() {
    const {id} = useParams()
    const router = useRouter()
    const [motorcycle, setMotorcycle] = useState(null)
    const [isFavorited, setIsFavorited] = useState(false)
    const [userId, setUserId] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null) // for fullscreen view

    useEffect(() => {
        const load = async () => {
            try {
                const user = await AuthService.getProfile()
                setUserId(user.data._id)
                setIsAuthenticated(true)

                const {data} = await MotorcycleService.getById(id)
                setMotorcycle(data)
                setIsFavorited(data.favorites.includes(user.data._id))
            } catch (err) {
                console.warn('Пользователь не авторизован или ошибка загрузки мотоцикла', err)
                setIsAuthenticated(false)

                try {
                    const {data} = await MotorcycleService.getById(id)
                    setMotorcycle(data)
                } catch {
                    router.push('/motorcycles')
                }
            }
        }

        load()
    }, [id])

    const handleToggleFavorite = async () => {
        if (!isAuthenticated) return
        try {
            const {data} = await MotorcycleService.toggleFavorite(id)
            setMotorcycle(data)
            setIsFavorited(data.favorites.includes(userId))
        } catch (err) {
            console.error('Ошибка при добавлении/удалении из избранного', err)
            alert('Ошибка при добавлении/удалении из избранного')
        }
    }

    const handleOpenChat = async () => {
        const {chatId} = await ChatService.startChat(motorcycle.owner, motorcycle._id)
        console.log(chatId)
        if (chatId) {
            router.push(`/chats`);
        } else {
            alert('Ошибка при создании чата');
        }
    }

    if (!motorcycle) {
        return <div className="text-center mt-10">Загрузка мотоцикла...</div>
    }

    return (
        <div className="min-h-screen p-6 bg-gray-100">
            <div key={motorcycle._id} className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">{motorcycle.brand.name} {motorcycle.model.name}</h2>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-2 text-sm text-gray-800">
                        <p><strong>Цена:</strong> {motorcycle.price} ₸</p>
                        <p><strong>Год выпуска:</strong> {motorcycle.year}</p>
                        <p><strong>Объём двигателя:</strong> {motorcycle.engineVolume} см³</p>
                        <p><strong>Пробег:</strong> {motorcycle.mileage} км</p>
                        <p><strong>Город:</strong> {motorcycle.city}</p>
                        <p><strong>Телефон:</strong> {motorcycle.owner.phoneNumber}</p>
                        <p><strong>Описание:</strong> {motorcycle.description}</p>
                    </div>
                    {motorcycle.images?.length > 0 && (
                        <div className="w-full md:w-1/2 flex flex-col items-center gap-4">
                            <div className="w-full h-80 rounded-xl overflow-hidden cursor-pointer">
                                <img
                                    src={motorcycle.images[0]}
                                    alt="Motorcycle Large"
                                    onClick={() => setSelectedImage(motorcycle.images[0])}
                                    className="w-full h-full object-cover rounded-xl transition hover:scale-105 duration-300"
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 justify-start w-full">
                                {motorcycle.images.slice(1).map((imageUrl, index) => (
                                    <img
                                        key={index}
                                        src={imageUrl}
                                        alt={`Preview ${index + 1}`}
                                        onClick={() => setSelectedImage(imageUrl)}
                                        className="w-24 h-24 object-cover rounded-md cursor-pointer hover:opacity-80 transition"
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between mt-4">
                    {isAuthenticated && motorcycle.owner._id !== userId && (
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            onClick={handleOpenChat}
                        >
                            Написать продавцу
                        </button>
                    )}
                    <div className="flex items-center gap-2">
                        {isAuthenticated ? (
                            <button
                                onClick={handleToggleFavorite}
                                className={`transition duration-200 ${
                                    isFavorited ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'
                                }`}
                            >
                                <Heart className={`w-6 h-6 ${isFavorited ? 'fill-yellow-500' : ''}`}/>
                            </button>
                        ) : (
                            <Heart className="w-6 h-6 text-gray-400"/>
                        )}
                        <span className="text-gray-700">в избранном у {motorcycle.favorites?.length || 0}</span>
                    </div>
                </div>
            </div>

            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
                    onClick={() => setSelectedImage(null)}
                >
                    <img
                        src={selectedImage}
                        alt="Full View"
                        className="max-w-full max-h-full rounded-lg shadow-lg"
                    />
                </div>
            )}
        </div>
    )
}