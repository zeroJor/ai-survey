<?php

namespace Tests\Feature\Interview;

use App\Enums\DeliveryStatus;
use App\Mail\ClientInterviewCopyMail;
use App\Mail\StudioInterviewCompletedMail;
use App\Models\DeliveryRecord;
use App\Models\Invite;
use App\Models\Settings;
use App\Models\SettingsChannel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\Concerns\InteractsWithInterviewEntry;
use Tests\TestCase;

class InterviewEmailDeliveryTest extends TestCase
{
    use InteractsWithInterviewEntry;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_complete_sends_studio_and_client_emails(): void
    {
        Mail::fake();

        $invite = $this->createTestInvite();
        $invite->update(['client_email' => 'client@example.com']);

        $this->enterInvite($this->issueInviteToken($invite));
        $session = $this->latestInterviewSession();
        $this->assertNotNull($session);

        $this->ensureCsrfForSession($session);
        $this->patchTalkApi(['register' => 'tu'], $session)->assertOk();

        foreach ($this->seededQuestionCodes() as $code) {
            $this->postAnswersApi([
                'questionCode' => $code,
                'answer' => 'Respuesta.',
                'skipped' => false,
            ], $session)->assertOk();
        }

        $this->postTalkCompleteApi($session)->assertOk();

        Mail::assertSent(StudioInterviewCompletedMail::class);
        Mail::assertSent(ClientInterviewCopyMail::class, function (ClientInterviewCopyMail $mail) {
            return $mail->hasTo('client@example.com');
        });

        $this->assertDatabaseHas('delivery_records', [
            'interview_id' => $session->interview_id,
            'channel_key' => 'studio_email',
            'status' => DeliveryStatus::Sent->value,
        ]);

        $this->assertDatabaseHas('delivery_records', [
            'interview_id' => $session->interview_id,
            'channel_key' => 'client_copy',
            'status' => DeliveryStatus::Sent->value,
        ]);
    }

    public function test_complete_without_client_email_sends_studio_only(): void
    {
        Mail::fake();

        $invite = Invite::factory()->create([
            'client_email' => null,
            'client_whatsapp' => '+5215512345678',
        ]);

        $this->enterInvite($this->issueInviteToken($invite));
        $session = $this->latestInterviewSession();
        $this->ensureCsrfForSession($session);
        $this->patchTalkApi(['register' => 'tu'], $session)->assertOk();

        foreach ($this->seededQuestionCodes() as $code) {
            $this->postAnswersApi([
                'questionCode' => $code,
                'answer' => 'Respuesta.',
                'skipped' => false,
            ], $session)->assertOk();
        }

        $this->postTalkCompleteApi($session)->assertOk();

        Mail::assertSent(StudioInterviewCompletedMail::class);
        Mail::assertNotSent(ClientInterviewCopyMail::class);

        $this->assertSame(
            1,
            DeliveryRecord::query()->where('interview_id', $session->interview_id)->count(),
        );
    }

    public function test_studio_alert_fails_gracefully_without_recipients(): void
    {
        Mail::fake();

        $settings = Settings::query()->findOrFail(1);
        SettingsChannel::query()->where('settings_id', $settings->id)->update([
            'config' => [
                'toAddresses' => [],
                'fromAddress' => 'hola@idwasoft.com',
                'fromName' => 'Idwasoft',
            ],
        ]);

        $invite = $this->createTestInvite();
        $this->enterInvite($this->issueInviteToken($invite));
        $session = $this->latestInterviewSession();
        $this->ensureCsrfForSession($session);
        $this->patchTalkApi(['register' => 'tu'], $session)->assertOk();

        foreach ($this->seededQuestionCodes() as $code) {
            $this->postAnswersApi([
                'questionCode' => $code,
                'answer' => 'Respuesta.',
                'skipped' => false,
            ], $session)->assertOk();
        }

        $this->postTalkCompleteApi($session)->assertOk();

        Mail::assertNotSent(StudioInterviewCompletedMail::class);

        $this->assertDatabaseHas('delivery_records', [
            'interview_id' => $session->interview_id,
            'channel_key' => 'studio_email',
            'status' => DeliveryStatus::Failed->value,
        ]);
    }
}
