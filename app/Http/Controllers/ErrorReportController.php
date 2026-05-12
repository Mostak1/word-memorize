<?php

namespace App\Http\Controllers;

use App\Models\ErrorReport;
use Illuminate\Http\Request;
use Brevo\Brevo;
use Brevo\TransactionalEmails\Requests\SendTransacEmailRequest;
use Brevo\TransactionalEmails\Types\SendTransacEmailRequestSender;
use Brevo\TransactionalEmails\Types\SendTransacEmailRequestToItem;
use Illuminate\Support\Facades\Log;
use App\Traits\HandlesImageUploads;
use App\Support\Telemetry;

class ErrorReportController extends Controller
{
  use HandlesImageUploads;
  /**
   * POST /error-reports
   * Authenticated users only — enforced via route middleware.
   */
  public function store(Request $request)
  {
    $validated = $request->validate([
      'page_url' => ['required', 'string', 'max:500'],
      'page_title' => ['nullable', 'string', 'max:255'],
      'description' => ['required', 'string', 'min:5', 'max:3000'],
      'image' => ['nullable', 'image', 'mimes:jpeg,png,webp,gif', 'max:4096'],
    ]);

    $imagePath = null;
    if ($request->hasFile('image')) {
      $imagePath = $this->processAndStoreImage($request->file('image'), 'error-reports');
    }

    $report = ErrorReport::create([
      'user_id' => auth()->id(),
      'page_url' => $validated['page_url'],
      'page_title' => $validated['page_title'] ?? null,
      'description' => $validated['description'],
      'image_path' => $imagePath,
    ]);

    // $this->sendEmailToAdmin($report);

    Telemetry::record($request, 'error_report_created', [
      'error_report_id' => $report->id,
      'has_image' => (bool) $imagePath,
      'page_url' => $validated['page_url'],
    ]);

    return back()->with('flash', [
      'type' => 'success',
      'message' => 'Report submitted. Thank you!',
    ]);
  }

  /**
   * Send notification email to admin using Brevo
   */
  private function sendEmailToAdmin(ErrorReport $report)
  {
    $apiKey = config('services.brevo.api_key');
    if (!$apiKey) {
      Log::warning('Brevo API key not found in configuration.');
      return;
    }

    $adminEmail = 'ignatiousr80@gmail.com';
    // config('services.brevo.admin_email', 'mostak.com@gmail.com');
    $user = auth()->user();

    try {
      $client = new Brevo(apiKey: $apiKey);

      $htmlContent = view('emails.error-report', compact('report', 'user'))->render();

      $client->transactionalEmails->sendTransacEmail(
        new SendTransacEmailRequest([
          'htmlContent' => $htmlContent,
          'sender' => new SendTransacEmailRequestSender([
            // 'email' => config('mail.from.address'),
            'email' => 'cryfar556@gmail.com',
            'name' => config('mail.from.name'),
          ]),
          'subject' => "🚨 New Error Report: " . ($report->page_title ?? 'No Title'),
          'to' => [
            new SendTransacEmailRequestToItem([
              'email' => $adminEmail,
              'name' => 'Admin',
            ]),
          ],
        ]),
      );
    } catch (\Exception $e) {
      Log::error('Brevo Email Sending Failed: ' . $e->getMessage(), [
        'report_id' => $report->id,
        'error' => $e->getTraceAsString()
      ]);
    }
  }
}
