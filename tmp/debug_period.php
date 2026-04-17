<?php
include 'vendor/autoload.php';
$app = include 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\KknRegistration;

$period_id = 1;
$regs = KknRegistration::where('kkn_period_id', $period_id)->get();
echo "Total Registrations for Period 1: " . $regs->count() . "\n";
foreach ($regs as $r) {
    echo "ID: {$r->id}, Status: [{$r->status}], Posto ID: " . ($r->kkn_posto_id ?? 'NULL') . "\n";
}
