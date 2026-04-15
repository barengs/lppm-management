<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProposalInvitationNotification extends Notification
{
    use Queueable;

    protected $proposal;
    protected $chairman;
    protected $role;
    protected $consentId;

    /**
     * Create a new notification instance.
     */
    public function __construct($proposal, $chairman, $role, $consentId)
    {
        $this->proposal = $proposal;
        $this->chairman = $chairman;
        $this->role = $role;
        $this->consentId = $consentId;
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
            'title' => 'Undangan Anggota Usulan',
            'body' => "Dosen {$this->chairman->name} mengundang Anda sebagai {$this->role} pada usulan: {$this->proposal->title}",
            'action_url' => "/dashboard?consent_id={$this->consentId}",
            'proposal_id' => $this->proposal->id,
            'type' => 'proposal_invitation'
        ];
    }
}
