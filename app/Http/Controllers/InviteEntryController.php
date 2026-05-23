<?php

namespace App\Http\Controllers;

use App\Services\Interview\InterviewSessionService;
use App\Services\Interview\InviteEntryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class InviteEntryController extends Controller
{
    public function __construct(
        private readonly InviteEntryService $entry,
        private readonly InterviewSessionService $sessions,
    ) {}

    public function show(Request $request): RedirectResponse
    {
        $result = $this->entry->handle(
            $request->query('t'),
            $request->has('reset'),
        );

        $redirect = redirect($result->redirectPath);

        if ($result->session !== null) {
            $redirect = $this->sessions->attachCookie($redirect, $result->session);
        }

        return $redirect;
    }
}
