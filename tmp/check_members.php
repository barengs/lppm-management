<?php
include 'vendor/autoload.php';
$app = include 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\KknPostoMember;

$members = KknPostoMember::all();
echo "Total Posto Members: " . $members->count() . "\n";
foreach ($members as $m) {
    echo "ID: {$m->id}, Student ID: {$m->student_id}, Posto ID: {$m->kkn_posto_id}, Status: {$m->status}\n";
}
