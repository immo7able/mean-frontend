'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MotorcycleService } from '@/services/motorcycle'

export default function MyMotorcyclesPage() {
    const [motorcycles, setMotorcycles] = useState([])
    const [selectedImage, setSelectedImage] = useState(null)
    const router = useRouter()

    useEffect(() => {
        const fetchMotorcycles = async () => {
            try {
                const { data } = await MotorcycleService.getUserMotorcycles()
                setMotorcycles(data)
            } catch (err) {
                if (err.status === 401) {
                    router.push('/auth/login')
                }
                console.error('Ошибка при загрузке мотоциклов', err)
            }
        }

        fetchMotorcycles()
    }, [])

    const handleEdit = (motorcycleId) => {
        router.push(`/motorcycles/edit/${motorcycleId}`)
    }

    const handleDelete = async (motorcycleId) => {
        if (!confirm('Вы уверены, что хотите удалить этот мотоцикл?')) return
        try {
            await MotorcycleService.delete(motorcycleId)
            setMotorcycles(motorcycles.filter((m) => m._id !== motorcycleId))
        } catch (err) {
            console.error('Ошибка при удалении мотоцикла', err)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-2xl font-bold mb-6">Ваши мотоциклы</h1>
            {motorcycles.length === 0 ? (
                <p>У вас пока нет опубликованных мотоциклов.</p>
            ) : (
                <div className="space-y-6">
                    {motorcycles.map((motorcycle) => (
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
                                                alt="Motorcycle"
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

                            <div className="mt-4 flex gap-4">
                                <button
                                    onClick={() => handleEdit(motorcycle._id)}
                                    className="bg-blue-500 text-white p-2 rounded"
                                >
                                    Редактировать
                                </button>
                                <button
                                    onClick={() => handleDelete(motorcycle._id)}
                                    className="bg-red-500 text-white p-2 rounded"
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
