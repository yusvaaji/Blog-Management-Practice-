## Records of Processing Activities (Processor) — Vervast.com (Example)

Gunakan dokumen ini sebagai referensi ketika mengisi lembar Excel *Records of Processing Activities (Processor)* sesuai Pasal 30 GDPR. Sesuaikan semua data dengan informasi legal dan operasional Vervast.com yang sebenarnya sebelum dibagikan ke pelanggan atau otoritas.

### Identitas Pengolah dan Kontak

| Name and contact details | Data Protection Officer (if applicable) | Representative (if applicable) |
| --- | --- | --- |
| **Name**: Vervast Pte. Ltd. *(ganti dengan nama badan hukum resmi)*<br>**Address**: 160 Robinson Rd, #14-04 Singapore 068914 *(ganti dengan alamat resmi)*<br>**Email**: privacy@vervast.com<br>**Telephone**: +65 6XXX XXXX | **Name**: Ade Putra *(jika tidak menunjuk DPO, ganti menjadi N/A di seluruh kolom)*<br>**Address**: Sama dengan kantor pusat<br>**Email**: dpo@vervast.com<br>**Telephone**: +65 6XXX XXXX | **Name**: N/A *(tambahkan bila diwajibkan menunjuk perwakilan UE/UK)*<br>**Address**: —<br>**Email**: —<br>**Telephone**: — |

### Article 30 Record of Processing Activities

| Controller | Controller representative (if applicable) | Categories of processing | Third countries / international organisations (if applicable) | Safeguards for exceptional transfers | Technical & organisational security measures |
| --- | --- | --- | --- | --- | --- |
| Customer workspace administrators | N/A | - Manajemen akun pengguna (registrasi, autentikasi)<br>- Penyimpanan metadata proyek & lampiran dokumen | AWS ap-southeast-1 (Singapura) & AWS eu-central-1 (Frankfurt) | Standard Contractual Clauses (SCC) | Enkripsi at-rest (AES-256 S3/RDS), TLS 1.2+, segmentasi IAM, audit log akses admin |
| Customer finance teams | N/A | - Penagihan & pembayaran SaaS<br>- Integrasi payment gateway (Stripe) | Stripe (AS & UE) | SCC + Stripe Binding Corporate Rules | Tokenisasi kartu melalui Stripe, tidak menyimpan PAN, TLS, akses berbasis peran |
| Customer end-users | N/A | - Telemetri penggunaan fitur (event logs)<br>- Analitik performa (Amplitude) | Amplitude (AS) dengan cadangan di AWS | SCC + Transfer Impact Assessment | Pseudonimisasi user ID sebelum dikirim, throttling akses, enkripsi in transit |
| Customer support contacts | N/A | - Penanganan tiket support (Zendesk)<br>- Rekaman interaksi email/chat | Zendesk (UE & AS) | SCC + Zendesk DPA | Akses terbatas tim support, MFA wajib, retensi 18 bulan lalu purge |
| Prospective customers | N/A / Marketing contact | - Kampanye onboarding & email automation (HubSpot)<br>- Penyimpanan preferensi komunikasi | HubSpot (UE & AS) | SCC + HubSpot DPA | Pelacakan consent, opt-out otomatis, MFA untuk staf marketing |

### Catatan Tambahan

- **Retention policy**: data akun aktif dipertahankan selama masa kontrak + 90 hari; backup terenkripsi disimpan 35 hari; log akses 12 bulan; tiket support 18 bulan.
- **Incident response**: prosedur 24 jam untuk pemberitahuan ke controller, runbook insiden tersedia di `docs/security/incident-response.md` (perbarui jalur bila berbeda).
- **Sub-processor register**: AWS, Stripe, Amplitude, Zendesk, HubSpot. Pastikan DPA & SCC aktif untuk tiap layanan.
- **Tindakan lanjut**: verifikasi kewajiban penunjukan perwakilan UE/UK dan update detail kontak bila diperlukan.
