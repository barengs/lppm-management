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
        // Get all unique fiscal_year_ids from kkn_registrations that have NULL kkn_period_id
        $fiscalYearIds = \Illuminate\Support\Facades\DB::table('kkn_registrations')
            ->whereNull('kkn_period_id')
            ->pluck('fiscal_year_id')
            ->unique()
            ->filter();

        foreach ($fiscalYearIds as $fyId) {
            $fiscalYear = \Illuminate\Support\Facades\DB::table('fiscal_years')->find($fyId);
            
            if ($fiscalYear) {
                // Find corresponding KKN Period (usually matched by year)
                $period = \Illuminate\Support\Facades\DB::table('kkn_periods')
                    ->where('year', $fiscalYear->year)
                    ->first();
                
                if ($period) {
                    \Illuminate\Support\Facades\DB::table('kkn_registrations')
                        ->where('fiscal_year_id', $fyId)
                        ->whereNull('kkn_period_id')
                        ->update(['kkn_period_id' => $period->id]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No reversal needed as this is a data sync migration
    }
};
