<?php

namespace App\Enums;

enum AiMessageType: string
{
    case MicroReply = 'micro_reply';
    case Farewell = 'farewell';
}
