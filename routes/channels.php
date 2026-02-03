<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('guidance.{topicId}', function ($user, $topicId) {
    // Check if user is part of the topic (creator or DPL of the posto)
    $topic = \App\Models\KknGuidanceTopic::find($topicId);
    if (!$topic) return false;

    // 1. Topic Creator
    if ($topic->user_id === $user->id) return true;

    // 2. DPL of the Posto
    $posto = $topic->posto;
    if ($posto && $posto->dpl_id === $user->id) return true;

    return false;
});
