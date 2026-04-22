<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;

trait HandlesImageUploads
{
    /**
     * Process and store an image, converting to WebP if necessary.
     *
     * @param \Illuminate\Http\UploadedFile $file
     * @param string $directory
     * @param int $quality
     * @return string
     */
    protected function processAndStoreImage($file, string $directory, int $quality = 75): string
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $mime = $file->getMimeType();

        // If already webp, just store it as is
        if ($extension === 'webp' || $mime === 'image/webp') {
            return $file->store($directory, 'public');
        }

        // Convert to webp
        try {
            $imageData = file_get_contents($file->path());
            $sourceImage = @imagecreatefromstring($imageData);

            if ($sourceImage === false) {
                // Fallback to original if processing fails
                return $file->store($directory, 'public');
            }

            // Generate filename (same hash-based name but with .webp extension)
            $filename = pathinfo($file->hashName(), PATHINFO_FILENAME) . '.webp';
            $path = $directory . '/' . $filename;

            // Use output buffering to capture the webp image data
            ob_start();
            imagewebp($sourceImage, null, $quality);
            $webpContent = ob_get_clean();

            imagedestroy($sourceImage);

            Storage::disk('public')->put($path, $webpContent);

            return $path;
        } catch (\Exception $e) {
            // Fallback to original if something goes wrong
            return $file->store($directory, 'public');
        }
    }
}
