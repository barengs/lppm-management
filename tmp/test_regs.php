<?php
include 'vendor/autoload.php';
$app = include 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\KknRegistration;
use App\Models\KknPosto;
use App\Models\KknPostoMember;

$regs = KknRegistration::all();
echo "Total Registrations: " . $regs->count() . "\n";
foreach ($regs as $r) {
    echo "ID: {$r->id}, Student ID: {$r->student_id}, Status: [{$r->status}], Period ID: " . ($r->kkn_period_id ?? 'NULL') . ", Posto ID: " . ($r->kkn_posto_id ?? 'NULL') . "\n";
    
    $is_assigned = KknPostoMember::where('student_id', $r->student_id)->exists();
    echo "  Is Assigned to any posto: " . ($is_assigned ? 'YES' : 'NO') . "\n";
}

$posto = KknPosto::first();
if ($posto) {
    echo "First Posto ID: {$posto->id}, Name: {$posto->name}, Period ID: {$posto->kkn_period_id}\n";
    $assigned_ids = KknPostoMember::whereHas('posto', function($q) use ($posto) {
        $q->where('kkn_period_id', $posto->kkn_period_id);
    })->pluck('student_id')->toArray();
    echo "  Assigned Student IDs in this period: " . implode(', ', $assigned_ids) . "\n";
}
