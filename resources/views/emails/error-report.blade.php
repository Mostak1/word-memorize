<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Error Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
        }
        .header {
            background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
            padding: 30px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid #f3f4f6;
        }
        .section:last-child {
            border-bottom: none;
        }
        .label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #6b7280;
            font-weight: 600;
            margin-bottom: 8px;
            display: block;
        }
        .value {
            font-size: 16px;
            color: #111827;
        }
        .value a {
            color: #ef4444;
            text-decoration: none;
        }
        .description-box {
            background-color: #f8fafc;
            border-radius: 8px;
            padding: 15px;
            border: 1px solid #e2e8f0;
            font-style: italic;
            color: #475569;
        }
        .screenshot-container {
            margin-top: 20px;
            text-align: center;
        }
        .screenshot {
            max-width: 100%;
            border-radius: 8px;
            border: 4px solid #f3f4f6;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .footer {
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #9ca3af;
            background-color: #f9fafb;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚨 New Error Report Received</h1>
        </div>
        
        <div class="content">
            <div class="section">
                <span class="label">Reporter Details</span>
                <div class="value">
                    <strong>{{ $user->name }}</strong><br>
                    <small>{{ $user->email }}</small>
                </div>
            </div>

            <div class="section">
                <span class="label">Page Context</span>
                <div class="value">
                    <strong>Title:</strong> {{ $report->page_title ?? 'Untitled Page' }}<br>
                    <strong>URL:</strong> <a href="{{ $report->page_url }}">{{ $report->page_url }}</a>
                </div>
            </div>

            <div class="section">
                <span class="label">Issue Description</span>
                <div class="description-box">
                    {!! nl2br(e($report->description)) !!}
                </div>
            </div>

            @if($report->image_path)
            <div class="section">
                <span class="label">Attached Screenshot</span>
                <div class="screenshot-container">
                    <img src="{{ asset('storage/' . $report->image_path) }}" class="screenshot" alt="Error Screenshot">
                </div>
            </div>
            @endif
        </div>

        <div class="footer">
            Sent from {{ config('app.name') }} Error Reporting System
        </div>
    </div>
</body>
</html>
