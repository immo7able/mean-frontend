'use client';

import {useEffect, useState} from 'react';
import {AdminService} from "@/services/admin";
import Cookies from "js-cookie";
import {useRouter} from "next/navigation";

export default function AdminBrandsPage() {
    const [brands, setBrands] = useState([]);
    const [newBrand, setNewBrand] = useState('');
    const [errors, setErrors] = useState("");
    const [isAuthorized, setIsAuthorized] = useState(true)
    const router = useRouter()

    const loadBrands = async () => {
        try {
            const data = await AdminService.getAllBrands();
            setBrands(data);
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

        loadBrands();
    }, []);

    const handleAdd = async () => {
        try {
            await AdminService.createBrand(newBrand);
            setNewBrand('');
            await loadBrands();
            setErrors(null);
        } catch (err) {
            setErrors(err.response?.data?.message || 'Ошибка');
        }
    };

    const handleUpdate = async (id, name) => {
        try {
            await AdminService.updateBrand(id, name);
            await loadBrands();
        } catch (error) {
            setErrors(error.response?.data?.message || 'Ошибка');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Удалить бренд?')) {
            await AdminService.deleteBrand(id);
            await loadBrands();
        }
    };

    const toggleEdit = (id, value) => {
        setBrands((prev) =>
            prev.map((b) => (b._id === id ? {...b, _editing: value} : b))
        );
    };


    if (!isAuthorized) return null

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Добавление бренда</h1>

            <div className="flex gap-8">
                <div className="w-1/2">
                    <h2 className="font-semibold">Существующие бренды</h2>
                    <ul className="space-y-2">
                        {brands.length === 0 && <p>Брендов пока нет</p>}
                        {brands.map((brand) => (
                            <li key={brand._id} className="flex gap-2 items-center">
                                {brand._editing ? (
                                    <>
                                        <input
                                            type="text"
                                            defaultValue={brand.name}
                                            onBlur={(e) => handleUpdate(brand._id, e.target.value)}
                                            className="border p-1 rounded"
                                        />
                                        <button
                                            onClick={() => toggleEdit(brand._id, false)}
                                            className="bg-gray-500 text-white px-2 rounded"
                                        >Отмена
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span>{brand.name}</span>
                                        <button
                                            onClick={() => toggleEdit(brand._id, true)}
                                            className="bg-yellow-500 text-white px-2 rounded"
                                        >Редактировать
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => handleDelete(brand._id)}
                                    className="bg-red-500 text-white px-2 rounded"
                                >Удалить
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h2 className="font-semibold mb-2">Добавить бренд</h2>
                    <input
                        type="text"
                        value={newBrand}
                        onChange={(e) => setNewBrand(e.target.value)}
                        placeholder="Название бренда"
                        className="border p-2 rounded w-full"
                    />
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
