<?php

namespace App\Exceptions;

use Exception;
use Illuminate\Http\JsonResponse;

class InterviewFlowException extends Exception
{
    public function __construct(
        string $message,
        private readonly int $status,
    ) {
        parent::__construct($message);
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
        ], $this->status);
    }

    public static function conflict(string $message): self
    {
        return new self($message, 409);
    }

    public static function unprocessable(string $message): self
    {
        return new self($message, 422);
    }

    public static function forbidden(string $message): self
    {
        return new self($message, 403);
    }
}
