<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pkm_master_data', function (Blueprint $table) {
            $table->id();
            $table->string('type');         // scheme_group | scope | focus_area | output_group | cost_group
            $table->string('name');         // Nama item/opsi
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['type', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pkm_master_data');
    }
};
