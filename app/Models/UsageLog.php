<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class UsageLog extends Model
{
    use BelongsToTenant;

    protected $fillable = ['tenant_id', 'type', 'amount', 'cost', 'logged_date'];
}
