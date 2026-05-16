<?php

namespace App\Models;

use App\Traits\Translatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Course extends Model
{
    use HasFactory;
    // Translatable;

    protected $fillable = [
        'instructor_id',
        'category_id',
        'course_type',    // enum('course', 'shop')
        'delivery_type',  // enum('pre-recorded', 'live')
        'title',
        'title_bn',
        'slug',
        'seo_description',
        'duration',
        'time_zone',
        'thumbnail',
        'demo_video_storage',
        'demo_video_source',
        'description',
        'description_bn',
        'capacity',
        'price',
        'shipping_weight',
        'discount',
        'certificate',
        'qna',
        'message_for_reviewer',
        'is_approved',
        'status',
        'course_level_id',
        'course_language_id',
        'ad_title',
        'ad_image',
        'ad_url',
        'ad_position',
        'ad_status',
        'access_type',
        'expire_date', //only for course->delivery_type == 'live'
        'lesson_expire_after_days', //only for course->delivery_type == 'live'
        'auto_lesson_access',
        'live_lock_system',
    ];

    /**
     * Casts
     */
    protected $casts = [
        'certificate' => 'boolean',
        'qna' => 'boolean',
        'price' => 'float',
        'discount' => 'float',
        'capacity' => 'integer',
        'ad_status' => 'boolean',
        'access_type' => 'string',
        'delivery_type' => 'string',

        'expire_date' => 'date',
        'lesson_expire_after_days' => 'integer',
        'auto_lesson_access' => 'boolean',
    ];


    function instructor(): HasOne
    {
        return $this->hasOne(User::class, 'id', 'instructor_id');
    }

    public function isShop(): bool
    {
        return $this->course_type === 'shop';
    }

    public function shopCategories()
    {
        return $this->belongsToMany(ShopCategory::class, 'course_shop_category');
    }

    function category(): HasOne
    {
        return $this->hasOne(CourseCategory::class, 'id', 'category_id');
    }

    public function batches()
    {
        return $this->hasMany(Batch::class);
    }

    function level(): HasOne
    {
        return $this->hasOne(CourseLevel::class, 'id', 'course_level_id');
    }
    function language(): HasOne
    {
        return $this->hasOne(CourseLanguage::class, 'id', 'course_language_id');
    }


    function chapters(): HasMany
    {
        return $this->hasMany(CourseChapter::class, 'course_id', 'id')->orderBy('order');
    }

    function lessons(): HasMany
    {
        return $this->hasMany(CourseChapterLession::class, 'course_id', 'id');
    }

    function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'course_id', 'id');
    }

    // function enrollments(): HasMany
    // {
    //     return $this->hasMany(Enrollment::class, 'course_id', 'id');
    // }

    public function enrollments(): HasManyThrough
    {
        return $this->hasManyThrough(
            Enrollment::class, // final model
            Batch::class,      // intermediate model
            'course_id',       // foreign key on batches
            'batch_id',        // foreign key on enrollments
            'id',              // local key on courses
            'id'               // local key on batches
        );
    }

    public function images(): HasMany
    {
        return $this->hasMany(CourseImage::class, 'course_id', 'id');
    }
}