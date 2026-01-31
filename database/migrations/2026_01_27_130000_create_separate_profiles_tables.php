<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('mahasiswa_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('npm')->unique();
            $table->string('prodi')->nullable();
            $table->string('fakultas')->nullable();
            $table->string('gender')->nullable(); // L/P
            $table->string('place_of_birth')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->decimal('ips', 3, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('dosen_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('nidn')->unique()->nullable();
            $table->string('prodi')->nullable();
            $table->string('fakultas')->nullable();
            $table->string('scopus_id')->nullable();
            $table->string('sinta_id')->nullable();
            $table->string('google_scholar_id')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('mahasiswa_profiles');
        Schema::dropIfExists('dosen_profiles');
    }
};
