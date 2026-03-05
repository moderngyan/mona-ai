<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a default tenant
        $tenant = Tenant::create([
            'name' => 'Default Organization',
            'domain' => 'nebula.ai',
            'config' => [
                'monthly_token_limit' => 5000000,
                'default_provider' => 'ollama',
            ]
        ]);

        // Create a Super Admin
        User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Admin User',
            'email' => 'admin@nebula.ai',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
        ]);

        // Create a regular user
        User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Regular User',
            'email' => 'user@nebula.ai',
            'password' => Hash::make('password'),
            'role' => 'user',
        ]);
        
        echo "Nebula AI Seeded: admin@nebula.ai / password\n";
    }
}
