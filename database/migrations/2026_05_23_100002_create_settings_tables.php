<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->longText('studio_process')->nullable();
            $table->boolean('llm_enabled')->default(true);
            $table->string('privacy_notice_url', 2048)->nullable();
            $table->string('logo_url', 2048)->nullable();
            $table->string('logo_alt')->nullable();
            $table->string('primary_color', 32)->nullable();
            $table->string('accent_color', 32)->nullable();
            $table->string('display_name')->nullable();
            $table->string('tagline', 512)->nullable();
            $table->timestamps();
        });

        Schema::create('settings_channels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('settings_id')->constrained('settings')->cascadeOnDelete();
            $table->string('channel_key', 64);
            $table->string('name');
            $table->string('type', 32);
            $table->json('config');
            $table->timestamps();

            $table->unique(['settings_id', 'channel_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings_channels');
        Schema::dropIfExists('settings');
    }
};
