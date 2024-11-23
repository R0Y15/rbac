import React from 'react'

const Navbar = () => {
    return (
        <nav className="border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            Admin Dashboard
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <a href="/admin/users" className="px-3 py-2 text-sm font-medium">
                                Users
                            </a>
                            <a href="/admin/roles" className="px-3 py-2 text-sm font-medium">
                                Roles
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar