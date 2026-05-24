<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public const DEV_EMAIL = 'dev@idwasoft.com';

    /** Default local password — change after first login in non-dev environments. */
    public const DEV_PASSWORD = 'password';

    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => self::DEV_EMAIL],
            [
                'name' => 'Dev Studio',
                // Plain string: User casts password with "hashed" (do not use Hash::make here).
                'password' => self::DEV_PASSWORD,
                'email_verified_at' => now(),
            ],
        );
    }
}
