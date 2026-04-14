<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserDevice;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeviceSessionService
{
  public function fingerprint(Request $request): string
  {
    $deviceId = $request->input('device_id');

    if (is_string($deviceId) && trim($deviceId) !== '') {
      return hash('sha256', $deviceId);
    }

    $parts = [
      $request->ip() ?? '',
      $request->header('Accept') ?? '',
    ];

    return hash('sha256', implode('|', $parts));
  }

  public function revokeConflictingSessions(User $user, string $fingerprint): void
  {
    $conflicting = $user->devices()
      ->where('device_fingerprint', '<>', $fingerprint)
      ->where('is_active', true)
      ->get();

    foreach ($conflicting as $device) {
      if ($device->session_id) {
        DB::table('sessions')->where('id', $device->session_id)->delete();
      }

      $device->update(['is_active' => false]);
    }
  }

  public function touchCurrentDevice(User $user, string $fingerprint, string $sessionId, Request $request): UserDevice
  {
    $device = UserDevice::firstOrNew([
      'user_id' => $user->id,
      'device_fingerprint' => $fingerprint,
    ]);

    if ($device->exists && $device->session_id && $device->session_id !== $sessionId) {
      DB::table('sessions')->where('id', $device->session_id)->delete();
    }

    $device->fill([
      'session_id' => $sessionId,
      'ip_address' => $request->ip(),
      'user_agent' => $request->userAgent(),
      'is_active' => true,
      'last_activity' => now(),
    ]);

    try {
      $device->save();
    } catch (QueryException) {
      $device = UserDevice::where('user_id', $user->id)
        ->where('device_fingerprint', $fingerprint)
        ->first();

      if ($device) {
        $device->update([
          'session_id' => $sessionId,
          'ip_address' => $request->ip(),
          'user_agent' => $request->userAgent(),
          'is_active' => true,
          'last_activity' => now(),
        ]);
      }
    }

    return $device;
  }

  public function clearDevice(User $user, string $sessionId): void
  {
    $user->devices()
      ->where('session_id', $sessionId)
      ->where('is_active', true)
      ->update(['is_active' => false]);
  }
}
