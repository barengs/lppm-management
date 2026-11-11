import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 20,
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
        color: '#1f2937',
    },
    outerFrame: {
        flex: 1,
        borderWidth: 3.5,
        borderColor: '#14532d',
        padding: 4,
    },
    innerFrame: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: '#c9a227',
        paddingTop: 14,
        paddingBottom: 16,
        paddingHorizontal: 26,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#14532d',
        paddingBottom: 8,
    },
    logoBox: {
        width: 64,
        height: 64,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    logoImage: {
        width: 58,
        height: 58,
        objectFit: 'contain',
    },
    headerText: {
        flex: 1,
        alignItems: 'center',
        textAlign: 'center',
    },
    headerSpacer: {
        width: 64,
    },
    univName: {
        fontSize: 15,
        fontFamily: 'Helvetica-Bold',
        color: '#14532d',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 2,
    },
    lppmName: {
        fontSize: 10.5,
        fontFamily: 'Helvetica-Bold',
        color: '#1f2937',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        marginBottom: 3,
    },
    lppmAddress: {
        fontSize: 8,
        color: '#6b7280',
    },
    titleBlock: {
        alignItems: 'center',
        textAlign: 'center',
        marginTop: 6,
    },
    certTitle: {
        fontSize: 24,
        fontFamily: 'Helvetica-Bold',
        color: '#14532d',
        letterSpacing: 4,
        textTransform: 'uppercase',
    },
    certSubtitle: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        color: '#b45309',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginTop: 3,
        marginBottom: 6,
    },
    certNumberBadge: {
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 3,
        paddingVertical: 3,
        paddingHorizontal: 12,
    },
    certNumberText: {
        fontSize: 8.5,
        color: '#374151',
    },
    bodyBlock: {
        alignItems: 'center',
        textAlign: 'center',
    },
    introText: {
        fontSize: 10,
        color: '#4b5563',
        marginBottom: 4,
    },
    recipientNameWrap: {
        borderBottomWidth: 1.5,
        borderBottomColor: '#c9a227',
        paddingBottom: 4,
        paddingHorizontal: 28,
        marginBottom: 6,
    },
    recipientName: {
        fontSize: 20,
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        textAlign: 'center',
    },
    recipientMeta: {
        fontSize: 9.5,
        color: '#374151',
        marginBottom: 10,
    },
    metaBold: {
        fontFamily: 'Helvetica-Bold',
        color: '#111827',
    },
    completionText: {
        fontSize: 10,
        color: '#1f2937',
        lineHeight: 1.5,
        width: '86%',
        textAlign: 'center',
        marginBottom: 12,
    },
    gradeBox: {
        flexDirection: 'row',
        borderWidth: 1.5,
        borderColor: '#14532d',
        backgroundColor: '#f0fdf4',
    },
    gradeCellLeft: {
        paddingVertical: 6,
        paddingHorizontal: 22,
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: '#bbf7d0',
    },
    gradeCellRight: {
        paddingVertical: 6,
        paddingHorizontal: 22,
        alignItems: 'center',
    },
    gradeLabel: {
        fontSize: 7.5,
        color: '#4b5563',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 2,
    },
    gradeValue: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        color: '#14532d',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    footerLeft: {
        width: '56%',
        fontSize: 8,
        color: '#6b7280',
        lineHeight: 1.4,
    },
    footerRight: {
        width: '40%',
        alignItems: 'center',
        textAlign: 'center',
        fontSize: 9.5,
        color: '#1f2937',
    },
    signatureSpace: {
        height: 42,
    },
    signerName: {
        fontFamily: 'Helvetica-Bold',
        textDecoration: 'underline',
        color: '#111827',
        fontSize: 9.5,
    },
    signerNidn: {
        fontSize: 8.5,
        color: '#4b5563',
        marginTop: 2,
    },
});

function formatLokasiText(data) {
    const parts = [];
    if (data?.village) parts.push(`Desa ${data.village}`);
    if (data?.district) parts.push(`Kec. ${data.district}`);
    if (data?.city) parts.push(data.city);

    if (parts.length > 0) {
        return parts.join(', ');
    }
    return data?.location && data.location !== '-' ? data.location : '-';
}

export default function KknCertificateDocument({ data, logoSrc }) {
    const universityName = data?.university_name || 'Universitas Islam Madura';
    const lppmAddress =
        data?.lppm_address ||
        'Jl. Pondok Pesantren Miftahul Ulum Bettet, Pamekasan, Jawa Timur';
    const year = data?.year || new Date().getFullYear();
    const subtitle = data?.period_name
        ? `Kuliah Kerja Nyata (KKN) — ${data.period_name}`
        : `Kuliah Kerja Nyata (KKN) Tahun ${year}`;
    const lokasiText = formatLokasiText(data);

    return (
        <Document title={`Sertifikat KKN - ${data?.name || 'Mahasiswa'}`}>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <View style={styles.outerFrame}>
                    <View style={styles.innerFrame}>
                        {/* Kop / Header */}
                        <View style={styles.header}>
                            <View style={styles.logoBox}>
                                {logoSrc ? (
                                    <Image src={logoSrc} style={styles.logoImage} />
                                ) : null}
                            </View>
                            <View style={styles.headerText}>
                                <Text style={styles.univName}>{universityName}</Text>
                                <Text style={styles.lppmName}>
                                    Lembaga Penelitian dan Pengabdian kepada Masyarakat (LPPM)
                                </Text>
                                <Text style={styles.lppmAddress}>{lppmAddress}</Text>
                            </View>
                            <View style={styles.headerSpacer} />
                        </View>

                        {/* Judul Sertifikat */}
                        <View style={styles.titleBlock}>
                            <Text style={styles.certTitle}>Sertifikat</Text>
                            <Text style={styles.certSubtitle}>{subtitle}</Text>
                            <View style={styles.certNumberBadge}>
                                <Text style={styles.certNumberText}>
                                    Nomor: {data?.certificate_number || '-'}
                                </Text>
                            </View>
                        </View>

                        {/* Isi Sertifikat */}
                        <View style={styles.bodyBlock}>
                            <Text style={styles.introText}>Diberikan kepada:</Text>
                            <View style={styles.recipientNameWrap}>
                                <Text style={styles.recipientName}>
                                    {data?.name || '-'}
                                </Text>
                            </View>
                            <Text style={styles.recipientMeta}>
                                <Text style={styles.metaBold}>NPM:</Text> {data?.npm || '-'}
                                {'   |   '}
                                <Text style={styles.metaBold}>Program Studi:</Text>{' '}
                                {data?.prodi || '-'}
                                {data?.faculty && data.faculty !== '-' ? (
                                    <>
                                        {'   |   '}
                                        <Text style={styles.metaBold}>Fakultas:</Text>{' '}
                                        {data.faculty}
                                    </>
                                ) : null}
                            </Text>

                            <Text style={styles.completionText}>
                                Telah melaksanakan dan menyelesaikan seluruh rangkaian kegiatan{' '}
                                <Text style={styles.metaBold}>
                                    Kuliah Kerja Nyata (KKN) Tahun {year}
                                </Text>
                                {data?.posto_name ? (
                                    <>
                                        {' pada '}
                                        <Text style={styles.metaBold}>{data.posto_name}</Text>
                                    </>
                                ) : null}
                                {' di '}
                                <Text style={styles.metaBold}>{lokasiText}</Text> dengan hasil:
                            </Text>

                            <View style={styles.gradeBox}>
                                <View style={styles.gradeCellLeft}>
                                    <Text style={styles.gradeLabel}>Nilai Akhir</Text>
                                    <Text style={styles.gradeValue}>
                                        {data?.score ?? '-'}
                                    </Text>
                                </View>
                                <View style={styles.gradeCellRight}>
                                    <Text style={styles.gradeLabel}>Predikat</Text>
                                    <Text style={styles.gradeValue}>
                                        {data?.grade ?? '-'}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Tanda Tangan */}
                        <View style={styles.footer}>
                            <View style={styles.footerLeft}>
                                <Text>
                                    Sertifikat ini diterbitkan secara resmi melalui Sistem
                                    Informasi Tata Kelola LPPM {universityName}.
                                </Text>
                            </View>
                            <View style={styles.footerRight}>
                                <Text>Pamekasan, {data?.date || '-'}</Text>
                                <Text>{data?.ketua_title || 'Ketua LPPM'},</Text>
                                <View style={styles.signatureSpace} />
                                <Text style={styles.signerName}>
                                    {data?.ketua_name || 'Ketua LPPM'}
                                </Text>
                                {data?.ketua_nidn ? (
                                    <Text style={styles.signerNidn}>
                                        NIDN. {data.ketua_nidn}
                                    </Text>
                                ) : null}
                            </View>
                        </View>
                    </View>
                </View>
            </Page>
        </Document>
    );
}

