import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Memorize Words
                </h2>
            }
        >
            <Head title="Dashboard" />
            <div className="min-h-[80vh] bg-gray-50 dark:bg-zinc-900">
                <div className="max-w-xl mx-auto">
                    <div className="pt-6 px-4">
                        <div className="rounded-t-md bg-[#E5201C] text-white p-4 shadow-md">
                            <h1 className="text-lg font-semibold">Memorize Words</h1>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 p-4 shadow-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <button className="flex flex-col items-center justify-center p-4 bg-white rounded-md shadow-md h-36">
                                    <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[#E5201C]/10">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#E5201C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Add new word</span>
                                </button>

                                <button className="flex flex-col items-center justify-center p-4 bg-white rounded-md shadow-md h-36">
                                    <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[#E5201C]/10">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#E5201C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-6.518 3.758A1 1 0 0 1 6 13.998V7.002a1 1 0 0 1 1.234-.97l6.518 1.77a1 1 0 0 1 .999.97v2.376a1 1 0 0 1-.519.992z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Exercise</span>
                                </button>

                                <button className="flex flex-col items-center justify-center p-4 bg-white rounded-md shadow-md h-36">
                                    <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[#E5201C]/10">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#E5201C]" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M3 3h18v2H3V3zm0 6h18v2H3V9zm0 6h18v2H3v-2z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Statistics</span>
                                </button>

                                <button className="flex flex-col items-center justify-center p-4 bg-white rounded-md shadow-md h-36">
                                    <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[#E5201C]/10">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#E5201C]" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M3 6h18v2H3V6zm0 6h18v2H3v-2zm0 6h18v2H3v-2z" />
                                        </svg>
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">List items</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-4">
                                <button className="flex flex-col items-center justify-center p-3 bg-white rounded-md shadow-md h-28">
                                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#E5201C]/10">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#E5201C]" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-medium text-gray-700">Rate 5 stars</span>
                                </button>

                                <button className="flex flex-col items-center justify-center p-3 bg-white rounded-md shadow-md h-28">
                                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#E5201C]/10">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#E5201C]" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18 8a3 3 0 10-2.83-4H8a3 3 0 100 6h7.17A3 3 0 1018 8zM6 12v6h12v-6H6z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-medium text-gray-700">Share</span>
                                </button>

                                <button className="flex flex-col items-center justify-center p-3 bg-white rounded-md shadow-md h-28">
                                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#E5201C]/10">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#E5201C]" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm8 4a8 8 0 11-16 0 8 8 0 0116 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-medium text-gray-700">Settings</span>
                                </button>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="rounded-b-md bg-[#E5201C] text-white text-center py-3 font-medium">
                                MORE
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
