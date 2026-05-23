<?php

namespace App\Services\Admin;

use App\Enums\InterviewStatus;
use App\Enums\InviteStatus;
use App\Models\Interview;
use App\Models\InterviewTemplate;
use App\Models\Invite;
use App\Models\User;
use App\Services\Interview\ActionJwtService;
use App\Services\Interview\InterviewQuestionCatalog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class InviteAdminService
{
    public function __construct(
        private readonly ActionJwtService $jwt,
        private readonly InterviewQuestionCatalog $catalog,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     * @return array{invite: Invite, inviteUrl: string}
     */
    public function create(User $user, array $data): array
    {
        $template = InterviewTemplate::query()->active()->first();

        if ($template === null) {
            throw ValidationException::withMessages([
                'template' => ['No active interview template is configured.'],
            ]);
        }

        $invite = Invite::query()->create([
            'user_id' => $user->id,
            'interview_template_id' => $template->id,
            'contact_name' => $data['contactName'],
            'business_name' => $data['businessName'],
            'business_about' => $data['businessAbout'] ?? null,
            'client_email' => $data['clientEmail'] ?? null,
            'client_whatsapp' => $data['clientWhatsapp'] ?? null,
            'token_jti' => '',
            'access_token_expires_at' => now(),
            'status' => InviteStatus::Active,
        ]);

        $this->jwt->issue($invite);
        $invite->refresh();

        return [
            'invite' => $invite,
            'inviteUrl' => $this->jwt->inviteUrl($invite),
        ];
    }

    /**
     * @return LengthAwarePaginator<int, Invite>
     */
    public function paginate(?string $statusFilter, int $perPage = 20): LengthAwarePaginator
    {
        $query = Invite::query()
            ->with([
                'interview.answers',
                'interview.sessions',
                'interviewTemplate.phases.questions',
            ])
            ->latest('created_at');

        $this->applyStatusFilter($query, $statusFilter);

        return $query->paginate($perPage);
    }

    public function revoke(Invite $invite): Invite
    {
        if ($invite->status !== InviteStatus::Revoked) {
            $invite->update([
                'status' => InviteStatus::Revoked,
                'revoked_at' => now(),
            ]);
        }

        return $invite->fresh(['interview.answers', 'interview.sessions', 'interviewTemplate.phases.questions']);
    }

    /**
     * @return array<string, mixed>
     */
    public function serializeListItem(Invite $invite): array
    {
        $interview = $invite->interview;
        $template = $invite->interviewTemplate;
        $totalQuestions = $template
            ? count($this->catalog->orderedCodes($template))
            : 0;
        $answered = $interview?->answers->count() ?? 0;

        return [
            'id' => $invite->id,
            'contactName' => $invite->contact_name,
            'businessName' => $invite->business_name,
            'status' => $invite->status->value,
            'interviewStatus' => $interview?->status->value,
            'displayStatus' => $this->displayStatus($invite, $interview),
            'createdAt' => $invite->created_at?->toIso8601String(),
            'completedAt' => $interview?->completed_at?->toIso8601String(),
            'lastActivityAt' => $this->lastActivityAt($invite, $interview)?->toIso8601String(),
            'progress' => [
                'answered' => $answered,
                'total' => $totalQuestions,
            ],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function serializeDetail(Invite $invite): array
    {
        $invite->loadMissing([
            'interview.answers',
            'interview.sessions',
            'interviewTemplate.phases.questions',
        ]);

        $interview = $invite->interview;
        $template = $invite->interviewTemplate;
        $totalQuestions = $template
            ? count($this->catalog->orderedCodes($template))
            : 0;
        $answered = $interview?->answers->count() ?? 0;

        $payload = $this->serializeListItem($invite);
        $payload['businessAbout'] = $invite->business_about;
        $payload['clientEmail'] = $invite->client_email;
        $payload['clientWhatsapp'] = $invite->client_whatsapp;
        $payload['revokedAt'] = $invite->revoked_at?->toIso8601String();
        $payload['inviteUrl'] = $this->jwt->inviteUrl($invite);

        $payload['interview'] = $interview === null ? null : [
            'id' => $interview->id,
            'status' => $interview->status->value,
            'register' => $interview->register?->value,
            'startedAt' => $interview->started_at?->toIso8601String(),
            'completedAt' => $interview->completed_at?->toIso8601String(),
            'progress' => [
                'answered' => $answered,
                'total' => $totalQuestions,
            ],
        ];

        return $payload;
    }

    /**
     * @param  Builder<Invite>  $query
     */
    private function applyStatusFilter(Builder $query, ?string $statusFilter): void
    {
        if ($statusFilter === null || $statusFilter === '') {
            return;
        }

        match ($statusFilter) {
            'revoked' => $query->where('status', InviteStatus::Revoked),
            'active' => $query->where('status', InviteStatus::Active),
            'not_started' => $query
                ->where('status', InviteStatus::Active)
                ->where(function (Builder $inner) {
                    $inner->whereDoesntHave('interview')
                        ->orWhereHas('interview', fn (Builder $q) => $q->where('status', InterviewStatus::NotStarted));
                }),
            'in_progress' => $query
                ->where('status', InviteStatus::Active)
                ->whereHas('interview', fn (Builder $q) => $q->where('status', InterviewStatus::InProgress)),
            'completed' => $query
                ->where('status', InviteStatus::Active)
                ->whereHas('interview', fn (Builder $q) => $q->where('status', InterviewStatus::Completed)),
            default => null,
        };
    }

    private function displayStatus(Invite $invite, ?Interview $interview): string
    {
        if ($invite->status === InviteStatus::Revoked) {
            return 'revoked';
        }

        if ($interview === null) {
            return 'not_started';
        }

        return $interview->status->value;
    }

    private function lastActivityAt(Invite $invite, ?Interview $interview): ?Carbon
    {
        if ($interview === null) {
            return $invite->created_at;
        }

        $candidates = array_filter([
            $interview->updated_at,
            $interview->sessions->max('last_seen_at'),
            $interview->answers->max('updated_at'),
        ]);

        if ($candidates === []) {
            return $invite->created_at;
        }

        return collect($candidates)->filter()->max();
    }
}
