<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('kkn_locations', function (Blueprint $table) {
            $table->char('province_id', 2)->nullable()->after('description');
            $table->char('city_id', 4)->nullable()->after('province_id');
            $table->char('district_id', 7)->nullable()->after('city_id');
            $table->char('village_id', 10)->nullable()->after('district_id');
            $table->decimal('latitude', 10, 8)->nullable()->after('village_id');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');

            $table->foreign('province_id')->references('id')->on('indonesia_provinces')->onUpdate('cascade')->onDelete('set null');
            $table->foreign('city_id')->references('id')->on('indonesia_cities')->onUpdate('cascade')->onDelete('set null');
            $table->foreign('district_id')->references('id')->on('indonesia_districts')->onUpdate('cascade')->onDelete('set null');
            $table->foreign('village_id')->references('id')->on('indonesia_villages')->onUpdate('cascade')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kkn_locations', function (Blueprint $table) {
            $table->dropForeign(['province_id']);
            $table->dropForeign(['city_id']);
            $table->dropForeign(['district_id']);
            $table->dropForeign(['village_id']);
            
            $table->dropColumn(['province_id', 'city_id', 'district_id', 'village_id', 'latitude', 'longitude']);
        });
    }
};
