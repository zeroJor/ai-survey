<?php

namespace Tests\Feature\Admin;

use App\Enums\DeliveryStatus;
use App\Enums\InterviewStatus;
use App\Mail\ClientInterviewCopyMail;
use App\Models\DeliveryRecord;
use App\Models\Interview;
use App\Models\Invite;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\Concerns\InteractsWithAdmin;
use Tests\TestCase;

class AdminInviteResendCopyApiTest extends TestCase
{
    use InteractsWithAdmin;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_resend_copy_sends_mail_and_creates_delivery_record(): void
    {
        Mail::fake();

        $invite = Invite::factory()->create([
            'client_email' => 'client@example.com',
        ]);

        Interview::factory()->create([
            'invite_id' => $invite->id,
            'status' => InterviewStatus::Completed,
            'completed_at' => now(),
            'register' => 'tu',
        ]);

        $response = $this->actingAsAdmin()->postJson(
            "/api/admin/invites/{$invite->id}/resend-copy",
        );

        $response->assertOk();
        $response->assertJsonPath('delivery.channelKey', 'client_copy');
        $response->assertJsonPath('delivery.status', DeliveryStatus::Sent->value);

        Mail::assertSent(ClientInterviewCopyMail::class, function (ClientInterviewCopyMail $mail) {
            return $mail->hasTo('client@example.com');
        });

        $this->assertDatabaseHas('delivery_records', [
            'channel_key' => 'client_copy',
            'status' => DeliveryStatus::Sent->value,
        ]);
    }

    public function test_second_resend_creates_another_delivery_record(): void
    {
        Mail::fake();

        $invite = Invite::factory()->create([
            'client_email' => 'client@example.com',
        ]);

        $interview = Interview::factory()->create([
            'invite_id' => $invite->id,
            'status' => InterviewStatus::Completed,
            'completed_at' => now(),
            'register' => 'tu',
        ]);

        $this->actingAsAdmin()->postJson(
            "/api/admin/invites/{$invite->id}/resend-copy",
        )->assertOk();

        $this->actingAsAdmin()->postJson(
            "/api/admin/invites/{$invite->id}/resend-copy",
        )->assertOk();

        $this->assertSame(
            2,
            DeliveryRecord::query()->where('interview_id', $interview->id)->count(),
        );
    }

    public function test_resend_requires_completed_interview(): void
    {
        Mail::fake();

        $invite = Invite::factory()->create([
            'client_email' => 'client@example.com',
        ]);

        Interview::factory()->create([
            'invite_id' => $invite->id,
            'status' => InterviewStatus::InProgress,
            'register' => 'tu',
        ]);

        $this->actingAsAdmin()->postJson(
            "/api/admin/invites/{$invite->id}/resend-copy",
        )->assertStatus(422);

        Mail::assertNothingSent();
    }

    public function test_resend_requires_client_email(): void
    {
        Mail::fake();

        $invite = Invite::factory()->create([
            'client_email' => null,
            'client_whatsapp' => '+5215512345678',
        ]);

        Interview::factory()->create([
            'invite_id' => $invite->id,
            'status' => InterviewStatus::Completed,
            'completed_at' => now(),
            'register' => 'tu',
        ]);

        $this->actingAsAdmin()->postJson(
            "/api/admin/invites/{$invite->id}/resend-copy",
        )->assertStatus(422);

        Mail::assertNothingSent();
    }
}
