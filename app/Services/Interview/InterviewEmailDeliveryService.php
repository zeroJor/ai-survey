<?php

namespace App\Services\Interview;

use App\Enums\DeliveryStatus;
use App\Enums\InterviewStatus;
use App\Enums\Register;
use App\Exceptions\InterviewFlowException;
use App\Mail\ClientInterviewCopyMail;
use App\Mail\StudioInterviewCompletedMail;
use App\Models\DeliveryRecord;
use App\Models\Interview;
use App\Models\Invite;
use App\Models\Question;
use App\Models\Settings;
use App\Models\SettingsChannel;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Support\Facades\Mail;

class InterviewEmailDeliveryService
{
    public const CLIENT_COPY_CHANNEL_KEY = 'client_copy';

    public function __construct(
        private readonly InterviewQuestionCatalog $catalog,
    ) {}

    public function sendStudioAlert(Interview $interview): ?DeliveryRecord
    {
        $interview->loadMissing('invite');
        $channel = $this->emailChannel();
        $toAddresses = $this->studioRecipients($channel);

        $record = DeliveryRecord::query()->create([
            'interview_id' => $interview->id,
            'channel_key' => $channel?->channel_key ?? 'studio_email',
            'channel_type' => 'email',
            'status' => DeliveryStatus::Pending,
        ]);

        if ($toAddresses === []) {
            $record->update(['status' => DeliveryStatus::Failed]);

            return $record->fresh();
        }

        try {
            $progress = $this->progressForInterview($interview);

            Mail::to($toAddresses)->send(
                new StudioInterviewCompletedMail(
                    interview: $interview,
                    adminUrl: $this->adminInviteUrl($interview->invite),
                    answered: $progress['answered'],
                    total: $progress['total'],
                    fromAddress: $this->fromAddress($channel),
                    fromName: $this->fromName($channel),
                ),
            );

            $record->update([
                'status' => DeliveryStatus::Sent,
                'sent_at' => now(),
            ]);
        } catch (\Throwable) {
            $record->update(['status' => DeliveryStatus::Failed]);
        }

        return $record->fresh();
    }

    public function sendClientCopy(Interview $interview): ?DeliveryRecord
    {
        $interview->loadMissing([
            'invite',
            'answers',
            'invite.interviewTemplate.phases.questions.texts',
        ]);

        $email = $interview->invite->client_email;

        if (! is_string($email) || trim($email) === '') {
            return null;
        }

        $channel = $this->emailChannel();
        $settings = Settings::current();

        $record = DeliveryRecord::query()->create([
            'interview_id' => $interview->id,
            'channel_key' => self::CLIENT_COPY_CHANNEL_KEY,
            'channel_type' => 'email',
            'status' => DeliveryStatus::Pending,
        ]);

        try {
            Mail::to($email)->send(
                new ClientInterviewCopyMail(
                    interview: $interview,
                    questionRows: $this->buildQuestionAnswerRows($interview),
                    displayName: $settings?->display_name ?? 'Idwasoft',
                    primaryColor: $settings?->primary_color ?? '#0077FF',
                    fromAddress: $this->fromAddress($channel),
                    fromName: $this->fromName($channel),
                ),
            );

            $record->update([
                'status' => DeliveryStatus::Sent,
                'sent_at' => now(),
            ]);
        } catch (\Throwable) {
            $record->update(['status' => DeliveryStatus::Failed]);
        }

        return $record->fresh();
    }

    /**
     * @return array{delivery: array<string, mixed>}
     */
    public function resendClientCopyForInvite(Invite $invite): array
    {
        $invite->loadMissing('interview');

        if ($invite->client_email === null || trim($invite->client_email) === '') {
            throw InterviewFlowException::unprocessable(
                'Esta invitación no tiene correo de cliente.',
            );
        }

        $interview = $invite->interview;

        if ($interview === null || $interview->status !== InterviewStatus::Completed) {
            throw InterviewFlowException::unprocessable(
                'La entrevista debe estar completada para reenviar la copia.',
            );
        }

        $record = $this->sendClientCopy($interview);

        if ($record === null) {
            throw InterviewFlowException::unprocessable(
                'No se pudo enviar la copia al cliente.',
            );
        }

        return [
            'delivery' => $this->serializeDelivery($record),
        ];
    }

    /**
     * @return list<array{label: string, body: string|null, skipped: bool}>
     */
    public function buildQuestionAnswerRows(Interview $interview): array
    {
        $interview->loadMissing([
            'invite.interviewTemplate.phases.questions.texts',
            'answers',
        ]);

        $template = $interview->invite->interviewTemplate;
        $codes = $this->catalog->orderedCodes($template);
        $questionsByCode = $template->phases
            ->flatMap(fn ($phase) => $phase->questions)
            ->keyBy('code');
        $answersByCode = $interview->answers->keyBy('question_code');
        $register = $interview->register ?? Register::Tu;

        $rows = [];

        foreach ($codes as $code) {
            /** @var Question|null $question */
            $question = $questionsByCode->get($code);
            $answer = $answersByCode->get($code);

            if ($answer === null) {
                continue;
            }

            $rows[] = [
                'label' => $this->questionLabel($question, $register),
                'body' => $answer->body,
                'skipped' => (bool) $answer->skipped,
            ];
        }

        return $rows;
    }

    /**
     * @return array{answered: int, total: int}
     */
    public function progressForInterview(Interview $interview): array
    {
        $interview->loadMissing('invite.interviewTemplate.phases.questions', 'answers');
        $template = $interview->invite->interviewTemplate;
        $total = count($this->catalog->orderedCodes($template));
        $answered = $interview->answers->count();

        return [
            'answered' => $answered,
            'total' => $total,
        ];
    }

    public function adminInviteUrl(Invite $invite): string
    {
        return rtrim((string) config('app.url'), '/').'/admin/invites/'.$invite->id;
    }

    /**
     * @return array<string, mixed>
     */
    public function serializeDelivery(DeliveryRecord $record): array
    {
        return [
            'id' => $record->id,
            'channelKey' => $record->channel_key,
            'status' => $record->status->value,
            'sentAt' => $record->sent_at?->toIso8601String(),
        ];
    }

    private function emailChannel(): ?SettingsChannel
    {
        $settings = Settings::query()->with('channels')->find(1);

        return $settings?->channels
            ->first(fn ($row) => $row->type === 'email');
    }

    /**
     * @return list<string>
     */
    private function studioRecipients(?SettingsChannel $channel): array
    {
        if ($channel === null || ! is_array($channel->config)) {
            return [];
        }

        $addresses = $channel->config['toAddresses'] ?? [];

        if (! is_array($addresses)) {
            return [];
        }

        return array_values(array_filter(
            $addresses,
            fn ($email) => is_string($email) && filter_var($email, FILTER_VALIDATE_EMAIL),
        ));
    }

    private function fromAddress(?SettingsChannel $channel): Address|string|null
    {
        $address = is_array($channel?->config)
            ? ($channel->config['fromAddress'] ?? null)
            : null;

        if (is_string($address) && $address !== '') {
            $name = $this->fromNameString($channel);

            return $name !== null
                ? new Address($address, $name)
                : new Address($address);
        }

        return config('mail.from.address');
    }

    private function fromName(?SettingsChannel $channel): ?string
    {
        return $this->fromNameString($channel);
    }

    private function fromNameString(?SettingsChannel $channel): ?string
    {
        $name = is_array($channel?->config)
            ? ($channel->config['fromName'] ?? null)
            : null;

        return is_string($name) && $name !== '' ? $name : config('mail.from.name');
    }

    private function questionLabel(?Question $question, Register $register): string
    {
        if ($question === null) {
            return '';
        }

        foreach ([$register, Register::Neutral, Register::Tu, Register::Usted] as $candidate) {
            $text = $question->texts
                ->first(fn ($row) => $row->field === 'label' && $row->register === $candidate);

            if ($text !== null && $text->body !== '') {
                return $text->body;
            }
        }

        return $question->code;
    }
}
