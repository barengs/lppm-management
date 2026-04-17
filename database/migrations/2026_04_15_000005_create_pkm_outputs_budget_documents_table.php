<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pkm_outputs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pkm_proposal_id')->constrained()->onDelete('cascade');
            $table->unsignedSmallInteger('year')->nullable(); // tahun pelaksanaan (1, 2, dst)
            $table->string('output_group')->nullable(); // kelompok luaran (artikel, HKI, dll)
            $table->string('output_type')->nullable();  // jenis luaran (jurnal, prosiding, buku, dll)
            $table->string('target_status')->nullable(); // target capaian (submit, accepted, granted, dll)
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('pkm_budget_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pkm_proposal_id')->constrained()->onDelete('cascade');
            $table->unsignedSmallInteger('year')->nullable(); // tahun anggaran
            $table->string('cost_group'); // Honorarium, Perjalanan, Bahan Habis, Sewa Peralatan, dll
            $table->string('component')->nullable(); // sub-komponen
            $table->string('item_name');
            $table->string('unit')->nullable();
            $table->decimal('volume', 10, 2)->default(1);
            $table->decimal('unit_cost', 15, 2)->default(0);
            $table->decimal('total_cost', 15, 2)->default(0);
            $table->string('url_price')->nullable();
            $table->timestamps();
        });

        Schema::create('pkm_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pkm_proposal_id')->constrained()->onDelete('cascade');
            $table->string('document_type'); // surat_orisinalitas, mou_mitra, surat_pernyataan, dll
            $table->string('file_path');
            $table->string('original_name')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pkm_documents');
        Schema::dropIfExists('pkm_budget_items');
        Schema::dropIfExists('pkm_outputs');
    }
};
