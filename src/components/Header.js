'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import {usePathname, useRouter} from 'next/navigation';
import {AuthService, isTokenExpired} from '@/services/auth';

const Header = () => {
    const router = useRouter();
    const pathname = usePathname();

    const [hasMounted, setHasMounted] = useState(false);
    const [isAuth, setIsAuth] = useState(false);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        setHasMounted(true);

        const token = Cookies.get('accessToken');

        if (token && !isTokenExpired(token)) {
            setIsAuth(true);

            AuthService.getProfile()
                .then(res => {setUserRole(res.data.role)})
                .catch(() => {setUserRole(null)});
        } else {
            setIsAuth(false);
            setUserRole(null);
        }
    }, [pathname]);

    const handleLogout = () => {
        AuthService.logout();
        setIsAuth(false);
        setUserRole(null);
        router.push('/auth/login');
    };

    const hideOnAuthPages = ['/login', '/register'].includes(pathname);

    if (!hasMounted || hideOnAuthPages) return null;

    return (
        <header className="px-5 py-3 bg-gray-900 text-white flex justify-between items-center">
            <h2 className="text-xl font-bold">
                <Link href="/motorcycles" className="text-white hover:underline">Motorcycles</Link>
            </h2>
            <nav className="flex gap-4 items-center">
                {isAuth ? (
                    <>
                        <Link href="/motorcycles/new" className="text-white hover:underline">Создать объявление</Link>
                        <Link href="/motorcycles/my" className="text-white hover:underline">Мои объявления</Link>
                        <Link href="/chats" className="text-white hover:underline">Чаты</Link>
                        <Link href="/protected/profile" className="text-white hover:underline">Профиль</Link>

                        {userRole === 'admin' && (
                            <>
                                <Link href="/admin/brands" className="text-white hover:underline">Бренды</Link>
                                <Link href="/admin/models" className="text-white hover:underline">Модели</Link>
                            </>
                        )}

                        <button
                            onClick={handleLogout}
                            className="text-white hover:underline bg-transparent border-none cursor-pointer text-base"
                        >
                            Выйти
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/auth/login" className="text-white hover:underline">Вход</Link>
                        <Link href="/auth/register" className="text-white hover:underline">Регистрация</Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;