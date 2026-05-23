<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invite;
use App\Services\Admin\InviteAdminService;
use App\Services\Interview\InterviewEmailDeliveryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminInviteController extends Controller
{
    public function __construct(
        private readonly InviteAdminService $invites,
        private readonly InterviewEmailDeliveryService $emailDelivery,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', Rule::in([
                'active',
                'revoked',
                'not_started',
                'in_progress',
                'completed',
            ])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $paginator = $this->invites->paginate(
            $validated['status'] ?? null,
            (int) ($validated['per_page'] ?? 20),
        );

        return response()->json([
            'data' => $paginator->getCollection()
                ->map(fn (Invite $invite) => $this->invites->serializeListItem($invite))
                ->values()
                ->all(),
            'meta' => [
                'currentPage' => $paginator->currentPage(),
                'lastPage' => $paginator->lastPage(),
                'perPage' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contactName' => ['required', 'string', 'max:255'],
            'businessName' => ['required', 'string', 'max:255'],
            'businessAbout' => ['nullable', 'string'],
            'clientEmail' => ['nullable', 'string', 'email', 'max:255'],
            'clientWhatsapp' => ['nullable', 'string', 'max:64'],
        ]);

        if (
            empty($validated['clientEmail'] ?? null)
            && empty($validated['clientWhatsapp'] ?? null)
        ) {
            return response()->json([
                'message' => 'Provide clientEmail or clientWhatsapp.',
                'errors' => [
                    'clientEmail' => ['Provide client email or WhatsApp.'],
                ],
            ], 422);
        }

        $result = $this->invites->create($request->user(), $validated);

        return response()->json([
            'invite' => $this->invites->serializeDetail($result['invite']),
            'inviteUrl' => $result['inviteUrl'],
        ], 201);
    }

    public function show(Invite $invite): JsonResponse
    {
        return response()->json($this->invites->serializeDetail($invite));
    }

    public function revoke(Invite $invite): JsonResponse
    {
        $invite = $this->invites->revoke($invite);

        return response()->json($this->invites->serializeDetail($invite));
    }

    public function resendCopy(Invite $invite): JsonResponse
    {
        return response()->json($this->emailDelivery->resendClientCopyForInvite($invite));
    }
}
