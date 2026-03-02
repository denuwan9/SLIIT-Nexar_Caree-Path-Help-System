import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Layout: React.FC = () => {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 p-8 lg:p-12 overflow-x-hidden">
                <div className="max-w-[1600px] mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
