<?php

namespace App\Services\Interview;

use App\Enums\InterviewStatus;
use App\Enums\InviteStatus;
use App\Models\Interview;
use App\Models\Invite;
use InvalidArgumentException;

class InviteEntryService
{
    public function __construct(
        private readonly ActionJwtService $jwt,
        private readonly InterviewSessionService $sessions,
        private readonly InterviewProgressResetService $progressReset,
    ) {}

    public function handle(?string $token, bool $reset = false): InviteEntryResult
    {
        if ($token === null || $token === '') {
            return $this->revoked();
        }

        try {
            $claims = $this->jwt->verify($token);
        } catch (InvalidArgumentException) {
            return $this->revoked();
        }

        $invite = Invite::query()->find($claims->inviteId);

        if ($invite === null) {
            return $this->revoked();
        }

        if (! $this->tokenMatchesInvite($invite, $claims)) {
            return $this->revoked();
        }

        if ($invite->status === InviteStatus::Revoked) {
            return $this->revoked();
        }

        $interview = Interview::query()->firstOrCreate(
            ['invite_id' => $invite->id],
            ['status' => InterviewStatus::NotStarted],
        );

        if ($reset && $this->resetAllowed()) {
            $this->progressReset->reset($interview->fresh());
            $interview->refresh();
        }

        if ($interview->status === InterviewStatus::Completed) {
            $session = $this->sessions->createSession($interview);

            return new InviteEntryResult('/talk?scenario=completed', $session);
        }

        $session = $this->sessions->createSession($interview);

        return new InviteEntryResult('/talk', $session);
    }

    private function tokenMatchesInvite(Invite $invite, ActionJwtClaims $claims): bool
    {
        if ($invite->token_jti !== $claims->jti) {
            return false;
        }

        if ($invite->access_token_expires_at === null || $invite->access_token_expires_at->isPast()) {
            return false;
        }

        return $claims->expiresAt >= now()->timestamp;
    }

    private function revoked(): InviteEntryResult
    {
        return new InviteEntryResult('/talk?scenario=revoked');
    }

    private function resetAllowed(): bool
    {
        return app()->environment(['local', 'testing']);
    }
}
