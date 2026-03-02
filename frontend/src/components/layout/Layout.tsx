import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Layout: React.FC = () => {
    return (
        <div className="flex min-h-screen bg-[#f1f5f9]">
            <Sidebar />
            <main className="
                flex-1 overflow-x-hidden overflow-y-auto
                pt-4 pb-6 px-4
                md:pt-6 md:pb-8 md:px-8
                lg:pt-8 lg:pb-10 lg:px-12
                mt-16 mb-20
                md:mt-0 md:mb-0
            ">
                <div className="max-w-[1600px] mx-auto w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
