<?php

namespace App\Services\Interview;

use App\Models\Invite;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Str;
use InvalidArgumentException;
use UnexpectedValueException;

class ActionJwtService
{
    public function issue(Invite $invite): string
    {
        $secret = $this->secret();
        $jti = (string) Str::uuid();
        $ttlDays = config('interview.action_jwt_ttl_days', 7);
        $expiresAt = now()->addDays($ttlDays);

        $invite->forceFill([
            'token_jti' => $jti,
            'access_token_expires_at' => $expiresAt,
        ])->save();

        $payload = [
            'sub' => $invite->id,
            'jti' => $jti,
            'iat' => now()->timestamp,
            'exp' => $expiresAt->timestamp,
        ];

        return JWT::encode($payload, $secret, 'HS256');
    }

    public function inviteUrl(Invite $invite): string
    {
        if (
            $invite->token_jti === ''
            || $invite->access_token_expires_at === null
            || $invite->access_token_expires_at->isPast()
        ) {
            $token = $this->issue($invite);
        } else {
            $token = JWT::encode([
                'sub' => $invite->id,
                'jti' => $invite->token_jti,
                'iat' => now()->timestamp,
                'exp' => $invite->access_token_expires_at->timestamp,
            ], $this->secret(), 'HS256');
        }

        return url('/invites?t='.urlencode($token));
    }

    public function verify(string $token): ActionJwtClaims
    {
        try {
            $decoded = JWT::decode($token, new Key($this->secret(), 'HS256'));
        } catch (UnexpectedValueException $e) {
            throw new InvalidArgumentException('Invalid action token.', 0, $e);
        }

        $inviteId = $decoded->sub ?? null;
        $jti = $decoded->jti ?? null;
        $exp = $decoded->exp ?? null;

        if (! is_string($inviteId) || $inviteId === '' || ! is_string($jti) || $jti === '' || ! is_int($exp)) {
            throw new InvalidArgumentException('Invalid action token payload.');
        }

        return new ActionJwtClaims($inviteId, $jti, $exp);
    }

    private function secret(): string
    {
        $configured = config('interview.action_jwt_secret');

        if (! is_string($configured) || $configured === '') {
            throw new InvalidArgumentException('ACTION_JWT_SECRET is not configured.');
        }

        $decoded = base64_decode($configured, true);
        if ($decoded !== false && strlen($decoded) >= 32) {
            return $decoded;
        }

        if (strlen($configured) >= 32) {
            return $configured;
        }

        throw new InvalidArgumentException(
            'ACTION_JWT_SECRET must be at least 32 bytes (e.g. base64_encode(random_bytes(32))).',
        );
    }
}
