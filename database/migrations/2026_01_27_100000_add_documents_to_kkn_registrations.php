<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('kkn_registrations', function (Blueprint $table) {
            $table->json('documents')->nullable()->after('status'); 
            // documents will store: { "krs": "path/to/krs.pdf", "kesehatan": "...", "transkrip": "..." }
            $table->string('validation_notes')->nullable()->after('documents');
        });
    }

    public function down()
    {
        Schema::table('kkn_registrations', function (Blueprint $table) {
            $table->dropColumn(['documents', 'validation_notes']);
        });
    }
};
