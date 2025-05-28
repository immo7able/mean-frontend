'use client'

import { useEffect, useState } from 'react'
import { MotorcycleService } from '@/services/motorcycle'
import Link from 'next/link'
import qs from 'query-string'
import { AdminService } from '@/services/admin'

export default function AllMotorcyclesPage() {
    const [motorcycles, setMotorcycles] = useState([])
    const [models, setModels] = useState([])
    const [brands, setBrands] = useState([])
    const [filters, setFilters] = useState({
        brand: '',
        model: '',
        yearFrom: '',
        yearTo: '',
        engineVolumeFrom: '',
        engineVolumeTo: '',
        mileageFrom: '',
        mileageTo: '',
        city: '',
    })

    const fetchMotorcycles = async (params = {}) => {
        try {
            const query = qs.stringify(params)
            const { data } = await MotorcycleService.getAll(query)
            setMotorcycles(data)
        } catch (err) {
            console.error('Ошибка при загрузке мотоциклов', err)
        }
    }

    const loadBrands = async () => {
        try {
            const data = await AdminService.getAllBrands()
            setBrands(data)
        } catch (err) {
            console.error('Ошибка при загрузке брендов', err)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFilters((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleBrandChange = async (e) => {
        const selectedBrand = e.target.value
        setFilters((prev) => ({
            ...prev,
            brand: selectedBrand,
            model: ''
        }))

        try {
            const data = await AdminService.getModelsByBrand(selectedBrand)
            setModels(data)
        } catch (err) {
            console.error('Ошибка при загрузке моделей:', err)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        fetchMotorcycles(filters)
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    useEffect(() => {
        loadBrands()
        fetchMotorcycles()
    }, [])

    return (
        <div className="min-h-screen p-6 bg-gray-100">
            <h1 className="text-3xl font-bold mb-6 text-center">Все мотоциклы</h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">

                <select
                    name="brand"
                    value={filters.brand}
                    onChange={handleBrandChange}
                    className="p-2 rounded border border-gray-300"
                >
                    <option value="">Выберите бренд</option>
                    {brands.map((brand) => (
                        <option key={brand._id} value={brand._id}>
                            {brand.name}
                        </option>
                    ))}
                </select>
                <select
                    name="model"
                    value={filters.model}
                    onChange={handleChange}
                    className="p-2 rounded border border-gray-300"
                    disabled={!filters.brand}
                >
                    <option value="">Выберите модель</option>
                    {models.map((model) => (
                        <option key={model._id} value={model._id}>
                            {model.name}
                        </option>
                    ))}
                </select>

                <div className="flex flex-col">
                    <label className="mb-1 font-medium">Год выпуска от</label>
                    <input
                        name="yearFrom"
                        value={filters.yearFrom}
                        onChange={handleChange}
                        placeholder="От"
                        type="number"
                        className="p-2 rounded border border-gray-300"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="mb-1 font-medium">Год выпуска до</label>
                    <input
                        name="yearTo"
                        value={filters.yearTo}
                        onChange={handleChange}
                        placeholder="До"
                        type="number"
                        className="p-2 rounded border border-gray-300"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="mb-1 font-medium">Объем двигателя от</label>
                    <input
                        name="engineVolumeFrom"
                        value={filters.engineVolumeFrom}
                        onChange={handleChange}
                        placeholder="От"
                        type="number"
                        className="p-2 rounded border border-gray-300"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="mb-1 font-medium">Объем двигателя до</label>
                    <input
                        name="engineVolumeTo"
                        value={filters.engineVolumeTo}
                        onChange={handleChange}
                        placeholder="До"
                        type="number"
                        className="p-2 rounded border border-gray-300"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="mb-1 font-medium">Пробег от</label>
                    <input
                        name="mileageFrom"
                        value={filters.mileageFrom}
                        onChange={handleChange}
                        placeholder="От"
                        type="number"
                        className="p-2 rounded border border-gray-300"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="mb-1 font-medium">Пробег до</label>
                    <input
                        name="mileageTo"
                        value={filters.mileageTo}
                        onChange={handleChange}
                        placeholder="До"
                        type="number"
                        className="p-2 rounded border border-gray-300"
                    />
                </div>

                <div className="flex flex-col">
                    <label className="mb-1 font-medium">Город</label>
                    <input
                        name="city"
                        value={filters.city}
                        onChange={handleChange}
                        placeholder="Город"
                        type="text"
                        className="p-2 rounded border border-gray-300"
                    />
                </div>

                <button
                    type="submit"
                    className="col-span-2 md:col-span-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Найти
                </button>
            </form>

            <div className="grid gap-4 max-w-2xl mx-auto">
                {motorcycles.map((motorcycle) => (
                    <Link
                        key={motorcycle._id}
                        href={`/motorcycles/${motorcycle._id}`}
                        className="bg-white p-4 rounded-xl shadow hover:shadow-md transition block"
                    >
                        <p className="text-gray-800 font-medium text-lg mb-2">
                            {motorcycle.brand.name} {motorcycle.model.name} {motorcycle.engineVolume}
                        </p>

                        {motorcycle.images?.[0] && (
                            <div className="w-full h-60 overflow-hidden rounded-xl mb-3">
                                <img
                                    src={motorcycle.images[0]}
                                    alt="Motorcycle"
                                    className="w-full h-full object-center object-contain"
                                />
                            </div>
                        )}

                        <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
                            <span>{motorcycle.owner?.username || 'Неизвестный пользователь'}</span>
                            <span>{formatDate(motorcycle.createdAt)}</span>
                        </div>

                        {motorcycle.isFavorite && (
                            <div className="text-right text-red-500 text-xl">❤️</div>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    )
}