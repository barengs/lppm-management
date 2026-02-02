<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('kkn_guidance_topics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kkn_posto_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Creator
            $table->string('title');
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->timestamps();
        });

        Schema::create('kkn_guidance_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kkn_guidance_topic_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Sender
            $table->text('message');
            $table->json('attachments')->nullable(); // Array of file paths/meta
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kkn_guidance_messages');
        Schema::dropIfExists('kkn_guidance_topics');
    }
};
