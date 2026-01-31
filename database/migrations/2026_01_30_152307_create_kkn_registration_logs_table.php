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
        Schema::create('kkn_registration_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('registration_id')->constrained('kkn_registrations')->onDelete('cascade');
            $table->foreignId('created_by')->constrained('users');
            $table->enum('action', ['created', 'approved', 'rejected', 'needs_revision', 'comment', 'document_uploaded']);
            $table->string('old_status')->nullable();
            $table->string('new_status')->nullable();
            $table->text('note')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kkn_registration_logs');
    }
};
