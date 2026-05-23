<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invites', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('interview_template_id')->constrained('interview_templates')->restrictOnDelete();
            $table->string('contact_name');
            $table->string('business_name');
            $table->text('business_about')->nullable();
            $table->string('client_email')->nullable();
            $table->string('client_whatsapp', 64)->nullable();
            $table->string('token_jti', 64)->unique();
            $table->timestamp('access_token_expires_at');
            $table->string('status', 16)->default('active');
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
        });

        Schema::create('interviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('invite_id')->unique()->constrained('invites')->restrictOnDelete();
            $table->string('status', 16)->default('not_started');
            $table->string('register', 16)->nullable();
            $table->string('current_question_code', 16)->nullable();
            $table->timestamp('privacy_acknowledged_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index('status');
        });

        Schema::create('interview_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('interview_id')->constrained('interviews')->cascadeOnDelete();
            $table->timestamp('expires_at');
            $table->timestamp('last_seen_at');
            $table->timestamps();

            $table->index('interview_id');
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interview_sessions');
        Schema::dropIfExists('interviews');
        Schema::dropIfExists('invites');
    }
};
