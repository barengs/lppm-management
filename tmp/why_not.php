<?php
include 'vendor/autoload.php';
$app = include 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\KknRegistration;
use Illuminate\Support\Facades\DB;

$id = 1;
$reg = DB::table('kkn_registrations')->where('id', $id)->first();

echo "Raw Data for ID $id:\n";
print_r($reg);

echo "\nModel Data for ID $id:\n";
$m = KknRegistration::find($id);
if ($m) {
    echo "ID: {$m->id}, Status: [{$m->status}], Period ID: [{$m->kkn_period_id}], Posto ID: [{$m->kkn_posto_id}]\n";
} else {
    echo "Model NOT found!\n";
}

$period_id = 1;
$status = 'approved';

echo "\nTesting Conditions:\n";
echo "Period check: " . ($reg->kkn_period_id == $period_id ? "MATCH" : "FAIL") . " (Value: [{$reg->kkn_period_id}], Expected: [$period_id])\n";
echo "Status check: " . ($reg->status === $status ? "MATCH" : "FAIL") . " (Value: [{$reg->status}], Expected: [$status])\n";
echo "Posto check: " . (is_null($reg->kkn_posto_id) ? "MATCH" : "FAIL") . " (Value: [{$reg->kkn_posto_id}])\n";

$count = DB::table('kkn_registrations')
    ->where('kkn_period_id', $period_id)
    ->where('status', $status)
    ->whereNull('kkn_posto_id')
    ->count();
echo "\nDB Raw Count: $count\n";

$mcount = KknRegistration::where('kkn_period_id', $period_id)
    ->where('status', $status)
    ->whereNull('kkn_posto_id')
    ->count();
echo "Model Count: $mcount\n";
