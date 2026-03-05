<?php

namespace App\Traits;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;

trait BelongsToTenant
{
    public static function bootBelongsToTenant()
    {
        static::creating(function ($model) {
            if (!$model->tenant_id && Tenant::getGlobalTenantId()) {
                $model->tenant_id = Tenant::getGlobalTenantId();
            }
        });

        static::addGlobalScope('tenant', function (Builder $builder) {
            if (Tenant::getGlobalTenantId()) {
                $builder->where('tenant_id', Tenant::getGlobalTenantId());
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
