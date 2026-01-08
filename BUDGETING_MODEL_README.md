# Hospitality Tech CRM - IT Budgeting & Capacity Planning Model

## 📋 Overview

File Excel ini adalah **budgeting model lengkap** untuk IT infrastructure dan manpower planning untuk CRM hospitality tech Anda. Model ini dirancang khusus untuk:

- ✅ **Budgeting TI tahunan** yang realistis
- ✅ **Capacity planning** 1-3 tahun ke depan
- ✅ **Pricing & margin analysis** per tier
- ✅ **Hiring roadmap** untuk tim development
- ✅ **Break-even analysis** untuk bisnis

## 📁 Struktur File Excel

### 1. **Assumptions** (Single Source of Truth)
**Hanya sheet ini yang boleh diubah manual!**

Berisi semua asumsi dasar:
- VPS KVM4 cost (US$ 24.99/bulan, non-promo)
- Kurs USD → IDR (16.690)
- Kapasitas sites per VPS (12 sites)
- Salary dev (Junior & Mid)
- Custom dev buffer (30%)
- Domain cost

**⚠️ PENTING:** Semua sheet lain menggunakan formula yang reference ke sheet ini. Jika Anda ubah angka di sini, semua perhitungan otomatis update.

### 2. **Infra_Labour_Logic** (Auditable Calculations)
Menampilkan logika perhitungan yang transparan:
- Effective sites per dev (setelah custom buffer)
- VPS cost per year & per site
- Labour cost per dev & per site
- Domain cost breakdown

**Gunakan sheet ini untuk:**
- Justifikasi ke finance/management
- Audit perhitungan
- Memahami kenapa angkanya seperti itu

### 3. **Per_Site_Cost** (Pricing Base)
Breakdown cost per site:
- **Per Bulan:** ~Rp 694.000
- **Per Tahun:** ~Rp 8.3 juta

Komponen:
- VPS (shared)
- Nylas
- Labour (dengan custom buffer 30%)
- Domain (shared)

**Gunakan untuk:**
- Pricing product
- Margin calculation
- Proposal ke client

### 4. **Capacity_and_Hiring**
Mapping antara jumlah sites dengan kebutuhan:
- Junior dev
- Mid dev
- VPS required

**Contoh:**
- 1-7 sites → 1 junior dev, 0 mid dev, 1 VPS
- 15-25 sites → 3 junior dev, 1 mid dev, 2-3 VPS
- 60 sites → 9 junior dev, 2 mid dev, 5 VPS

### 5. **Budget_Summary** (Example: 10 Sites)
Contoh budgeting untuk 10 sites:
- **Fixed IT Cost:** Manpower + VPS amortized
- **Variable Cost:** Per-site costs (Nylas, VPS share, domain)
- **Total IT Budget:** Monthly & Yearly

**Gunakan untuk:**
- Budgeting tahunan
- Forecast untuk jumlah sites tertentu
- Presentasi ke management

### 6. **Budget_1_3_Years** (3-Year Projection)
Proyeksi 1-3 tahun dengan:
- Jumlah sites (bisa diubah)
- VPS required (auto-calculated)
- Dev required (auto-calculated)
- Infra cost per year
- Labour cost per year
- Total IT cost per year

**Default projection:**
- Tahun 1: 12 sites → Rp 77 juta/tahun
- Tahun 2: 30 sites → Rp 195 juta/tahun
- Tahun 3: 60 sites → Rp 349 juta/tahun

**⚠️ Anda bisa ubah jumlah sites di kolom B untuk simulasi berbeda.**

### 7. **Pricing_Tiers**
Analisis revenue & margin per tier:
- **Basic:** Rp 1.2 jt/bulan → Margin ~42%
- **Pro:** Rp 1.8 jt/bulan → Margin ~61%
- **Enterprise:** Rp 2.5 jt/bulan → Margin ~72%

**Gunakan untuk:**
- Pricing strategy
- Margin analysis
- Revenue forecasting

### 8. **One_Time_Fees**
Setup & custom development fees:
- **Initial Setup:** Rp 3 juta
- **Minor Custom Dev:** Rp 5 juta
- **Major Custom Dev:** Rp 15 juta+

**Best Practice:**
- Setup fee = wajib (nutup cost awal)
- Custom dev = jangan masuk subscription, harus one-time

### 9. **Break_Even**
Break-even analysis:
- Avg revenue per site
- Cost per site
- Margin per site
- **Break-even customers:** ~3-4 customers

**✅ Break-even di 3-4 customer sangat sehat untuk SaaS hospitality!**

### 10. **Hiring_Roadmap**
Roadmap hiring berdasarkan stage:
- **Early (1-15 sites):** 1 junior, 0 mid
- **Growth (16-40 sites):** 3 junior, 1 mid
- **Scale (41-80 sites):** 5 junior, 2 mid
- **Mature (80+ sites):** 8 junior, 3 mid

## 💡 Key Insights

### 1. **Manpower = Fixed/Step Cost**
✅ **BENAR:** Manpower dibudgetkan sebagai fixed cost per bulan/tahun
❌ **SALAH:** Membagi manpower per site untuk budgeting resmi

**Kenapa?**
- Dev tidak kerja linear
- Custom request bisa makan waktu 1-2 minggu dari 1 customer
- Ada idle time + context switching
- Hospitality = SLA & komunikasi tinggi

### 2. **Infra & Service = Variable Cost**
✅ Boleh dibagi per-site:
- VPS (dibagi kapasitas)
- Nylas
- Domain

### 3. **Cost Structure**
- **Fixed IT Cost:** ~Rp 3.4 juta/bulan (1 VPS + 1 dev minimum)
- **Variable Cost:** ~Rp 265.000/site/bulan
- **Total Cost/Site:** ~Rp 694.000/bulan (termasuk labour share)

### 4. **Pricing Guardrail**
Dengan cost ~Rp 694k/site/bulan:
- **< Rp 1 jt** → ❌ Bahaya
- **Rp 1.2-1.5 jt** → ⚠️ Ketat
- **Rp 2 jt+** → ✅ Sehat & scalable

## 🚀 Cara Pakai

### Untuk Budgeting Tahunan:
1. Buka sheet **Budget_1_3_Years**
2. Ubah jumlah sites di kolom B sesuai forecast
3. Lihat total IT budget per tahun di kolom H

### Untuk Pricing Product:
1. Buka sheet **Per_Site_Cost**
2. Lihat total cost per site
3. Buka sheet **Pricing_Tiers**
4. Set harga dengan margin target (min 40-50%)

### Untuk Hiring Planning:
1. Buka sheet **Capacity_and_Hiring**
2. Cari jumlah sites Anda
3. Lihat kebutuhan dev & VPS
4. Buka sheet **Hiring_Roadmap** untuk timeline

### Untuk Presentasi Management:
1. **Budget_Summary** → Contoh konkret (10 sites)
2. **Budget_1_3_Years** → Proyeksi 3 tahun
3. **Pricing_Tiers** → Revenue & margin
4. **Break_Even** → Justifikasi investasi

## 📊 Key Numbers Summary

| Item | Value |
|------|-------|
| VPS Cost / Year | Rp 5.005.000 |
| VPS Cost / Site / Month | Rp 34.757 |
| Effective Sites / Dev | 7 sites |
| Labour Cost / Site / Month | Rp 428.571 |
| Total Cost / Site / Month | Rp 693.884 |
| Total Cost / Site / Year | Rp 8.326.607 |
| Break-even Customers | 3-4 customers |

## ⚠️ Important Notes

1. **Harga VPS:** Menggunakan harga **non-promo/renewal** (US$ 24.99/bulan) untuk budgeting realistis
2. **Kurs:** Rp 16.690 (sesuaikan dengan kurs aktual jika perlu)
3. **Custom Buffer:** 30% waktu dev disiapkan untuk custom request (realistis untuk hospitality tech)
4. **Kapasitas VPS:** Max 12 sites per VPS (aman untuk performa stabil)
5. **Manpower:** Tidak dibagi per site untuk budgeting resmi, hanya untuk analisis & pricing

## 🔄 Update Model

Jika ada perubahan:
1. Edit hanya di sheet **Assumptions**
2. Semua sheet lain otomatis update
3. Jangan ubah formula di sheet lain (kecuali Anda paham Excel)

## 📈 Next Steps (Opsional)

Model ini bisa dikembangkan lebih lanjut:
- ✅ Tambah kolom Revenue per Site → langsung kelihatan margin & break-even
- ✅ Simulasi best vs worst case growth
- ✅ Mapping pricing vs SLA
- ✅ One-time setup & custom dev fee calculator
- ✅ Dashboard untuk investor / management

## 📞 Support

Jika ada pertanyaan atau perlu penyesuaian model, silakan hubungi tim IT/Finance.

---

**Generated:** $(date)
**Version:** 1.0
**Last Updated:** 2024
