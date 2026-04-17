# Implementasi Manajemen Proposal (BIMA Mirror Edition)

Sistem akan dikembangkan untuk mengadopsi alur kerja BIMA (Ditjen Diktiristek) yang lebih komprehensif, mencakup validasi bertahap (Stepper), kolaborasi tim (Member Consent), dan pelaporan anggaran yang detail.

## User Review Required

> [!IMPORTANT]
> **Persetujuan Anggota (Consent)**: Anggota tim harus login ke sistem untuk memberikan persetujuan sebelum proposal dapat dikirim. Apakah sistem perlu mengirimkan notifikasi email otomatis saat ditambahkan sebagai anggota?

> [!CAUTION]
> **Perubahan Database**: Fitur ini melibatkan penambahan 4 tabel baru dan migrasi pada tabel yang sudah ada. Mohon dipastikan database lokal sudah dalam kondisi siap dimigrasi.

## Proposed Changes

### 1. Database & Models Expansion

#### [NEW] [proposal_identitiy](file:///c:/Users/del/Music/lppm-management/app/Models/ProposalIdentity.php)
#### [NEW] [proposal_personnel](file:///c:/Users/del/Music/lppm-management/app/Models/ProposalPersonnel.php)
#### [NEW] [proposal_output](file:///c:/Users/del/Music/lppm-management/app/Models/ProposalOutput.php)
#### [NEW] [proposal_budget_item](file:///c:/Users/del/Music/lppm-management/app/Models/ProposalBudgetItem.php)

- Menambahkan field `current_step` pada tabel `proposals` untuk melacak progres Stepper.
- Menambahkan field `university_cluster` pada tabel `system_settings` (Mandiri/Utama/Madya/Binaan).
- Menambahkan field `eligible_clusters` pada tabel `schemes`.

### 2. Backend Logic (Workflow)

#### [MODIFY] [ProposalController.php](file:///c:/Users/del/Music/lppm-management/app/Http/Controllers/ProposalController.php)
- Implementasi API untuk menyimpan data per tahap (step-by-step save).
- Logika validasi eligibilitas skema berdasarkan klaster PT.
- Logika pengecekan status konfirmasi seluruh anggota sebelum "Submit".

#### [NEW] [MemberConsentController.php](file:///c:/Users/del/Music/lppm-management/app/Http/Controllers/MemberConsentController.php)
- Endpoint khusus untuk anggota melihat daftar proposal yang mengikutsertakan mereka dan memberikan persetujuan.

### 3. Frontend (UI Implementation)

#### [NEW] [ProposalStepper.jsx](file:///c:/Users/del/Music/lppm-management/resources/js/pages/proposals/Stepper.jsx)
- Komponen induk Stepper dengan visual progres (centang hijau).
- Implementasi sub-halaman:
    - **Step 0**: Kuesioner TKT (Teknologi Kesiapan Terapan).
    - **Step 1**: Identitas & Bidang Fokus.
    - **Step 2**: Personil (Input NIDN/NIM + Tugas).
    - **Step 3**: Luaran (Wajib & Tambahan).
    - **Step 4**: RAB (Rincian Anggaran per Tahun).
    - **Step 5**: Unggah Dokumen Substansi & Submit.

### 4. Dokumentasi Otomatis
- Menggunakan `laravel-dompdf` untuk meng-generate **Lembar Pengesahan** secara otomatis setelah status berubah menjadi "Dikirim".

## Open Questions

- Apakah **Kuesioner TKT** memiliki poin penilaian atau hanya sekadar kategori (Dasar vs Terapan)?
- Terkait **Klaster PT**, apakah per skema bisa memiliki lebih dari satu klaster yang diperbolehkan (misal: Mandiri dan Utama)?

## Verification Plan

### Automated/Unit Tests
- Menjalankan `php artisan migrate` untuk memastikan skema tabel baru valid.
- Menguji API `PUT /api/proposals/{id}/step` untuk validasi penyimpanan parsial.

### Manual Verification
1. Login sebagai Dosen, buat proposal baru.
2. Verifikasi stepper tidak bisa loncat tahap jika tahap sebelumnya belum tervalidasi.
3. Tambahkan anggota, lalu login sebagai akun anggota tersebut untuk menekan tombol "Setuju".
4. Verifikasi tombol "Submit" muncul hanya setelah semua anggota setuju.
5. Verifikasi PDF Lembar Pengesahan dapat diunduh setelah dikirim.
