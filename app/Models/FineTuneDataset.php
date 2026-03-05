<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FineTuneDataset extends Model
{
    protected $fillable = [
        'tenant_id',
        'dataset_path',
        'model_base',
        'status',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
