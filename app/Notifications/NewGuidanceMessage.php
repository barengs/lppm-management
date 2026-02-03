<?php

namespace App\Notifications;

use App\Models\KknGuidanceMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class NewGuidanceMessage extends Notification implements ShouldQueue
{
    use Queueable;

    public $message;

    /**
     * Create a new notification instance.
     */
    public function __construct(KknGuidanceMessage $message)
    {
        $this->message = $message;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Pesan Bimbingan Baru',
            'body' => $this->message->user->name . ': ' . \Illuminate\Support\Str::limit($this->message->message, 50),
            'action_url' => '/kkn/guidance?topic=' . $this->message->kkn_guidance_topic_id,
            'topic_id' => $this->message->kkn_guidance_topic_id,
            'sender_id' => $this->message->user_id,
            'sender_name' => $this->message->user->name,
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => 'Pesan Bimbingan Baru',
            'body' => $this->message->user->name . ': ' . \Illuminate\Support\Str::limit($this->message->message, 50),
            'topic_id' => $this->message->kkn_guidance_topic_id,
            'created_at' => now()->toIso8601String(),
        ]);
    }
}
