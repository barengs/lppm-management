<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create KKN Grading Settings table
        Schema::create('kkn_grading_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kkn_period_id')->unique()->constrained('kkn_periods')->onDelete('cascade');
            $table->unsignedInteger('w1_max')->default(10)->comment('Max score: Week 1');
            $table->unsignedInteger('w2_max')->default(10)->comment('Max score: Week 2');
            $table->unsignedInteger('w3_max')->default(10)->comment('Max score: Week 3');
            $table->unsignedInteger('w4_max')->default(10)->comment('Max score: Week 4');
            $table->unsignedInteger('secondary_max')->default(60)->comment('Max score: Nilai Sekunder (Lapangan)');
            $table->unsignedInteger('article_max')->default(100)->comment('Max score: Nilai Artikel Ilmiah');
            $table->timestamps();
        });

        // 2. Expand kkn_grades table with breakdown columns
        Schema::table('kkn_grades', function (Blueprint $table) {
            $table->double('w1_score')->nullable()->after('numeric_score')->comment('Nilai Primer Minggu 1 (by DPL)');
            $table->double('w2_score')->nullable()->after('w1_score')->comment('Nilai Primer Minggu 2 (by DPL)');
            $table->double('w3_score')->nullable()->after('w2_score')->comment('Nilai Primer Minggu 3 (by DPL)');
            $table->double('w4_score')->nullable()->after('w3_score')->comment('Nilai Primer Minggu 4 (by DPL)');
            $table->double('secondary_score')->nullable()->after('w4_score')->comment('Nilai Sekunder (by DPL)');
            $table->double('article_score')->nullable()->after('secondary_score')->comment('Nilai Artikel Ilmiah (by LPPM)');
            $table->double('total_weight')->nullable()->after('article_score')->comment('W1+W2+W3+W4+Secondary');
            $table->double('final_score')->nullable()->after('total_weight')->comment('(TotalWeight + Article) / 2');
            $table->foreignId('dpl_id')->nullable()->after('graded_by')->constrained('users')->nullOnDelete()->comment('DPL who submitted field scores');
            $table->foreignId('article_graded_by')->nullable()->after('dpl_id')->constrained('users')->nullOnDelete()->comment('LPPM staff who submitted article score');
            $table->boolean('is_finalized')->default(false)->after('certificate_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kkn_grading_settings');

        Schema::table('kkn_grades', function (Blueprint $table) {
            $table->dropForeign(['dpl_id']);
            $table->dropForeign(['article_graded_by']);
            $table->dropColumn([
                'w1_score', 'w2_score', 'w3_score', 'w4_score',
                'secondary_score', 'article_score',
                'total_weight', 'final_score',
                'dpl_id', 'article_graded_by', 'is_finalized',
            ]);
        });
    }
};
