<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
</head>

<body style="font-family: sans-serif; color: #333; max-width: 600px; margin: auto; padding: 24px;">
  <h2 style="color: #e53e3e;">New Purchase Order #{{ $order->id }}</h2>

  <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
    <tr>
      <td style="padding:6px 0; font-weight:bold; width:160px;">Customer Name</td>
      <td>{{ $order->name }}</td>
    </tr>
    <tr>
      <td style="padding:6px 0; font-weight:bold;">Phone</td>
      <td>{{ $order->phone_number }}</td>
    </tr>
    <tr>
      <td style="padding:6px 0; font-weight:bold;">Address</td>
      <td>{{ $order->address }}</td>
    </tr>
    <tr>
      <td style="padding:6px 0; font-weight:bold;">Profession</td>
      <td>{{ $order->profession ?? '—' }}</td>
    </tr>
    <tr>
      <td style="padding:6px 0; font-weight:bold;">Payment Method</td>
      <td>bKash</td>
    </tr>
    <tr>
      <td style="padding:6px 0; font-weight:bold;">Transaction ID</td>
      <td>{{ $order->transaction_id }}</td>
    </tr>
    <tr>
      <td style="padding:6px 0; font-weight:bold;">Note</td>
      <td>{{ $order->note ?? '—' }}</td>
    </tr>
  </table>

  <h3>Ordered Categories</h3>
  <ul>
    @foreach ($categoryNames as $name)
      <li>{{ $name }}</li>
    @endforeach
  </ul>

  <p style="margin-top:24px; color:#666; font-size:13px;">
    Please review and approve or reject this order from the admin panel.
  </p>
</body>

</html>