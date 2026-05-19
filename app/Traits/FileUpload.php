<?php

namespace App\Traits;

use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

trait FileUpload {

    public function uploadFile(UploadedFile $file, string $directory = 'uploads') : string {

        try {
            $filename = 'educore_'.uniqid().'.'. $file->getClientOriginalExtension();
    
            // move the file to storage
            $file->storeAs($directory, $filename, 'public');
    
            return '/' . $directory. '/' . $filename;
        }catch(Exception $e) {
            throw $e;
        }
       
    }

    public function deleteFile(?string $path) : bool {
        if (! $path) {
            return false;
        }

        $path = ltrim($path, '/');

        if(Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
            return true;
        }

        return false;
    }
}
