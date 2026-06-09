import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 50,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
    color: '#333',
  },
  // Kop Surat
  headerContainer: {
    flexDirection: 'row',
    paddingBottom: 8,
    alignItems: 'center',
  },
  // Double lines under Kop Surat
  doubleLineContainer: {
    marginBottom: 15,
  },
  thickLine: {
    height: 1.5,
    backgroundColor: '#000000',
  },
  lineSpacer: {
    height: 1.5,
  },
  thinLine: {
    height: 0.5,
    backgroundColor: '#000000',
  },
  logo: {
    width: 60,
    height: 'auto',
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    color: '#111',
    marginBottom: 2,
  },
  headerSubTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    color: '#111',
    marginBottom: 3,
  },
  headerInfo: {
    fontSize: 8,
    color: '#555',
  },
  // Document Title
  docTitleContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  docTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    textAlign: 'center',
    textDecoration: 'underline',
  },
  docSubTitle: {
    fontSize: 9,
    marginTop: 2,
    color: '#555',
  },
  // Section Card
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    backgroundColor: '#f3f4f6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderLeft: 3,
    borderLeftColor: '#16a34a', // green accent
    textTransform: 'uppercase',
  },
  // Details Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    borderRadius: 2,
    padding: 6,
  },
  gridItem: {
    width: '50%',
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  gridLabel: {
    fontSize: 8,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 1,
  },
  gridValue: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  gridValueNormal: {
    fontSize: 9,
    color: '#374151',
  },
  // Description block
  descContainer: {
    marginBottom: 15,
    padding: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    borderRadius: 2,
  },
  descText: {
    fontSize: 8.5,
    color: '#4b5563',
  },
  // Table
  table: {
    display: 'table',
    width: '100%',
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: '#d1d5db',
    borderRadius: 2,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableRowHeader: {
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  tableRowOdd: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  tableRowEven: {
    backgroundColor: '#fcfcfc',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  // Table Columns
  colNo: {
    width: '6%',
    textAlign: 'center',
    fontSize: 8,
    padding: 5,
  },
  colName: {
    width: '38%',
    padding: 5,
  },
  colProdi: {
    width: '38%',
    padding: 5,
  },
  colPosition: {
    width: '18%',
    textAlign: 'center',
    padding: 5,
  },
  // Header cells
  headerCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: '#4b5563',
    textTransform: 'uppercase',
  },
  // Cell text styles
  cellName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#1f2937',
    textTransform: 'uppercase',
  },
  cellSub: {
    fontSize: 7.5,
    color: '#6b7280',
    marginTop: 1,
  },
  cellText: {
    fontSize: 8.5,
    color: '#374151',
  },
  badgeContainer: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 2,
    alignSelf: 'center',
  },
  badgeText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  // Signature Block
  signatureContainer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  signatureCol: {
    width: '40%',
    textAlign: 'center',
  },
  signatureDate: {
    marginBottom: 3,
    fontSize: 9,
  },
  signatureRole: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 45,
  },
  signatureName: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
  },
  signatureNidn: {
    fontSize: 8.5,
    color: '#4b5563',
    marginTop: 2,
  },
});

export default function KknGroupDocument({ posto, members, systemSettings }) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Format Date in Indonesian format
  const formatIndonesianDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Sort members order
  const order = {
    kordes: 1,
    sekretaris: 2,
    bendahara: 3,
    humas: 4,
    publikasi: 5,
    anggota: 6
  };

  const sortedMembers = [...(members || [])].sort((a, b) => {
    const orderA = order[a.position] || 99;
    const orderB = order[b.position] || 99;
    return orderA - orderB;
  });

  const logoUrl = systemSettings?.logo_path 
    ? `${origin}/storage/${systemSettings.logo_path}` 
    : `${origin}/images/uim-logo.png`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* KOP SURAT / HEADER */}
        <View style={styles.headerContainer}>
          <Image 
            src={logoUrl} 
            style={styles.logo} 
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>LEMBAGA PENELITIAN DAN PENGABDIAN MASYARAKAT (LPPM)</Text>
            <Text style={styles.headerSubTitle}>{systemSettings?.university_name || 'UNIVERSITAS ISLAM MADURA'}</Text>
            <Text style={styles.headerInfo}>
              {systemSettings?.address || 'Alamat Kampus Utama LPPM'}
            </Text>
            <Text style={styles.headerInfo}>
              Telp: {systemSettings?.phone || '-'} | Email: {systemSettings?.email || '-'}
            </Text>
          </View>
        </View>

        {/* 2 Garis Hitam di Bawah Kop */}
        <View style={styles.doubleLineContainer}>
          <View style={styles.thickLine} />
          <View style={styles.lineSpacer} />
          <View style={styles.thinLine} />
        </View>

        {/* DOCUMENT TITLE */}
        <View style={styles.docTitleContainer}>
          <Text style={styles.docTitle}>LAPORAN DETAIL KELOMPOK KKN</Text>
          <Text style={styles.docSubTitle}>Posko: {posto?.posto?.name}</Text>
        </View>

        {/* SECTION: INFO KELOMPOK */}
        <Text style={styles.sectionTitle}>I. Informasi Posko & Lokasi</Text>
        <View style={styles.gridContainer}>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Nama Posko</Text>
            <Text style={styles.gridValue}>{posto?.posto?.name || '-'}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Tahun Akademik / Periode</Text>
            <Text style={styles.gridValue}>
              {posto?.posto?.fiscal_year?.year || posto?.posto?.kkn_period?.name || '-'}
            </Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Lokasi KKN</Text>
            <Text style={styles.gridValueNormal}>{posto?.posto?.location?.name || '-'}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Alamat Lokasi</Text>
            <Text style={styles.gridValueNormal}>{posto?.posto?.location?.address || '-'}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Dosen Pembimbing Lapangan (DPL)</Text>
            <Text style={styles.gridValueNormal}>{posto?.posto?.dpl?.name || '-'}</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>NIDN DPL</Text>
            <Text style={styles.gridValueNormal}>
              {posto?.posto?.dpl?.dosen_profile?.nidn || posto?.posto?.dpl?.dosenProfile?.nidn || '-'}
            </Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Periode Pelaksanaan</Text>
            <Text style={styles.gridValueNormal}>
              {posto?.posto?.start_date && posto?.posto?.end_date ? (
                `${formatIndonesianDate(posto.posto.start_date)} s/d ${formatIndonesianDate(posto.posto.end_date)}`
              ) : (
                '-'
              )}
            </Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.gridLabel}>Status Posko</Text>
            <Text style={[styles.gridValueNormal, { fontFamily: 'Helvetica-Bold', color: posto?.posto?.status === 'active' ? '#16a34a' : '#ea580c' }]}>
              {posto?.posto?.status === 'active' ? 'AKTIF' : 'DRAFT'}
            </Text>
          </View>
        </View>

        {/* DESCRIPTION BLOCK IF EXISTS */}
        {posto?.posto?.description && (
          <View style={{ marginBottom: 15 }}>
            <Text style={styles.sectionTitle}>Deskripsi / Program Kerja Utama</Text>
            <View style={styles.descContainer}>
              <Text style={styles.descText}>{posto.posto.description}</Text>
            </View>
          </View>
        )}

        {/* SECTION: DAFTAR ANGGOTA */}
        <Text style={styles.sectionTitle}>II. Daftar Anggota Kelompok KKN</Text>
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableRowHeader]}>
            <Text style={[styles.colNo, styles.headerCell]}>No</Text>
            <Text style={[styles.colName, styles.headerCell]}>Nama / NPM</Text>
            <Text style={[styles.colProdi, styles.headerCell]}>Program Studi / Fakultas</Text>
            <Text style={[styles.colPosition, styles.headerCell, { textAlign: 'center' }]}>Jabatan</Text>
          </View>
          
          {/* Table Rows */}
          {sortedMembers.length > 0 ? (
            sortedMembers.map((member, idx) => {
              const isEven = idx % 2 === 1;
              const rowStyle = isEven ? styles.tableRowEven : styles.tableRowOdd;
              return (
                <View key={member.id} style={[styles.tableRow, rowStyle]}>
                  <Text style={styles.colNo}>{idx + 1}</Text>
                  
                  <View style={styles.colName}>
                    <Text style={styles.cellName}>{member.student?.name || '-'}</Text>
                    <Text style={styles.cellSub}>
                      NPM: {member.student?.mahasiswa_profile?.npm || member.student?.mahasiswaProfile?.npm || '-'}
                    </Text>
                  </View>
                  
                  <View style={styles.colProdi}>
                    <Text style={styles.cellText}>
                      {member.student?.mahasiswa_profile?.study_program?.name || member.student?.mahasiswaProfile?.studyProgram?.name || '-'}
                    </Text>
                    <Text style={styles.cellSub}>
                      {member.student?.mahasiswa_profile?.faculty?.name || member.student?.mahasiswaProfile?.faculty?.name || '-'}
                    </Text>
                  </View>
                  
                  <View style={styles.colPosition}>
                    <Text style={[styles.badgeText, { fontFamily: 'Helvetica-Bold', color: '#374151' }]}>
                      {member.position_name || member.position || '-'}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.tableRow}>
              <Text style={{ flex: 1, padding: 10, textAlign: 'center', fontStyle: 'italic', color: '#6b7280' }}>
                Belum ada data anggota kelompok KKN.
              </Text>
            </View>
          )}
        </View>

        {/* SIGNATURE BLOCK */}
        {posto?.posto?.dpl && (
          <View style={styles.signatureContainer}>
            <View style={styles.signatureCol}>
              <Text style={styles.signatureDate}>Pamekasan, {todayStr}</Text>
              <Text style={styles.signatureRole}>Dosen Pembimbing Lapangan,</Text>
              <Text style={styles.signatureName}>{posto.posto.dpl.name}</Text>
              <Text style={styles.signatureNidn}>
                NIDN. {posto.posto.dpl.dosen_profile?.nidn || posto.posto.dpl.dosenProfile?.nidn || '-'}
              </Text>
            </View>
          </View>
        )}

      </Page>
    </Document>
  );
}
