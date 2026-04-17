<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ProposalNotification extends Notification
{
    use Queueable;

    protected $proposal;
    protected $message;
    protected $actionUrl;

    /**
     * Create a new notification instance.
     */
    public function __construct($proposal, $message, $actionUrl = '/proposals')
    {
        $this->proposal = $proposal;
        $this->message = $message;
        $this->actionUrl = $actionUrl;
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
            'proposal_id' => $this->proposal->id,
            'title' => 'Revisi Usulan',
            'body' => $this->message,
            'action_url' => $this->actionUrl,
            'icon' => 'AlertCircle'
        ];
    }
}
