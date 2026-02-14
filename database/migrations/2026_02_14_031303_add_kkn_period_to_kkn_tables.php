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
        // 1. Add column to tables
        $tables = ['kkn_locations', 'kkn_postos', 'kkn_registrations', 'kkn_document_templates'];
        
        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->foreignId('kkn_period_id')->nullable()->after('id')->constrained('kkn_periods')->onDelete('cascade');
            });
        }

        // 2. Migrate existing data from Fiscal Years
        // We assume FiscalYear has 'year' column. We will create KKN Period for each used Fiscal Year.
        
        // Get all unique fiscal_year_ids from kkn_registrations (as a primary source of activity)
        // Also check locations and postos to be safe
        $fiscalYearIds = \Illuminate\Support\Facades\DB::table('kkn_registrations')->pluck('fiscal_year_id')
            ->merge(\Illuminate\Support\Facades\DB::table('kkn_locations')->pluck('fiscal_year_id'))
            ->merge(\Illuminate\Support\Facades\DB::table('kkn_postos')->pluck('fiscal_year_id'))
            ->unique()
            ->filter();

        foreach ($fiscalYearIds as $fyId) {
            $fiscalYear = \Illuminate\Support\Facades\DB::table('fiscal_years')->find($fyId);
            
            if ($fiscalYear) {
                // Create KKN Period
                $periodId = \Illuminate\Support\Facades\DB::table('kkn_periods')->insertGetId([
                    'name' => 'KKN Reguler ' . $fiscalYear->year,
                    'year' => $fiscalYear->year,
                    'start_date' => $fiscalYear->year . '-01-01', // Default, needs adjustment
                    'end_date' => $fiscalYear->year . '-12-31',   // Default
                    'is_active' => $fiscalYear->is_active,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Update tables
                foreach ($tables as $tableName) {
                    // Check if table has fiscal_year_id column before updating
                    if (Schema::hasColumn($tableName, 'fiscal_year_id')) {
                        \Illuminate\Support\Facades\DB::table($tableName)
                            ->where('fiscal_year_id', $fyId)
                            ->update(['kkn_period_id' => $periodId]);
                    }
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = ['kkn_locations', 'kkn_postos', 'kkn_registrations', 'kkn_document_templates'];

        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropForeign(['kkn_period_id']);
                $table->dropColumn('kkn_period_id');
            });
        }
    }
};
