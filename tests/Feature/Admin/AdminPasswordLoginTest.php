<?php

namespace Tests\Feature\Admin;

use Database\Seeders\AdminUserSeeder;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\Concerns\InteractsWithAdmin;
use Tests\TestCase;

class AdminPasswordLoginTest extends TestCase
{
    use InteractsWithAdmin;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(ValidateCsrfToken::class);
        $this->seed();
    }

    public function test_password_login_grants_admin_api_access_in_local(): void
    {
        $this->app->detectEnvironment(fn () => 'local');
        config(['admin.password_login' => true]);

        $this->postJson('/auth/login', [
            'email' => AdminUserSeeder::DEV_EMAIL,
            'password' => AdminUserSeeder::DEV_PASSWORD,
        ])->assertOk();

        $this->getJson('/api/admin/settings')->assertOk();
        $this->assertAuthenticatedAs(
            \App\Models\User::query()->where('email', AdminUserSeeder::DEV_EMAIL)->first(),
        );
    }

    public function test_password_login_rejects_wrong_password(): void
    {
        $this->app->detectEnvironment(fn () => 'local');
        config(['admin.password_login' => true]);

        $this->postJson('/auth/login', [
            'email' => AdminUserSeeder::DEV_EMAIL,
            'password' => 'wrong',
        ])->assertUnprocessable();
    }

    public function test_password_login_disabled_in_production(): void
    {
        $this->app->detectEnvironment(fn () => 'production');
        config(['admin.password_login' => true]);

        $this->postJson('/auth/login', [
            'email' => AdminUserSeeder::DEV_EMAIL,
            'password' => AdminUserSeeder::DEV_PASSWORD,
        ])->assertNotFound();
    }

    public function test_password_login_rejects_non_idwasoft_email(): void
    {
        $this->app->detectEnvironment(fn () => 'local');
        config(['admin.password_login' => true]);

        $this->postJson('/auth/login', [
            'email' => 'personal@gmail.com',
            'password' => 'password',
        ])->assertUnprocessable();
    }

    protected function tearDown(): void
    {
        Auth::logout();

        parent::tearDown();
    }
}
