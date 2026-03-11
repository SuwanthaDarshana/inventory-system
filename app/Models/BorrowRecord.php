<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BorrowRecord extends Model
{
    protected $fillable = [
        'item_id',
        'borrower_name',
        'contact',
        'quantity',
        'borrow_date',
        'expected_return_date',
        'return_date',
        'status',
    ];

    // Status constants
    const STATUS_BORROWED = 'BORROWED';
    const STATUS_RETURNED = 'RETURNED';

    // Relationships
    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}