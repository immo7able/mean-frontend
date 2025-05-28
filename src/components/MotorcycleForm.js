'use client'

import {useEffect, useState} from 'react'
import {useParams, useRouter} from 'next/navigation'
import Cookies from 'js-cookie'
import {MotorcycleService} from '@/services/motorcycle'
import {AvatarUploadButton} from '@/components/uploadthing'
import {AdminService} from "@/services/admin";

export default function MotorcycleForm() {
    const router = useRouter()
    const params = useParams()
    const isEditing = Boolean(params?.id)

    const [motorcycle, setMotorcycle] = useState({
        description: '',
        price: '',
        brand: '',
        model: '',
        year: '',
        engineVolume: '',
        mileage: '',
        city: '',
        images: [],
    })

    const [brands, setBrands] = useState([])
    const [models, setModels] = useState([])

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const accessToken = Cookies.get('accessToken')
        if (!accessToken) {
            router.push('/auth/login')
            return
        }

        AdminService.getAllBrands()
            .then((data) => setBrands(data))
            .catch((err) => console.error('Ошибка загрузки брендов:', err))

        if (isEditing) {
            MotorcycleService.getById(params.id)
                .then(({data}) => {
                    setMotorcycle({
                        ...data,
                        brand: data.brand._id,
                        model: data.model._id,
                    })
                    return AdminService.getModelsByBrand(data.brand._id)
                })
                .then((data) => setModels(data))
                .catch((err) => {
                    if (err.response?.status === 401) {
                        router.push('/auth/login')
                    } else {
                        router.push('/motorcycles')
                    }
                })
        }
    }, [isEditing, params.id, router])

    const handleChange = (e) => {
        const {name, value} = e.target
        setMotorcycle((prev) => ({...prev, [name]: value}))
    }

    const handleBrandChange = async (e) => {
        const selectedBrand = e.target.value
        setMotorcycle((prev) => ({
            ...prev,
            brand: selectedBrand,
            model: '',
        }))

        try {
            const data = await AdminService.getModelsByBrand(selectedBrand)
            console.log(data)
            setModels(data)
        } catch (err) {
            console.error('Ошибка загрузки моделей:', err)
        }
    }

    const handleImageUpload = (res) => {
        if (res?.[0]?.url) {
            setMotorcycle((prev) => ({
                ...prev,
                images: [...prev.images, res[0].url],
            }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (isEditing) {
                await MotorcycleService.update(params.id, motorcycle)
            } else {
                await MotorcycleService.create(motorcycle)
            }

            router.push('/motorcycles')
        } catch (error) {
            console.error('Ошибка при сохранении:', error)
            alert('Произошла ошибка при сохранении данных.')
        } finally {
            setLoading(false)
        }
    }

    const handleRemoveImage = (urlToRemove) => {
        setMotorcycle((prev) => ({
            ...prev,
            images: prev.images.filter((url) => url !== urlToRemove),
        }))
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-xl shadow w-full max-w-2xl space-y-5"
            >
                <h1 className="text-2xl font-bold text-center">
                    {isEditing ? 'Редактировать мотоцикл' : 'Добавить мотоцикл'}
                </h1>

                <select
                    name="brand"
                    value={motorcycle.brand}
                    onChange={handleBrandChange}
                    required
                    className="w-full p-2 border rounded-lg"
                >
                    <option value="">Выберите бренд</option>
                    {Array.isArray(brands) && brands.map((brand) => (
                        <option key={brand._id} value={brand._id}>
                            {brand.name}
                        </option>
                    ))}
                </select>

                <select
                    name="model"
                    value={motorcycle.model}
                    onChange={handleChange}
                    required
                    disabled={!motorcycle.brand}
                    className="w-full p-2 border rounded-lg"
                >
                    <option value="">Выберите модель</option>
                    {Array.isArray(models) && models.map((model) => (
                        <option key={model._id} value={model._id}>
                            {model.name}
                        </option>
                    ))}
                </select>

                {[
                    {name: 'year', label: 'Год выпуска', type: 'number'},
                    {name: 'engineVolume', label: 'Объем двигателя', type: 'number'},
                    {name: 'mileage', label: 'Пробег', type: 'number'},
                    {name: 'city', label: 'Город', type: 'text'},
                    {name: 'description', label: 'Описание', type: 'text'},
                    {name: 'price', label: 'Цена', type: 'number'},
                ].map(({name, label, type}) => (
                    <input
                        key={name}
                        name={name}
                        value={motorcycle[name]}
                        onChange={handleChange}
                        placeholder={label}
                        type={type}
                        required
                        className="w-full p-2 border rounded-lg"
                    />
                ))}

                <AvatarUploadButton
                    endpoint="imageUploader"
                    onClientUploadComplete={handleImageUpload}
                    onUploadError={(err) => alert(`Ошибка загрузки изображения: ${err.message}`)}
                />

                {motorcycle.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                        {motorcycle.images.map((url, i) => (
                            <div key={i} className="relative group rounded-lg overflow-hidden">
                                <img
                                    src={url}
                                    alt={`Изображение ${i + 1}`}
                                    className="w-full h-40 object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(url)}
                                    className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                >
                                    Удалить
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    disabled={loading}
                >
                    {loading ? 'Сохранение...' : isEditing ? 'Сохранить' : 'Создать'}
                </button>
            </form>
        </div>
    )
}
