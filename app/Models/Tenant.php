<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Tenant extends Model
{
    protected $fillable = ['name', 'domain', 'config'];
    protected $casts = [
        'config' => 'array',
    ];

    protected static $globalTenantId = null;

    public static function setGlobalTenantId($id)
    {
        static::$globalTenantId = $id;
    }

    public static function getGlobalTenantId()
    {
        return static::$globalTenantId;
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
