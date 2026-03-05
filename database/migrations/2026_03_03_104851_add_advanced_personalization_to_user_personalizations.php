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
            $table->string('base_style')->nullable()->default('Default')->after('base_tone');
            $table->string('warmth')->nullable()->default('Default')->after('base_style');
            $table->string('enthusiasm')->nullable()->default('Default')->after('warmth');
            $table->string('headers_lists')->nullable()->default('Default')->after('enthusiasm');
            $table->string('emoji_usage')->nullable()->default('Default')->after('headers_lists');
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
