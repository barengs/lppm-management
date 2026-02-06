<?php

namespace Database\Seeders;

use App\Models\KknDocumentTemplate;
use App\Models\FiscalYear;
use Illuminate\Database\Seeder;

class KknDocumentTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the active fiscal year
        $activeFiscalYear = FiscalYear::where('is_active', true)->first();

        if (!$activeFiscalYear) {
            $this->command->warn('No active fiscal year found. Creating global templates instead.');
        }

        $fiscalYearId = $activeFiscalYear?->id;

        // Create default document templates for current period
        $templates = [
            [
                'fiscal_year_id' => $fiscalYearId,
                'name' => 'Surat Izin Orang Tua',
                'slug' => 'surat-izin-orang-tua',
                'is_required' => true,
                'order' => 1,
                'description' => 'Surat izin dari orang tua/wali untuk mengikuti KKN',
            ],
            [
                'fiscal_year_id' => $fiscalYearId,
                'name' => 'Surat Rekomendasi Dekan',
                'slug' => 'surat-rekomendasi-dekan',
                'is_required' => true,
                'order' => 2,
                'description' => 'Surat rekomendasi dari Dekan Fakultas',
            ],
        ];

        foreach ($templates as $template) {
            KknDocumentTemplate::updateOrCreate(
                ['slug' => $template['slug'], 'fiscal_year_id' => $fiscalYearId],
                $template
            );
        }

        $this->command->info('KKN Document Templates seeded successfully!');
    }
}
