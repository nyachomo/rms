<?php

namespace App\Imports;

use App\Models\School;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;

class SchoolsImport implements
    ToModel,
    WithHeadingRow,
    WithValidation,
    SkipsOnFailure,
    WithBatchInserts,
    WithChunkReading
{
    use SkipsFailures;

    public function __construct(
        private readonly ?int $categoryId = null,
        private readonly ?int $levelId    = null,
    ) {}

    public function model(array $row): ?School
    {
        $name = trim($row['school_name'] ?? '');
        if ($name === '') {
            return null;
        }

        $status = strtolower(trim($row['school_status'] ?? 'active'));
        if (!in_array($status, ['active', 'archived'])) {
            $status = 'active';
        }

        return new School([
            'school_name'           => $name,
            'school_location'       => trim($row['school_location'] ?? ''),
            'school_contact_person' => trim($row['school_contact_person'] ?? ''),
            'school_status'         => $status,
            'school_category_id'    => $this->categoryId,
            'school_level_id'       => $this->levelId,
        ]);
    }

    public function rules(): array
    {
        return [
            'school_name'           => 'required|string|max:150',
            'school_location'       => 'required|string|max:200',
            'school_contact_person' => 'required|string|max:100',
        ];
    }

    public function batchSize(): int
    {
        return 100;
    }

    public function chunkSize(): int
    {
        return 100;
    }
}
