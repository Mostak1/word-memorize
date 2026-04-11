<?php

namespace App\Mail;

use App\Models\WordListOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WordListOrderStatusMail extends Mailable
{
  use Queueable, SerializesModels;

  public function __construct(public WordListOrder $order)
  {
  }

  public function envelope(): Envelope
  {
    $subject = match ($this->order->status) {
      'approved' => '🎉 Your Purchase Access Has Been Approved!',
      'rejected' => 'Update on Your Word List Purchase Order #' . $this->order->id,
      default => 'Your Order #' . $this->order->id . ' Status Updated',
    };

    return new Envelope(subject: $subject);
  }

  public function content(): Content
  {
    return new Content(view: 'emails.word-list-order-status');
  }
}