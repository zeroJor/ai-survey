<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Support\AdminEmail;
use App\Support\AdminPasswordLogin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AdminLoginController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        if (! AdminPasswordLogin::isEnabled()) {
            abort(404);
        }

        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $email = strtolower(trim($validated['email']));

        if (! AdminEmail::isAllowed($email)) {
            throw ValidationException::withMessages([
                'email' => ['Solo cuentas del dominio permitido pueden acceder.'],
            ]);
        }

        if (! Auth::attempt(['email' => $email, 'password' => $validated['password']], true)) {
            throw ValidationException::withMessages([
                'email' => ['Correo o contraseña incorrectos.'],
            ]);
        }

        $request->session()->regenerate();

        return response()->json(['ok' => true]);
    }
}
