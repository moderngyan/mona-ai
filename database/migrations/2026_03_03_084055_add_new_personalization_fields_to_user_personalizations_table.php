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
        Schema::table('user_personalizations', function (Blueprint $table) {
            $table->string('user_name')->nullable()->after('user_id');
            $table->string('user_nickname')->nullable()->after('user_name');
            $table->string('agent_name')->nullable()->after('nickname');
            $table->string('agent_nickname')->nullable()->after('agent_name');
            $table->string('social_handle')->nullable()->after('custom_instructions');
            $table->string('location')->nullable()->after('social_handle');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_personalizations', function (Blueprint $table) {
            //
        });
    }
};
