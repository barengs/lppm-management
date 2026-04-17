<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class JournalNotification extends Notification
{
    use Queueable;

    protected $consultation;
    protected $message;
    protected $actionUrl;

    /**
     * Create a new notification instance.
     */
    public function __construct($consultation, $message, $actionUrl = null)
    {
        $this->consultation = $consultation;
        $this->message = $message;
        $this->actionUrl = $actionUrl ?? "/journals/{$consultation->id}";
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'consultation_id' => $this->consultation->id,
            'title' => 'Konsultasi Jurnal',
            'body' => $this->message,
            'action_url' => $this->actionUrl,
            'icon' => 'MessageSquare'
        ];
    }
}
