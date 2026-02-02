<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add avatar column to profiles if not exists
        Schema::table('dosen_profiles', function (Blueprint $table) {
            $table->string('avatar')->nullable()->after('user_id');
        });

        Schema::table('mahasiswa_profiles', function (Blueprint $table) {
            $table->string('avatar')->nullable()->after('user_id');
        });

        // Migrate data
        $users = \DB::table('users')->whereNotNull('avatar')->get();
        foreach ($users as $user) {
            // Check if user is dosen/reviewer/admin (assumes they have dosen_profile)
            $dosenProfile = \DB::table('dosen_profiles')->where('user_id', $user->id)->first();
            if ($dosenProfile) {
                \DB::table('dosen_profiles')->where('id', $dosenProfile->id)->update(['avatar' => $user->avatar]);
                continue;
            }

            // Check if user is mahasiswa
            $mhsProfile = \DB::table('mahasiswa_profiles')->where('user_id', $user->id)->first();
            if ($mhsProfile) {
                \DB::table('mahasiswa_profiles')->where('id', $mhsProfile->id)->update(['avatar' => $user->avatar]);
            }
        }

        // Drop avatar from users
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('avatar');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add avatar back to users
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar')->nullable()->after('email');
        });

        // Migrate data back
        $dosenProfiles = \DB::table('dosen_profiles')->whereNotNull('avatar')->get();
        foreach ($dosenProfiles as $profile) {
            \DB::table('users')->where('id', $profile->user_id)->update(['avatar' => $profile->avatar]);
        }

        $mhsProfiles = \DB::table('mahasiswa_profiles')->whereNotNull('avatar')->get();
        foreach ($mhsProfiles as $profile) {
            \DB::table('users')->where('id', $profile->user_id)->update(['avatar' => $profile->avatar]);
        }

        // Drop avatar from profiles
        Schema::table('dosen_profiles', function (Blueprint $table) {
            $table->dropColumn('avatar');
        });

        Schema::table('mahasiswa_profiles', function (Blueprint $table) {
            $table->dropColumn('avatar');
        });
    }
};
