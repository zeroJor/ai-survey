<?php

namespace App\Support;

use App\Models\Invite;

class InviteTemplateFill
{
    public static function apply(string $text, Invite $invite): string
    {
        return str_replace(
            ['{{contactName}}', '{{businessName}}'],
            [$invite->contact_name, $invite->business_name],
            $text,
        );
    }
}
