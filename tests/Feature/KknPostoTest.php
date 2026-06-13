<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\KknPosto;
use App\Models\KknPostoMember;
use App\Models\KknLocation;
use App\Models\KknRegistration;
use App\Models\FiscalYear;
use App\Models\KknPeriod;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class KknPostoTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $dpl;
    protected $posto;
    protected $students = [];

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);

        // Create Admin
        $this->admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
        ]);
        $this->admin->assignRole('admin');

        // Create DPL
        $this->dpl = User::create([
            'name' => 'DPL',
            'email' => 'dpl@test.com',
            'password' => Hash::make('password'),
        ]);
        $this->dpl->assignRole('dosen');
        $this->dpl->assignRole('dpl_kkn');
        $this->dpl->dosenProfile()->create([
            'nidn' => '1234567890',
            'prodi' => 'Test',
            'fakultas' => 'Test',
        ]);

        $fiscalYear = FiscalYear::create([
            'year' => 2026,
            'is_active' => true,
        ]);

        $period = KknPeriod::create([
            'name' => 'KKN 2026',
            'year' => 2026,
            'start_date' => '2026-07-01',
            'end_date' => '2026-08-15',
            'is_active' => true,
        ]);

        $location = KknLocation::create([
            'fiscal_year_id' => $fiscalYear->id,
            'name' => 'Desa Test',
            'quota' => 20,
        ]);

        $this->posto = KknPosto::create([
            'name' => 'Posto Test',
            'kkn_location_id' => $location->id,
            'kkn_period_id' => $period->id,
            'fiscal_year_id' => $fiscalYear->id,
            'dpl_id' => $this->dpl->id,
            'status' => 'draft',
        ]);

        // Create 3 students
        for ($i = 1; $i <= 3; $i++) {
            $student = User::create([
                'name' => "Student {$i}",
                'email' => "student{$i}@test.com",
                'password' => Hash::make('password'),
            ]);
            $student->assignRole('mahasiswa');
            $student->mahasiswaProfile()->create([
                'npm' => "100{$i}",
                'prodi' => 'Test',
                'fakultas' => 'Test',
            ]);

            $reg = KknRegistration::create([
                'student_id' => $student->id,
                'kkn_location_id' => $location->id,
                'fiscal_year_id' => $fiscalYear->id,
                'kkn_period_id' => $period->id,
                'status' => 'approved',
                'kkn_posto_id' => $this->posto->id,
            ]);

            $member = KknPostoMember::create([
                'kkn_posto_id' => $this->posto->id,
                'student_id' => $student->id,
                'kkn_registration_id' => $reg->id,
                'position' => 'anggota',
                'joined_at' => now(),
                'status' => 'active',
            ]);

            $this->students[] = $member;
        }
    }

    public function test_automatic_activation_on_position_change()
    {
        $this->assertEquals('draft', $this->posto->fresh()->status);

        // Update student 1 to kordes
        $response = $this->actingAs($this->admin, 'api')
            ->putJson("/api/kkn/postos/{$this->posto->id}/members/{$this->students[0]->id}", [
                'position' => 'kordes'
            ]);
        $response->assertStatus(200);
        $this->assertEquals('draft', $this->posto->fresh()->status);

        // Update student 2 to sekretaris
        $response = $this->actingAs($this->admin, 'api')
            ->putJson("/api/kkn/postos/{$this->posto->id}/members/{$this->students[1]->id}", [
                'position' => 'sekretaris'
            ]);
        $response->assertStatus(200);
        $this->assertEquals('draft', $this->posto->fresh()->status);

        // Update student 3 to bendahara
        $response = $this->actingAs($this->admin, 'api')
            ->putJson("/api/kkn/postos/{$this->posto->id}/members/{$this->students[2]->id}", [
                'position' => 'bendahara'
            ]);
        $response->assertStatus(200);

        // Now posto should be active automatically!
        $this->assertEquals('active', $this->posto->fresh()->status);
    }

    public function test_inactive_members_do_not_count_towards_activation()
    {
        $this->assertEquals('draft', $this->posto->fresh()->status);

        // Update positions to Kordes, Sekretaris, Bendahara, but set Kordes to inactive
        $this->students[0]->update(['position' => 'kordes', 'status' => 'inactive']);
        $this->students[1]->update(['position' => 'sekretaris', 'status' => 'active']);
        $this->students[2]->update(['position' => 'bendahara', 'status' => 'active']);

        $this->assertFalse($this->posto->isComplete());
        $this->assertEquals('draft', $this->posto->fresh()->status);
    }

    public function test_observer_syncs_status_on_member_save_and_delete()
    {
        $this->assertEquals('draft', $this->posto->fresh()->status);

        // Assign Kordes, Sekretaris, Bendahara directly to trigger saved observer
        $this->students[0]->update(['position' => 'kordes']);
        $this->students[1]->update(['position' => 'sekretaris']);
        $this->students[2]->update(['position' => 'bendahara']);

        // Posto should be active due to model saved event
        $this->assertEquals('active', $this->posto->fresh()->status);

        // Delete one officer to trigger deleted observer
        $this->students[0]->delete();

        // Posto should go back to draft status
        $this->assertEquals('draft', $this->posto->fresh()->status);
    }

    public function test_retrieval_self_corrects_status()
    {
        $this->assertEquals('draft', $this->posto->fresh()->status);

        // Bypass model events by doing a raw DB update to make the structure complete without updating status
        \Illuminate\Support\Facades\DB::table('kkn_posto_members')
            ->where('id', $this->students[0]->id)
            ->update(['position' => 'kordes']);
        \Illuminate\Support\Facades\DB::table('kkn_posto_members')
            ->where('id', $this->students[1]->id)
            ->update(['position' => 'sekretaris']);
        \Illuminate\Support\Facades\DB::table('kkn_posto_members')
            ->where('id', $this->students[2]->id)
            ->update(['position' => 'bendahara']);

        // In DB, status is still draft
        $this->assertEquals('draft', \Illuminate\Support\Facades\DB::table('kkn_postos')->where('id', $this->posto->id)->value('status'));

        // Call show endpoint - it should self-correct and return active status
        $response = $this->actingAs($this->admin, 'api')
            ->getJson("/api/kkn/postos/{$this->posto->id}");
        $response->assertStatus(200);
        $response->assertJsonPath('status', 'active');

        // DB status should now be active
        $this->assertEquals('active', \Illuminate\Support\Facades\DB::table('kkn_postos')->where('id', $this->posto->id)->value('status'));
    }

    public function test_dpl_without_global_permission_can_manage_members()
    {
        // Create a Dosen user who is the designated DPL, but DOES NOT have dpl_kkn role or manage_members permission
        $dosenDpl = User::create([
            'name' => 'Dosen DPL Only',
            'email' => 'dosen_dpl@test.com',
            'password' => Hash::make('password'),
        ]);
        $dosenDpl->assignRole('dosen'); // Only dosen role
        $dosenDpl->dosenProfile()->create([
            'nidn' => '9999999999',
            'prodi' => 'Test',
            'fakultas' => 'Test',
        ]);

        // Assign him as the DPL of this posto
        $this->posto->update(['dpl_id' => $dosenDpl->id]);

        // He should be able to update member position successfully
        $response = $this->actingAs($dosenDpl, 'api')
            ->putJson("/api/kkn/postos/{$this->posto->id}/members/{$this->students[0]->id}", [
                'position' => 'kordes'
            ]);
        $response->assertStatus(200);

        // A different Dosen who is not the DPL of this posto should be unauthorized (403)
        $otherDosen = User::create([
            'name' => 'Other Dosen',
            'email' => 'other_dosen@test.com',
            'password' => Hash::make('password'),
        ]);
        $otherDosen->assignRole('dosen');
        $otherDosen->dosenProfile()->create([
            'nidn' => '8888888888',
            'prodi' => 'Test',
            'fakultas' => 'Test',
        ]);

        $response = $this->actingAs($otherDosen, 'api')
            ->putJson("/api/kkn/postos/{$this->posto->id}/members/{$this->students[0]->id}", [
                'position' => 'sekretaris'
            ]);
        $response->assertStatus(403);
    }

    public function test_grading_filter_by_posto_id()
    {
        $response = $this->actingAs($this->admin, 'api')
            ->getJson("/api/kkn-grades?kkn_posto_id={$this->posto->id}");
        $response->assertStatus(200);

        $data = $response->json('data.data');
        $this->assertCount(3, $data);
        
        $registrationIds = array_column($data, 'id');
        foreach ($this->students as $member) {
            $this->assertContains($member->kkn_registration_id, $registrationIds);
        }
    }

    public function test_dpl_students_filter_by_posto_id()
    {
        $dosenDpl = User::create([
            'name' => 'Dosen DPL Only 2',
            'email' => 'dosen_dpl2@test.com',
            'password' => Hash::make('password'),
        ]);
        $dosenDpl->assignRole('dosen');
        $dosenDpl->dosenProfile()->create([
            'nidn' => '9999999998',
            'prodi' => 'Test',
            'fakultas' => 'Test',
        ]);
        $this->posto->update(['dpl_id' => $dosenDpl->id]);

        $response = $this->actingAs($dosenDpl, 'api')
            ->getJson("/api/kkn-grades/dpl-students?kkn_posto_id={$this->posto->id}");
        $response->assertStatus(200);
        $this->assertCount(3, $response->json('data'));
    }
}
