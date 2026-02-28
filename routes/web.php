<?php

use App\Http\Controllers\AdminBookingController;
use App\Http\Controllers\AdminSubscriptionController;
use App\Http\Controllers\BankAccountController;
use App\Http\Controllers\ClassBookingController;
use App\Http\Controllers\ClassSessionController;
use App\Http\Controllers\ClassTypeController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FacilityController;
use App\Http\Controllers\FacilityBookingController;
use App\Http\Controllers\MemberBookingController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\PaymentTransactionController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\PublicBookingController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\TrainerController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/classes', [PublicBookingController::class, 'classes'])->name('public.classes');
Route::get('/facilities', [PublicBookingController::class, 'facilities'])->name('public.facilities');
Route::post('/bookings/classes', [ClassBookingController::class, 'store'])->name('bookings.classes.store');
Route::post('/bookings/facilities', [FacilityBookingController::class, 'store'])->name('bookings.facilities.store');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::get('my/bookings', [MemberBookingController::class, 'index'])->name('member.bookings.index');
    Route::patch('my/bookings/classes/{classBooking}/cancel', [MemberBookingController::class, 'cancelClass'])->name('member.bookings.classes.cancel');
    Route::patch('my/bookings/facilities/{facilityBooking}/cancel', [MemberBookingController::class, 'cancelFacility'])->name('member.bookings.facilities.cancel');
    Route::post('subscriptions', [SubscriptionController::class, 'store'])->name('subscriptions.store');

    Route::resource('users', UserController::class);
    Route::resource('roles', RoleController::class);
    Route::resource('class-types', ClassTypeController::class);
    Route::resource('class-sessions', ClassSessionController::class);
    Route::resource('trainers', TrainerController::class);
    Route::resource('members', MemberController::class);
    Route::resource('schedules', ScheduleController::class);

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('bank-accounts', BankAccountController::class);
        Route::resource('facilities', FacilityController::class);
        Route::resource('packages', PackageController::class);
        Route::get('subscriptions', [AdminSubscriptionController::class, 'index'])->name('subscriptions.index');
    });

    Route::get('admin/bookings', [AdminBookingController::class, 'index'])
        ->name('admin.bookings.index')
        ->middleware('permission:bookings review');

    Route::get('admin/payment-transactions', [PaymentTransactionController::class, 'index'])
        ->name('admin.payment-transactions.index')
        ->middleware('permission:payments review');

    Route::patch('admin/payment-transactions/{paymentTransaction}', [PaymentTransactionController::class, 'update'])
        ->name('admin.payment-transactions.update')
        ->middleware('permission:payments review');
});

require __DIR__ . '/settings.php';
