<?php
include 'vendor/autoload.php';
$app = include 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\KknPosto;
use App\Models\KknPostoMember;
use App\Models\KknRegistration;

echo "Posko List:\n";
foreach(KknPosto::all() as $posto) {
    echo "ID: {$posto->id}, Name: {$posto->name}\n";
}

echo "\nMembers in Posko 2:\n";
$members = KknPostoMember::where('kkn_posto_id', 2)->get();
if ($members->isEmpty()) {
    echo "Empty.\n";
} else {
    foreach($members as $m) {
        echo "- Student ID: {$m->student_id}, Reg ID: {$m->kkn_registration_id}\n";
    }
}

echo "\nRegistrations assigned to Posko 2:\n";
$regs = KknRegistration::where('kkn_posto_id', 2)->get();
if ($regs->isEmpty()) {
    echo "Empty.\n";
} else {
    foreach($regs as $r) {
        echo "- Reg ID: {$r->id}, Student ID: {$r->student_id}\n";
    }
}
