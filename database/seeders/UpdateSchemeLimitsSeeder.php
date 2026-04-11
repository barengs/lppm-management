<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Scheme;

class UpdateSchemeLimitsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Update all existing schemes with standard BIMA limits (corrected column names)
        Scheme::query()->update([
            'abstract_limit' => 250,
            'background_limit' => 1000,
            'methodology_limit' => 1000,
            'objective_limit' => 500,
            'reference_limit' => 25,
        ]);

        $this->command->info('Standard word limits updated for all schemes.');
    }
}
