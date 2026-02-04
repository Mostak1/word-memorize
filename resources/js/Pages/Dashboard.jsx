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

            </div>
        </AuthenticatedLayout>
    );
}
