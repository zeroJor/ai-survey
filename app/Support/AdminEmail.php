<?php

namespace App\Support;

class AdminEmail
{
    public static function isAllowed(string $email): bool
    {
        $domain = strtolower((string) config('admin.allowed_email_domain', 'idwasoft.com'));
        $normalized = strtolower(trim($email));

        return $domain !== '' && str_ends_with($normalized, '@'.$domain);
    }
}
