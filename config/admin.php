<?php

return [

    'allowed_email_domain' => env('ADMIN_ALLOWED_EMAIL_DOMAIN', 'idwasoft.com'),

    /** Local/testing only — email + password login for /admin */
    'password_login' => (bool) env('ADMIN_PASSWORD_LOGIN', true),

];
