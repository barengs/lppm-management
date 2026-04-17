<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

function validateWordCount($text, $limit, $fieldName)
{
    $wordCount = str_word_count(strip_tags($text));
    if ($wordCount > $limit) {
        throw new \Exception("Jumlah kata pada {$fieldName} melebihi batas (Maksimal {$limit} kata, saat ini {$wordCount} kata).");
    }
}

try {
    $proposal = App\Models\Proposal::with('scheme')->find(2);
    $scheme = $proposal->scheme;
	if(!$scheme) { echo "No scheme found for proposal 2\n"; exit; }
	echo "Scheme: {$scheme->name}\n";
	
	$validated = [
        'abstract' => '<p>This is a test</p>',
        'keywords' => 'test, abc',
        'background' => 'test',
        'methodology' => 'test test test',
        'objectives' => 'objective test',
        'references' => 'reference test',
    ];

    validateWordCount($validated['abstract'], $scheme->abstract_limit, 'Abstrak');
    validateWordCount($validated['background'], $scheme->background_limit, 'Latar Belakang');
    validateWordCount($validated['methodology'], $scheme->methodology_limit, 'Metode/Pembahasan');
    validateWordCount($validated['objectives'], $scheme->objective_limit, 'Tujuan/Kesimpulan');

    $proposal->content()->updateOrCreate(['proposal_id' => $proposal->id], $validated);
	echo "Successfully updated\n";
} catch (\Exception $e) {
    echo "Caught Exception: " . $e->getMessage() . "\n";
}
