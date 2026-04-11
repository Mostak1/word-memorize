<?php

namespace App\Mail;

use App\Models\WordListOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewWordListOrderMail extends Mailable
{
  use Queueable, SerializesModels;

  public function __construct(public WordListOrder $order, public array $categoryNames)
  {
  }

  public function envelope(): Envelope
  {
    return new Envelope(
      subject: 'New Word List Purchase Order #' . $this->order->id,
    );
  }

  public function content(): Content
  {
    return new Content(
      view: 'emails.new-word-list-order',
    );
  }
}