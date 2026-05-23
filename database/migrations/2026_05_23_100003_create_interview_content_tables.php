<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interview_templates', function (Blueprint $table) {
            $table->id();
            $table->string('version', 32);
            $table->timestamp('published_at')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamps();

            $table->index('is_active');
        });

        Schema::create('phases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('interview_template_id')->constrained('interview_templates')->restrictOnDelete();
            $table->string('code', 16);
            $table->unsignedSmallInteger('sort_order');
            $table->timestamps();

            $table->unique(['interview_template_id', 'code']);
        });

        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('phase_id')->constrained('phases')->cascadeOnDelete();
            $table->string('code', 16);
            $table->unsignedSmallInteger('sort_order');
            $table->string('input_type', 32)->default('long_text');
            $table->string('sensitivity', 16)->nullable();
            $table->timestamps();

            $table->unique(['phase_id', 'code']);
            $table->index('code');
        });

        Schema::create('question_texts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
            $table->string('field', 32);
            $table->string('register', 16);
            $table->text('body');
            $table->timestamps();

            $table->unique(['question_id', 'field', 'register']);
        });

        Schema::create('template_copies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('interview_template_id')->constrained('interview_templates')->restrictOnDelete();
            $table->string('key', 64);
            $table->string('register', 16);
            $table->text('body');
            $table->timestamps();

            $table->unique(['interview_template_id', 'key', 'register']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('template_copies');
        Schema::dropIfExists('question_texts');
        Schema::dropIfExists('questions');
        Schema::dropIfExists('phases');
        Schema::dropIfExists('interview_templates');
    }
};
