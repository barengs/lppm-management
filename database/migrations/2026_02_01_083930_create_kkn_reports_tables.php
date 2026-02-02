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
        Schema::create('kkn_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kkn_posto_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // The reporter
            $table->enum('type', ['weekly', 'final']);
            $table->enum('reporter_type', ['student', 'dosen']); // Discriminator
            $table->integer('week')->nullable(); // For weekly reports
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('status', ['draft', 'submitted', 'revised', 'approved', 'rejected'])->default('draft');
            $table->timestamp('submitted_at')->nullable();
            $table->text('notes')->nullable(); // Reviewer notes
            $table->timestamps();
        });

        Schema::create('kkn_report_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kkn_report_id')->constrained()->onDelete('cascade');
            $table->string('file_path');
            $table->string('file_name');
            $table->string('file_type')->nullable(); // mime type
            $table->string('description')->nullable(); // caption
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kkn_report_attachments');
        Schema::dropIfExists('kkn_reports');
    }
};
