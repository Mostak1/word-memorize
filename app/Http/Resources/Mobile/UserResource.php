<?php

namespace App\Http\Resources\Mobile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'image' => $this->image,
            'headline' => $this->headline,
            'phone_number' => $this->phone_number,
            'location' => $this->location,
            'gender' => $this->gender,
            'profession' => $this->profession,
            'wallet' => $this->wallet,
            'referral_code' => $this->referral_code,
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
