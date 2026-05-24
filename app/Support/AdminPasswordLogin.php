<?php

namespace App\Support;

class AdminPasswordLogin
{
    public static function isEnabled(): bool
    {
        if (! app()->environment(['local', 'testing'])) {
            return false;
        }

        return (bool) config('admin.password_login', true);
    }
}
