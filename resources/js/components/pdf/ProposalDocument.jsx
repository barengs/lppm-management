import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { stripHtml, formatCurrency } from '../../utils/pdfHelper';

// Register fallback or standard fonts if needed
// For now we use standard fonts: Helvetica, Helvetica-Bold

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
    color: '#333',
  },
  section: {
    marginBottom: 10,
  },
  titleTop: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 30,
    textTransform: 'uppercase',
  },
  logo: {
    width: 100,
    height: 'auto',
    alignSelf: 'center',
    marginVertical: 30,
  },
  proposalTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    width: '80%',
    alignSelf: 'center',
    marginVertical: 30,
    textTransform: 'uppercase',
  },
  authorInfo: {
    textAlign: 'center',
    marginVertical: 40,
  },
  footerInfo: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  endorsementHeader: {
    textAlign: 'center',
    borderBottom: 1,
    paddingBottom: 5,
    marginBottom: 10,
  },
  endorsementTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    textDecoration: 'underline',
    marginVertical: 15,
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    backgroundColor: '#f0f0f0',
    padding: 4,
    marginBottom: 8,
    borderLeft: 3,
    borderLeftColor: '#000',
  },
  table: {
    display: 'table',
    width: 'auto',
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColLabel: {
    width: '30%',
    padding: 4,
  },
  tableColVal: {
    width: '70%',
    padding: 4,
    fontFamily: 'Helvetica-Bold',
  },
  gridHeader: {
    backgroundColor: '#f0f0f0',
    fontFamily: 'Helvetica-Bold',
    borderTop: 0.5,
    borderBottom: 0.5,
  },
  gridCell: {
    borderBottom: 0.5,
    padding: 4,
    fontSize: 9,
  },
  signatureTable: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureCol: {
    width: '30%',
    textAlign: 'center',
  },
  signatureSpace: {
    height: 50,
  },
  signatureName: {
    fontFamily: 'Helvetica-Bold',
    textDecoration: 'underline',
  }
});

const ProposalDocument = ({ data, settings, type = 'research' }) => {
  const isPkm = type === 'pkm';
  const coverSetting = isPkm ? settings?.pkm : settings?.penelitian;
  const year = data.fiscal_year?.year || new Date().getFullYear();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <Document>
      {/* COVER PAGE */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.titleTop}>{coverSetting?.title_top || 'USULAN PROPOSAL'}</Text>
        
        {coverSetting?.logo_path && (
          <Image 
            src={`${origin}/storage/${coverSetting.logo_path}`} 
            style={styles.logo} 
          />
        )}

        <Text style={styles.proposalTitle}>{data.title}</Text>

        <View style={styles.authorInfo}>
          <Text>Oleh:</Text>
          <Text style={{ fontFamily: 'Helvetica-Bold', marginTop: 5 }}>{data.user?.name}</Text>
          <Text>NIDN. {data.user?.dosen_profile?.nidn || '-'}</Text>
        </View>

        <View style={styles.footerInfo}>
          {coverSetting?.title_bottom_prodi && <Text>{coverSetting.title_bottom_prodi}</Text>}
          {coverSetting?.title_bottom_faculty && <Text>{coverSetting.title_bottom_faculty}</Text>}
          {coverSetting?.title_bottom_university && <Text>{coverSetting.title_bottom_university}</Text>}
          <Text>{year}</Text>
        </View>
      </Page>

      {/* ENDORSEMENT PAGE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.endorsementHeader}>
          <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 13 }}>Lembaga Penelitian dan Pengabdian Masyarakat</Text>
          <Text>{coverSetting?.title_bottom_university || 'Universitas Islam Madura'}</Text>
        </View>

        <Text style={styles.endorsementTitle}>HALAMAN PENGESAHAN USULAN</Text>

        <View style={styles.sectionTitle}>
          <Text>A. IDENTITAS USULAN</Text>
        </View>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Judul Usulan</Text>
            <Text style={styles.tableColVal}>{data.title}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Skema</Text>
            <Text style={styles.tableColVal}>{isPkm ? data.scheme_group : data.scheme?.name}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Tahun Akademik</Text>
            <Text style={styles.tableColVal}>{year}</Text>
          </View>
        </View>

        <View style={styles.sectionTitle}>
          <Text>B. TIM PENGUSUL</Text>
        </View>
        <View style={[styles.table, { borderTop: 0.5, borderLeft: 0.5, borderRight: 0.5 }]}>
          <View style={[styles.tableRow, styles.gridHeader]}>
            <Text style={[styles.gridCell, { width: '10%', textAlign: 'center' }]}>No</Text>
            <Text style={[styles.gridCell, { width: '50%' }]}>Nama / Identitas</Text>
            <Text style={[styles.gridCell, { width: '40%' }]}>Peran</Text>
          </View>
          {data.personnel?.map((p, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.gridCell, { width: '10%', textAlign: 'center' }]}>{idx + 1}</Text>
              <Text style={[styles.gridCell, { width: '50%' }]}>
                {p.type === 'mahasiswa' ? (p.student_name || p.name) : (p.user?.name || '-')}
                {'\n'}
                {p.type === 'mahasiswa' ? `NIM: ${p.student_nim || p.nim}` : `NIDN: ${p.user?.dosen_profile?.nidn || '-'}`}
              </Text>
              <Text style={[styles.gridCell, { width: '40%' }]}>{p.role?.toUpperCase()}</Text>
            </View>
          ))}
        </View>

        <View style={styles.signatureTable}>
          <View style={styles.signatureCol}>
            <Text>Mengetahui,</Text>
            <Text>Dekan Fakultas</Text>
            <View style={styles.signatureSpace} />
            <Text>( ................................ )</Text>
          </View>
          <View style={styles.signatureCol}>
            <Text>LPPM,</Text>
            <Text>Kepala LPPM</Text>
            <View style={styles.signatureSpace} />
            <Text>( ................................ )</Text>
          </View>
          <View style={styles.signatureCol}>
            <Text>Pamekasan, {new Date().toLocaleDateString('id-ID')}</Text>
            <Text>Ketua Pengusul,</Text>
            <View style={styles.signatureSpace} />
            <Text style={styles.signatureName}>{data.user?.name}</Text>
          </View>
        </View>
      </Page>

      {/* CONTENT PAGE (SUBSTANCE) */}
      <Page size="A4" style={styles.page}>
        <View style={styles.sectionTitle}>
          <Text>C. SUBSTANSI USULAN</Text>
        </View>
        
        {!isPkm ? (
          <View>
            <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 5 }}>Abstrak</Text>
            <Text style={{ marginBottom: 15 }}>{stripHtml(data.content?.abstract)}</Text>
            
            <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 5 }}>Latar Belakang</Text>
            <Text style={{ marginBottom: 15 }}>{stripHtml(data.content?.background)}</Text>
            
            <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 5 }}>Tujuan</Text>
            <Text style={{ marginBottom: 15 }}>{stripHtml(data.content?.objectives)}</Text>

            <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 5 }}>Metodologi</Text>
            <Text style={{ marginBottom: 15 }}>{stripHtml(data.content?.methodology)}</Text>
          </View>
        ) : (
          <View>
             <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 5 }}>Ringkasan PKM</Text>
             <Text style={{ marginBottom: 15 }}>{stripHtml(data.summary)}</Text>

             <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 5 }}>Target SDGs</Text>
             {data.substance?.sdg_goals?.map((g, i) => (
               <Text key={i} style={{ marginBottom: 5 }}>• {g.goal}: {g.indicator}</Text>
             ))}

             <Text style={{ fontFamily: 'Helvetica-Bold', marginTop: 10, marginBottom: 5 }}>Masalah & Solusi (Bidang Strategis)</Text>
             {data.substance?.strategic_fields?.map((f, i) => (
               <View key={i} style={{ marginBottom: 10, borderLeft: 1, borderLeftColor: '#eee', paddingLeft: 10 }}>
                 <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 9 }}>{f.field}</Text>
                 <Text style={{ fontSize: 9, italic: true }}>Masalah: {f.problem_statement}</Text>
                 <Text style={{ fontSize: 9 }}>Solusi: {f.description}</Text>
               </View>
             ))}
          </View>
        )}

        <View style={styles.sectionTitle}>
          <Text>D. RENCANA ANGGARAN BIAYA</Text>
        </View>
        <View style={[styles.table, { borderTop: 0.5, borderLeft: 0.5, borderRight: 0.5 }]}>
          <View style={[styles.tableRow, styles.gridHeader]}>
            <Text style={[styles.gridCell, { width: '40%' }]}>Item / Komponen</Text>
            <Text style={[styles.gridCell, { width: '20%', textAlign: 'right' }]}>Vol</Text>
            <Text style={[styles.gridCell, { width: '40%', textAlign: 'right' }]}>Subtotal</Text>
          </View>
          {data.budget_items?.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.gridCell, { width: '40%' }]}>{item.item_name}</Text>
              <Text style={[styles.gridCell, { width: '20%', textAlign: 'right' }]}>{item.quantity || item.volume}</Text>
              <Text style={[styles.gridCell, { width: '40%', textAlign: 'right' }]}>{formatCurrency(item.total_cost)}</Text>
            </View>
          ))}
          <View style={[styles.tableRow, { backgroundColor: '#f9f9f9' }]}>
            <Text style={[styles.gridCell, { width: '60%', fontFamily: 'Helvetica-Bold', textAlign: 'right' }]}>TOTAL</Text>
            <Text style={[styles.gridCell, { width: '40%', fontFamily: 'Helvetica-Bold', textAlign: 'right' }]}>{formatCurrency(data.budget)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ProposalDocument;
