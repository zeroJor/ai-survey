<?php

namespace App\Mail;

use App\Models\Interview;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ClientInterviewCopyMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  list<array{label: string, body: string|null, skipped: bool}>  $questionRows
     */
    public function __construct(
        public Interview $interview,
        public array $questionRows,
        public string $displayName,
        public string $primaryColor,
        public Address|string|null $fromAddress = null,
        public ?string $fromName = null,
    ) {}

    public function envelope(): Envelope
    {
        $business = $this->interview->invite->business_name;

        $envelope = new Envelope(
            subject: "Copia de tu entrevista — {$business}",
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
            html: 'mail.client-interview-copy',
        );
    }
}
