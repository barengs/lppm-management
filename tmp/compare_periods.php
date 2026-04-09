<?php
include 'vendor/autoload.php';
$app = include 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\KknRegistration;
use App\Models\KknPosto;
use App\Models\KknPeriod;

echo "--- KKN Periods ---\n";
foreach (KknPeriod::all() as $p) {
    echo "ID: {$p->id}, Name: {$p->name}\n";
}

echo "\n--- KKN Postos ---\n";
foreach (KknPosto::all() as $pos) {
    echo "ID: {$pos->id}, Name: {$pos->name}, Period ID: {$pos->kkn_period_id}\n";
}

echo "\n--- Approved Registrations ---\n";
foreach (KknRegistration::where('status', 'approved')->get() as $reg) {
    echo "ID: {$reg->id}, Student: {$reg->student->name}, Period ID: {$reg->kkn_period_id}, Posto ID: " . ($reg->kkn_posto_id ?? 'NULL') . "\n";
}
