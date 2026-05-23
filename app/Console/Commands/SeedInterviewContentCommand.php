<?php

namespace App\Console\Commands;

use Database\Seeders\InterviewTemplateSeeder;
use Illuminate\Console\Command;

class SeedInterviewContentCommand extends Command
{
    protected $signature = 'content:seed-interview';

    protected $description = 'Seed or refresh the active interview template from interview-v1.json';

    public function handle(): int
    {
        $this->call('db:seed', ['--class' => InterviewTemplateSeeder::class, '--force' => true]);

        $this->info('Interview template seeded.');

        return self::SUCCESS;
    }
}
