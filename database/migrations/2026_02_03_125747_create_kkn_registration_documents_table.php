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
        Schema::create('kkn_registration_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kkn_registration_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('file_path');
            $table->string('file_type')->nullable(); // pdf, jpg, etc
            $table->string('doc_type')->default('custom'); // required, optional, custom
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kkn_registration_documents');
    }
};
