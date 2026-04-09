<?php

namespace App\Observers;

use App\Models\WordListOrder;

class WordListOrderObserver
{
    public function updated(WordListOrder $order): void
    {
        if (!$order->wasChanged('status'))
            return;

        match ($order->status) {
            'approved' => $order->grantAccess(),
            'rejected' => $order->revokeAccess(),
            default => null,
        };
    }

    public function deleting(WordListOrder $order): void
    {
        $order->revokeAccess();
    }
}
