<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Role constants
    const ROLE_ADMIN = 'admin';
    const ROLE_STAFF = 'staff';

    // Relationships
    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }

    public function borrowRecords()
    {
        return $this->hasMany(BorrowRecord::class);
    }

    // Helper
    public function isAdmin()
    {
        return $this->role === self::ROLE_ADMIN;
    }
}