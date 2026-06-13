<?php
include 'vendor/autoload.php';
$app = include 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\KknPostoMember;
use App\Models\KknRegistration;

$members = KknPostoMember::all();
$count = 0;
foreach ($members as $member) {
    // Cari registrasi berdasarkan student_id
    $reg = KknRegistration::where('student_id', $member->student_id)
        ->where('status', 'approved')
        ->first();
        
    if ($reg) {
        // Sync registration_id ke member jika masih null
        if (!$member->kkn_registration_id) {
            $member->kkn_registration_id = $reg->id;
            $member->save();
        }
        
        // Sync posto_id ke registration
        if ($reg->kkn_posto_id !== $member->kkn_posto_id) {
            $reg->kkn_posto_id = $member->kkn_posto_id;
            $reg->save();
            $count++;
        }
    }
}
echo "Synced $count registrations.\n";
