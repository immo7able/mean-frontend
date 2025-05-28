'use client';

import {useEffect, useState} from 'react';
import {AdminService} from '@/services/admin';
import Cookies from "js-cookie";
import {useRouter} from "next/navigation";

export default function AdminModelsPage() {
    const [models, setModels] = useState([]);
    const [brands, setBrands] = useState([]);
    const [newModel, setNewModel] = useState('');
    const [newBrandId, setNewBrandId] = useState('');
    const [errors, setErrors] = useState("");
    const [isAuthorized, setIsAuthorized] = useState(true)
    const router = useRouter()

    const loadModels = async () => {
        try {
            const data = await AdminService.getAllModels();
            setModels(data);
        } catch (err) {
            if (err.response?.status === 401) {
                router.push('/auth/login')
            }
        }
    };

    const loadBrands = async () => {
        try {
            const data = await AdminService.getAllBrands();
            setBrands(data);
            if (data.length > 0) setNewBrandId(data[0]._id);
        } catch (err) {
            if (err.response?.status === 401) {
                router.push('/auth/login')
            }
        }
    };

    useEffect(() => {
        const accessToken = Cookies.get('accessToken')

        if (!accessToken) {
            setIsAuthorized(false)
            router.push('/auth/login')
            return
        }
        loadModels();
        loadBrands();
    }, []);

    const handleAdd = async () => {
        try {
            await AdminService.createModel(newModel, newBrandId);
            setNewModel('');
            await loadModels();
            setErrors(null);
        } catch (err) {
            setErrors(err.response?.data?.message || 'Ошибка');
        }
    };

    const handleUpdate = async (id, name, brandId) => {
        try {
            await AdminService.updateModel(id, name, brandId);
            await loadModels();
        } catch (error) {
            setErrors(error.response?.data?.message || 'Ошибка');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Удалить модель?')) {
            await AdminService.deleteModel(id);
            await loadModels();
        }
    };

    const toggleEdit = (id, value) => {
        setModels((prev) =>
            prev.map((m) => (m._id === id ? {...m, _editing: value} : m))
        );
    };

    if (!isAuthorized) return null

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Управление моделями</h1>

            <div className="flex gap-8">
                <div className="w-1/2">
                    <h2 className="font-semibold">Существующие модели</h2>
                    <ul className="space-y-2">
                        {models.length === 0 && <p>Моделей пока нет</p>}
                        {models.map((model) => (
                            <li key={model._id} className="flex gap-2 items-center">
                                {model._editing ? (
                                    <>
                                        <input
                                            type="text"
                                            defaultValue={model.name}
                                            onBlur={(e) => handleUpdate(model._id, e.target.value, model.brand?._id)}
                                            className="border p-1 rounded w-1/3"
                                        />
                                        <select
                                            defaultValue={model.brand?._id}
                                            onBlur={(e) => handleUpdate(model._id, model.name, e.target.value)}
                                            className="border p-1 rounded"
                                        >
                                            {brands.map((b) => (
                                                <option key={b._id} value={b._id}>{b.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => toggleEdit(model._id, false)}
                                            className="bg-gray-500 text-white px-2 rounded"
                                        >Отмена
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="w-1/3">{model.name}</span>
                                        <span>{model.brand?.name}</span>
                                        <button
                                            onClick={() => toggleEdit(model._id, true)}
                                            className="bg-yellow-500 text-white px-2 rounded"
                                        >Редактировать
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => handleDelete(model._id)}
                                    className="bg-red-500 text-white px-2 rounded"
                                >Удалить
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="w-1/2">
                    <h2 className="font-semibold mb-2">Добавить модель</h2>
                    <input
                        type="text"
                        value={newModel}
                        onChange={(e) => setNewModel(e.target.value)}
                        placeholder="Название модели"
                        className="border p-2 rounded w-full mb-2"
                    />
                    <select
                        value={newBrandId}
                        onChange={(e) => setNewBrandId(e.target.value)}
                        className="border p-2 rounded w-full"
                    >
                        {brands.map((b) => (
                            <option key={b._id} value={b._id}>{b.name}</option>
                        ))}
                    </select>
                    {errors && <p className="text-red-500 mt-2">{errors}</p>}
                    <button
                        onClick={handleAdd}
                        className="mt-2 bg-blue-500 text-white px-4 py-1 rounded"
                    >Добавить
                    </button>
                </div>
            </div>
        </div>
    );
}
