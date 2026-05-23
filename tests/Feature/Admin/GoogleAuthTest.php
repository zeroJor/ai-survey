<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Tests\TestCase;

class GoogleAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_callback_with_idwasoft_email_logs_in_and_redirects(): void
    {
        Socialite::fake('google', (new SocialiteUser)->map([
            'id' => 'google-123',
            'name' => 'Studio User',
            'email' => 'studio.user@idwasoft.com',
        ]));

        $response = $this->get('/auth/google/callback');

        $response->assertRedirect('/admin');
        $this->assertAuthenticatedAs(
            User::query()->where('email', 'studio.user@idwasoft.com')->first(),
        );
    }

    public function test_callback_with_personal_email_is_denied(): void
    {
        Socialite::fake('google', (new SocialiteUser)->map([
            'id' => 'google-456',
            'name' => 'Personal User',
            'email' => 'personal@gmail.com',
        ]));

        $response = $this->get('/auth/google/callback');

        $response->assertRedirect('/admin?auth=denied');
        $this->assertGuest();
    }
}
