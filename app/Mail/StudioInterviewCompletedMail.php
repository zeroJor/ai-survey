<?php

namespace App\Mail;

use App\Models\Interview;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StudioInterviewCompletedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Interview $interview,
        public string $adminUrl,
        public int $answered,
        public int $total,
        public Address|string|null $fromAddress = null,
        public ?string $fromName = null,
    ) {}

    public function envelope(): Envelope
    {
        $business = $this->interview->invite->business_name;

        $envelope = new Envelope(
            subject: "Entrevista completada — {$business}",
        );

        if ($this->fromAddress instanceof Address) {
            return $envelope->from($this->fromAddress);
        }

        if (is_string($this->fromAddress) && $this->fromAddress !== '') {
            return $envelope->from(
                new Address(
                    $this->fromAddress,
                    $this->fromName ?? config('mail.from.name'),
                ),
            );
        }

        return $envelope;
    }

    public function content(): Content
    {
        return new Content(
            html: 'mail.studio-interview-completed',
        );
    }
}
