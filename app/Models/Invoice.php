<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    use BelongsToTenant;

    protected $fillable = ['tenant_id', 'file_path', 'status', 'parsed_data'];

    protected $casts = [
        'parsed_data' => 'array',
    ];
}
