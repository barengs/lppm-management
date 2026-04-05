<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class KknStatusNotification extends Notification
{
    use Queueable;

    protected $registration;
    protected $status;
    protected $note;

    /**
     * Create a new notification instance.
     */
    public function __construct($registration, $status, $note = null)
    {
        $this->registration = $registration;
        $this->status = $status;
        $this->note = $note;
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
        $statusLabels = [
            'approved' => 'Disetujui',
            'rejected' => 'Ditolak',
            'needs_revision' => 'Perlu Revisi',
        ];

        $title = "Update Status Pendaftaran KKN: " . ($statusLabels[$this->status] ?? $this->status);
        $body = "Pendaftaran KKN Anda telah diperbarui menjadi " . ($statusLabels[$this->status] ?? $this->status);
        
        if ($this->note) {
            $body .= ". Catatan: " . $this->note;
        }

        return [
            'registration_id' => $this->registration->id,
            'status' => $this->status,
            'title' => $title,
            'body' => $body,
            'action_url' => '/dashboard/kkn/status',
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
