<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('answers', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('interview_id')->constrained('interviews')->cascadeOnDelete();
            $table->string('question_code', 16);
            $table->text('body')->nullable();
            $table->boolean('skipped')->default(false);
            $table->timestamps();

            $table->unique(['interview_id', 'question_code']);
        });

        Schema::create('ai_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('interview_id')->constrained('interviews')->cascadeOnDelete();
            $table->string('type', 16);
            $table->string('question_code', 16)->nullable();
            $table->text('content');
            $table->unsignedInteger('sequence');
            $table->string('sentiment_id', 32)->nullable();
            $table->string('register', 16)->nullable();
            $table->string('source', 16)->default('template');
            $table->timestamps();

            $table->index(['interview_id', 'sequence']);
        });

        Schema::create('interview_artifacts', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('interview_id')->unique()->constrained('interviews')->cascadeOnDelete();
            $table->json('analysis_json')->nullable();
            $table->string('schema_version', 16)->default('1');
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();
        });

        Schema::create('delivery_records', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('interview_id')->constrained('interviews')->cascadeOnDelete();
            $table->string('channel_key', 64);
            $table->string('channel_type', 32);
            $table->string('status', 32);
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_records');
        Schema::dropIfExists('interview_artifacts');
        Schema::dropIfExists('ai_messages');
        Schema::dropIfExists('answers');
    }
};
