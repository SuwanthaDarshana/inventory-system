<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BorrowRecord extends Model
{
    protected $fillable = [
        'item_id',
        'user_id',
        'borrower_name',
        'contact',
        'quantity',
        'borrow_date',
        'expected_return_date',
        'return_date',
        'status',
    ];

    protected $casts = [
        'borrow_date' => 'date',
        'expected_return_date' => 'date',
        'return_date' => 'date',
    ];

    // Status constants
    const STATUS_BORROWED = 'BORROWED';
    const STATUS_RETURNED = 'RETURNED';

    // Relationships
    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}