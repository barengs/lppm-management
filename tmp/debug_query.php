<?php
include 'vendor/autoload.php';
$app = include 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\KknRegistration;
use App\Models\KknPostoMember;

$period_id = 1; // From my previous check

$assignedStudentIds = KknPostoMember::whereHas('posto', function($q) use ($period_id) {
    $q->where('kkn_period_id', $period_id);
})->pluck('student_id');

echo "Assigned IDs: " . json_encode($assignedStudentIds->toArray()) . "\n";

$query = KknRegistration::where('kkn_period_id', $period_id)
    ->where('status', 'approved')
    ->whereNull('kkn_posto_id')
    ->whereNotIn('student_id', $assignedStudentIds);

echo "SQL: " . $query->toSql() . "\n";
echo "Bindings: " . json_encode($query->getBindings()) . "\n";
echo "Count: " . $query->count() . "\n";

foreach ($query->get() as $r) {
    echo "ID: {$r->id}, Student: {$r->student->name}\n";
}
