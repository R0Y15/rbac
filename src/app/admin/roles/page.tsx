import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ROLE_INFO } from '@/lib/constants/roles'
import Image from 'next/image'
import React from 'react'

const RolesPage = () => {
    return (
        <div className="max-w-screen-2xl mx-auto px-4 space-y-6 p-6">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-semibold tracking-tight">Role Information</h1>
            </div>

            <div className='flex flex-col sm:flex-row gap-4 justify-center items-stretch flex-wrap'>
                {Object.entries(ROLE_INFO).map(([role, info]) => (
                    <Card
                        key={role}
                        className='flex flex-col w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)] min-w-[250px] cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300'
                    >
                        <CardHeader className='flex-none'>
                            <CardTitle className='text-xl capitalize'>{role.toLowerCase()}</CardTitle>
                            <CardDescription>{info.description}</CardDescription>
                        </CardHeader>
                        <CardContent className='flex-grow flex items-center justify-center p-4'>
                            <div className='relative w-full aspect-square'>
                                <Image
                                    src={info.image}
                                    alt={role}
                                    fill
                                    className='object-contain'
                                    sizes="(max-width: 640px) 100vw, 
                                           (max-width: 1024px) 50vw,
                                           25vw"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className='flex-none justify-center text-center p-4'>
                            <p className='text-sm text-muted-foreground'>{info.access}</p>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default RolesPage