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
        Schema::create('kkn_field_monitorings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kkn_posto_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // The auditor/staff
            $table->text('description')->nullable();
            $table->string('latitude')->nullable();
            $table->string('longitude')->nullable();
            $table->timestamp('monitored_at');
            $table->enum('status', ['draft', 'submitted'])->default('submitted');
            $table->timestamps();
        });

        Schema::create('kkn_field_monitoring_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kkn_field_monitoring_id')->constrained()->onDelete('cascade');
            $table->string('file_path');
            $table->string('file_name');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kkn_field_monitoring_images');
        Schema::dropIfExists('kkn_field_monitorings');
    }
};
