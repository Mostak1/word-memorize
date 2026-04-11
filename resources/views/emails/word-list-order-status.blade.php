<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
</head>

<body style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; padding: 24px;">

  @if ($order->status === 'approved')
    <h2 style="color: #16a34a;">🎉 Access Granted!</h2>
    <p>Hi <strong>{{ $order->name }}</strong>,</p>
    <p>Great news! Your payment has been verified and you now have full access to the following word list categories:</p>
    <ul style="padding-left: 20px; line-height: 2;">
      @foreach ($order->categories as $category)
        <li><strong>{{ $category->name }}</strong></li>
      @endforeach
    </ul>
    <p>Log in to your account and start learning right away!</p>

  @elseif ($order->status === 'rejected')
    <h2 style="color: #dc2626;">Order Not Approved</h2>
    <p>Hi <strong>{{ $order->name }}</strong>,</p>
    <p>Unfortunately, your purchase request for the following categories has been <strong
        style="color:#dc2626;">rejected</strong>:</p>
    <ul style="padding-left: 20px; line-height: 2;">
      @foreach ($order->categories as $category)
        <li><strong>{{ $category->name }}</strong></li>
      @endforeach
    </ul>
    @if ($order->admin_note)
      <p><strong>Reason:</strong> {{ $order->admin_note }}</p>
    @endif
    <p>If you believe this is a mistake, please contact our support team with your transaction ID:
      <strong>{{ $order->transaction_id }}</strong>.</p>

  @else
    <h2>Order Status Updated</h2>
    <p>Hi <strong>{{ $order->name }}</strong>, your order status has been updated to
      <strong>{{ ucfirst($order->status) }}</strong>.</p>
  @endif

  <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
  <p style="color: #6b7280; font-size: 13px;">
    Transaction ID: {{ $order->transaction_id }}
  </p>

</body>

</html>