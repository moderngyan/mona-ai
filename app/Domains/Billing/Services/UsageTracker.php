<?php

namespace App\Domains\Billing\Services;

use App\Models\UsageLog;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;

class UsageTracker
{
    /**
     * Log usage for a tenant.
     */
    public function log(int $tenantId, string $type, int $amount, float $cost = 0)
    {
        return UsageLog::create([
            'tenant_id' => $tenantId,
            'type'      => $type,
            'amount'    => $amount,
            'cost'      => $cost,
            'logged_date' => now()->toDateString(),
        ]);
    }

    /**
     * Check if tenant has exceeded limits.
     */
    public function checkLimits(int $tenantId): bool
    {
        $tenant = Tenant::find($tenantId);
        $limit = $tenant->config['monthly_token_limit'] ?? 1000000;
        
        $usage = UsageLog::where('tenant_id', $tenantId)
            ->whereMonth('logged_date', now()->month)
            ->sum('amount');

        return $usage < $limit;
    }

    /**
     * Get usage summary for Admin Dashboard.
     */
    public function getSummary()
    {
        return UsageLog::select('type', DB::raw('SUM(amount) as total_amount'), DB::raw('SUM(cost) as total_cost'))
            ->groupBy('type')
            ->get();
    }
}
