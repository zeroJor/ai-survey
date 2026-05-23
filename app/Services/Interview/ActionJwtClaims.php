<?php

namespace App\Services\Interview;

readonly class ActionJwtClaims
{
    public function __construct(
        public string $inviteId,
        public string $jti,
        public int $expiresAt,
    ) {}
}
