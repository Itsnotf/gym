<?php

namespace App\Actions\Fortify;

use App\Models\User;
use App\Models\member;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
        ]);

        // Assign 'user' role to newly registered user
        $user->assignRole('user');

        // Create member record for the user
        member::create([
            'user_id' => $user->id,
            'membership_status' => 'inactive',
            'auto_renew' => false,
            'attendance_count' => 0,
            'sessions_missed' => 0,
            'membership_progress' => 0,
        ]);

        return $user;
    }
}
