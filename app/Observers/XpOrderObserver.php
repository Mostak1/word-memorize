<?php

namespace App\Observers;

use App\Models\XpOrder;

class XpOrderObserver
{
    /**
     * Handle the XpOrder "updated" event.
     */
    public function updated(XpOrder $order): void
    {
        if (!$order->wasChanged('status')) {
            return;
        }

        if ($order->status === 'approved') {
            $order->grantXp();
        } elseif ($order->status === 'rejected' && $order->getOriginal('status') === 'approved') {
            $order->refundXp();
        }
    }

    /**
     * Handle the XpOrder "deleting" event.
     */
    public function deleting(XpOrder $order): void
    {
        if ($order->status === 'approved') {
            $order->refundXp();
        }
    }
}
