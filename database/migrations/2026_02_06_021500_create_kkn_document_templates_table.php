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
        Schema::create('kkn_document_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fiscal_year_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('name'); // e.g., "Surat Izin Orang Tua"
            $table->string('slug')->unique(); // e.g., "surat-izin-orang-tua"
            $table->boolean('is_required')->default(true);
            $table->integer('order')->default(0);
            $table->text('description')->nullable();
            $table->timestamps();
            
            $table->index(['fiscal_year_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kkn_document_templates');
    }
};
