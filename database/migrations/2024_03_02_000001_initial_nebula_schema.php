<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('domain')->unique();
            $table->json('config')->nullable(); // Default AI provider, model, limits
            $table->timestamps();
        });

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('role')->default('user'); // super_admin, tenant_admin, user
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('ai_chats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained();
            $table->foreignId('user_id')->constrained();
            $table->string('provider'); // openai, ollama
            $table->string('model');
            $table->string('title')->nullable();
            $table->timestamps();
        });

        Schema::create('ai_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ai_chat_id')->constrained()->onDelete('cascade');
            $table->string('role'); // user, assistant, system
            $table->text('content');
            $table->integer('tokens_used')->default(0);
            $table->decimal('cost', 10, 6)->default(0);
            $table->timestamps();
        });

        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained();
            $table->string('file_path');
            $table->string('status')->default('pending'); // pending, processing, completed, failed
            $table->json('parsed_data')->nullable();
            $table->timestamps();
        });

        Schema::create('usage_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained();
            $table->string('type'); // tokens, request, ocr
            $table->integer('amount');
            $table->decimal('cost', 10, 6)->default(0);
            $table->date('logged_date');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('usage_logs');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('ai_messages');
        Schema::dropIfExists('ai_chats');
        Schema::dropIfExists('users');
        Schema::dropIfExists('tenants');
    }
};
