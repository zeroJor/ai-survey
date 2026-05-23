<?php

namespace App\Console\Commands;

use App\Models\InterviewTemplate;
use App\Models\Invite;
use App\Models\User;
use App\Services\Interview\ActionJwtService;
use Illuminate\Console\Command;

class InviteDevUrlCommand extends Command
{
    protected $signature = 'invite:dev-url';

    protected $description = 'Create a dev invite and print the /invites?t=… URL';

    public function handle(ActionJwtService $jwt): int
    {
        $template = InterviewTemplate::query()->active()->first();

        if ($template === null) {
            $this->error('No active interview template. Run: php artisan migrate:fresh --seed');

            return self::FAILURE;
        }

        $user = User::query()->firstOrCreate(
            ['email' => 'dev@idwasoft.com'],
            ['name' => 'Dev Studio', 'password' => null],
        );

        $invite = Invite::query()->create([
            'user_id' => $user->id,
            'interview_template_id' => $template->id,
            'contact_name' => 'María',
            'business_name' => 'Café Luna',
            'business_about' => 'Cafetería de especialidad en el centro.',
            'client_email' => 'maria@example.com',
            'token_jti' => '',
            'access_token_expires_at' => now(),
        ]);

        $token = $jwt->issue($invite);
        $url = url('/invites?t='.urlencode($token));

        $this->info($url);
        $this->line('Para repetir la entrevista en local: añade &reset a la URL del invite o abre /talk?reset');

        return self::SUCCESS;
    }
}
