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
        $tables = ['kkn_locations', 'kkn_postos', 'kkn_registrations', 'kkn_document_templates'];
        
        // Get all periods for mapping (year => id)
        $periods = \Illuminate\Support\Facades\DB::table('kkn_periods')->pluck('id', 'year');
        $fiscalYears = \Illuminate\Support\Facades\DB::table('fiscal_years')->pluck('year', 'id');

        foreach ($tables as $tableName) {
            foreach ($fiscalYears as $fyId => $year) {
                if (isset($periods[$year])) {
                    \Illuminate\Support\Facades\DB::table($tableName)
                        ->where('fiscal_year_id', $fyId)
                        ->update(['kkn_period_id' => $periods[$year]]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reversal needed
    }
};
