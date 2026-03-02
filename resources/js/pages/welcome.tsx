import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Dumbbell, Users, Award, Zap, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';

interface ClassType {
    id: number;
    name: string;
    description: string;
}

interface Facility {
    id: number;
    name: string;
    description: string;
}

interface Props {
    canRegister?: boolean;
    classTypes?: ClassType[];
    facilities?: Facility[];
}

export default function Welcome({
    canRegister = true,
    classTypes = [],
    facilities = [],
}: Props) {
    const { auth } = usePage<SharedData>().props;

    // Modal States
    const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
    const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
    const [classDetailOpen, setClassDetailOpen] = useState(false);
    const [facilityDetailOpen, setFacilityDetailOpen] = useState(false);

    const features = [
        {
            icon: Dumbbell,
            title: 'Modern Equipment',
            desc: 'Top-tier gym equipment for optimal performance.',
        },
        {
            icon: Users,
            title: 'Certified Trainers',
            desc: 'Professional trainers guiding your journey.',
        },
        {
            icon: Award,
            title: 'Proven Programs',
            desc: 'Structured programs that deliver results.',
        },
        {
            icon: Zap,
            title: 'High-Energy Community',
            desc: 'Train in a motivating and supportive environment.',
        },
    ];

    return (
        <>
            <Head title="FitVerse - Premium Gym">
                <link
                    href="https://fonts.bunny.net/css?family=inter:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-white text-slate-900">

                {/* NAVIGATION */}
                <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                                <Dumbbell className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-lg">FitVerse</span>
                        </div>

                        <div className="flex items-center gap-6">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="text-blue-600 font-medium"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="text-slate-600 hover:text-slate-900"
                                    >
                                        Login
                                    </Link>

                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
                                        >
                                            Join Now
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* HERO */}
                <section className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                            Build Your Strongest
                            <span className="text-blue-600"> Version</span>
                        </h1>

                        <p className="mt-6 text-lg text-slate-600 max-w-lg">
                            Premium facilities, certified trainers, and
                            structured programs designed to transform your body
                            and mindset.
                        </p>

                        <div className="mt-8 flex gap-4">
                            <Link href={register()}>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                                    Start Membership
                                </Button>
                            </Link>

                            <Button
                                variant="outline"
                                className="border-slate-300 px-8 py-6 text-lg"
                            >
                                Explore Classes
                            </Button>
                        </div>

                        <div className="mt-10 flex gap-10">
                            <div>
                                <p className="text-3xl font-bold">5K+</p>
                                <p className="text-slate-500 text-sm">
                                    Active Members
                                </p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold">20+</p>
                                <p className="text-slate-500 text-sm">
                                    Trainers
                                </p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold">10+</p>
                                <p className="text-slate-500 text-sm">
                                    Years Experience
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-100 h-[450px] rounded-2xl flex items-center justify-center">
                       <img src="/hero.jpg" alt="Hero Image" className="w-full h-full object-cover rounded-2xl" />
                    </div>
                </section>

                {/* FEATURES */}
                <section className="bg-slate-50 py-20">
                    <div className="max-w-7xl mx-auto px-6">
                        <h2 className="text-4xl font-bold text-center">
                            Why Choose FitVerse
                        </h2>

                        <div className="grid md:grid-cols-4 gap-6 mt-16">
                            {features.map((feature, i) => (
                                <Card
                                    key={i}
                                    className="bg-white border border-slate-200 shadow-sm hover:shadow-md transition"
                                >
                                    <CardHeader>
                                        <feature.icon className="w-8 h-8 text-blue-600 mb-4" />
                                        <CardTitle>
                                            {feature.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="text-slate-600">
                                            {feature.desc}
                                        </CardDescription>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CLASSES */}
                <section className="max-w-7xl mx-auto px-6 py-20">
                    <h2 className="text-4xl font-bold text-center">
                        Our Classes
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6 mt-16">
                        {classTypes.map((classType) => (
                            <Card
                                key={classType.id}
                                className="border border-slate-200 hover:border-blue-600 hover:shadow-md transition bg-white cursor-pointer"
                                onClick={() => {
                                    setSelectedClass(classType);
                                    setClassDetailOpen(true);
                                }}
                            >
                                <CardHeader>
                                    <Badge className="bg-blue-100 text-blue-700 w-fit mb-3">
                                        Popular
                                    </Badge>
                                    <CardTitle>
                                        {classType.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-600">
                                        {classType.description}
                                    </p>

                                    <Button
                                        variant="link"
                                        className="text-blue-600 p-0 mt-4"
                                    >
                                        View Details →
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* FACILITIES */}
                <section className="bg-slate-50 py-20">
                    <div className="max-w-7xl mx-auto px-6">
                        <h2 className="text-4xl font-bold text-center">
                            Premium Facilities
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6 mt-16">
                            {facilities.map((facility) => (
                                <Card
                                    key={facility.id}
                                    className="border border-slate-200 hover:border-blue-600 hover:shadow-md transition bg-white cursor-pointer"
                                    onClick={() => {
                                        setSelectedFacility(facility);
                                        setFacilityDetailOpen(true);
                                    }}
                                >
                                    <CardHeader>
                                        <CardTitle>
                                            {facility.name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-600">
                                            {facility.description}
                                        </p>

                                        <Button
                                            variant="link"
                                            className="text-blue-600 p-0 mt-4"
                                        >
                                            View Details →
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-24 text-center border-t border-slate-200">
                    <h2 className="text-4xl font-bold">
                        Ready to Transform Your Body?
                    </h2>

                    <p className="text-slate-600 mt-4">
                        Join today and start your fitness journey with us.
                    </p>

                    <div className="mt-8">
                        <Link href={register()}>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 text-lg">
                                Get Membership
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="border-t border-slate-200 py-10 bg-white">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-slate-500 text-sm">
                            © 2026 FitVerse. All rights reserved.
                        </p>

                        <div className="flex gap-6 mt-4 md:mt-0 text-sm text-slate-500">
                            <a href="#">Privacy</a>
                            <a href="#">Terms</a>
                            <a href="#">Support</a>
                        </div>
                    </div>
                </footer>

                {/* CLASS DETAIL MODAL */}
                <Dialog open={classDetailOpen} onOpenChange={setClassDetailOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{selectedClass?.name}</DialogTitle>
                            <DialogDescription>
                                Pelajari lebih lanjut tentang kelas kami
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-slate-900 mb-2">
                                    Deskripsi
                                </h4>
                                <p className="text-slate-600">
                                    {selectedClass?.description}
                                </p>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-slate-600">
                                    Kelas ini dirancang untuk semua level kebugaran. Instruktur bersertifikat kami akan membimbing Anda mencapai tujuan fitness dengan aman dan efektif.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Link href={register()} className="flex-1">
                                    <Button
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        Daftar Sekarang
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    onClick={() => setClassDetailOpen(false)}
                                    className="flex-1"
                                >
                                    Tutup
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* FACILITY DETAIL MODAL */}
                <Dialog open={facilityDetailOpen} onOpenChange={setFacilityDetailOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{selectedFacility?.name}</DialogTitle>
                            <DialogDescription>
                                Detail fasilitas premium kami
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-slate-900 mb-2">
                                    Tentang Fasilitas
                                </h4>
                                <p className="text-slate-600">
                                    {selectedFacility?.description}
                                </p>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-slate-600">
                                    Fasilitas ini dilengkapi dengan teknologi terkini dan dirawat secara berkala untuk kenyamanan maksimal member kami.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Link href={register()} className="flex-1">
                                    <Button
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        Pesan Sekarang
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    onClick={() => setFacilityDetailOpen(false)}
                                    className="flex-1"
                                >
                                    Tutup
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
