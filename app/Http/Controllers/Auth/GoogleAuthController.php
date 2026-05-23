<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\AdminEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(): RedirectResponse
    {
        $googleUser = Socialite::driver('google')->user();
        $email = strtolower(trim((string) $googleUser->getEmail()));

        if (! AdminEmail::isAllowed($email)) {
            return redirect('/admin?auth=denied');
        }

        $user = User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => $googleUser->getName() ?: $email,
                'password' => null,
                'email_verified_at' => now(),
            ],
        );

        Auth::login($user, remember: true);

        return redirect()->intended('/admin');
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/admin');
    }
}
