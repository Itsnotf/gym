import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Star, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface Trainer {
    id: number;
    name: string;
    specialty: string;
    review?: {
        id: number;
        rating: number;
        comment: string;
        would_recommend: boolean;
        reviewed_at: string;
    } | null;
}

interface Props {
    trainersToReview: Trainer[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Trainer Reviews',
        href: '/my/trainer-reviews',
    },
];

export default function TrainerReviewsPage({ trainersToReview }: Props) {
    const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        rating: 5,
        comment: '',
        would_recommend: true,
    });

    const resetForm = (trainer: Trainer | null) => {
        if (trainer?.review) {
            setFormData({
                rating: trainer.review.rating,
                comment: trainer.review.comment,
                would_recommend: trainer.review.would_recommend,
            });
        } else {
            setFormData({
                rating: 5,
                comment: '',
                would_recommend: true,
            });
        }
    };

    const handleOpenDialog = (trainer: Trainer) => {
        setSelectedTrainer(trainer);
        resetForm(trainer);
        setDialogOpen(true);
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTrainer) return;

        router.post('/trainer-reviews', {
            trainer_id: selectedTrainer.id,
            rating: formData.rating,
            comment: formData.comment || null,
            would_recommend: formData.would_recommend,
        }, {
            onSuccess: () => {
                toast.success('Review submitted successfully!');
                setDialogOpen(false);
                setSelectedTrainer(null);
                setFormData({
                    rating: 5,
                    comment: '',
                    would_recommend: true,
                });
            },
        });
    };

    const handleDelete = (trainerId: number) => {
        const trainer = trainersToReview.find(t => t.id === trainerId);
        if (!trainer?.review) return;

        if (confirm('Are you sure you want to delete this review?')) {
            router.delete(`/trainer-reviews/${trainer.review.id}`, {
                onSuccess: () => {
                    toast.success('Review deleted successfully!');
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Trainer Reviews" />

            <div className="p-4 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Rate Your Trainers</h1>
                    <p className="text-gray-600 mt-2">Share your experience with the trainers you've worked with</p>
                </div>

                {trainersToReview.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6 text-center py-12">
                            <p className="text-gray-500 mb-4">No trainers available to review.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {trainersToReview.map((trainer) => (
                            <Card key={trainer.id} className="overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="text-lg">{trainer.name}</CardTitle>
                                    <CardDescription>{trainer.specialty}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {trainer.review ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-5 h-5 ${i < trainer.review!.rating
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            {trainer.review.comment && (
                                                <p className="text-sm text-gray-600">{trainer.review.comment}</p>
                                            )}
                                            {trainer.review.would_recommend && (
                                                <div className="flex items-center gap-2 text-sm text-green-600">
                                                    <ThumbsUp className="w-4 h-4" />
                                                    Would recommend
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-500">
                                                Reviewed on {new Date(trainer.review.reviewed_at).toLocaleDateString()}
                                            </p>
                            <div className="flex gap-2 pt-2">
                                                <Dialog open={dialogOpen && selectedTrainer?.id === trainer.id}
                                                    onOpenChange={(open) => {
                                                        if (open) {
                                                            handleOpenDialog(trainer);
                                                        } else {
                                                            setDialogOpen(false);
                                                        }
                                                    }}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" className="flex-1">
                                                            Edit Review
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Edit Review for {trainer.name}</DialogTitle>
                                                            <DialogDescription>
                                                                Share your feedback about this trainer
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <ReviewForm formData={formData} setFormData={setFormData} onSubmit={onSubmit} />
                                                    </DialogContent>
                                                </Dialog>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(trainer.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Dialog open={dialogOpen && selectedTrainer?.id === trainer.id}
                                            onOpenChange={(open) => {
                                                if (open) {
                                                    handleOpenDialog(trainer);
                                                } else {
                                                    setDialogOpen(false);
                                                }
                                            }}>
                                            <DialogTrigger asChild>
                                                <Button className="w-full">
                                                    <Star className="w-4 h-4 mr-2" />
                                                    Write Review
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Rate {trainer.name}</DialogTitle>
                                                    <DialogDescription>
                                                        Share your experience with this trainer
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <ReviewForm formData={formData} setFormData={setFormData} onSubmit={onSubmit} />
                                            </DialogContent>
                                        </Dialog>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function ReviewForm({ formData, setFormData, onSubmit }: {
    formData: any;
    setFormData: (data: any) => void;
    onSubmit: (e: React.FormEvent) => void;
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <Label className="block mb-3">Rating</Label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setFormData({ ...formData, rating: value })}
                            className="focus:outline-none"
                        >
                            <Star
                                className={`w-8 h-8 cursor-pointer transition-colors ${
                                    value <= formData.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <Label htmlFor="comment">Comment (Optional)</Label>
                <Textarea
                    id="comment"
                    placeholder="Share your feedback..."
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    rows={4}
                    className="mt-1"
                />
            </div>

            <div className="flex items-center space-x-3">
                <Checkbox
                    id="would_recommend"
                    checked={formData.would_recommend}
                    onCheckedChange={(checked) =>
                        setFormData({ ...formData, would_recommend: checked })
                    }
                />
                <Label htmlFor="would_recommend" className="text-sm font-normal cursor-pointer">
                    I would recommend this trainer
                </Label>
            </div>

            <Button type="submit" className="w-full">
                Submit Review
            </Button>
        </form>
    );
}
