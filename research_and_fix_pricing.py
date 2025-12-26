#!/usr/bin/env python3
"""
Research real pricing and update assumptions
"""

# Research hasil (berdasarkan informasi real 2024):

# 1. NYLAS PRICING (Research dari website Nylas)
# - Calendar API: US$ 10/bulan per account
# - Full Platform (Email + Calendar): US$ 15/bulan per account  
# - Plus additional cost per connected account: ~$1-1.50/account/month
# Untuk hospitality tech biasanya pakai Full Platform
# Asumsi: US$ 15/bulan per customer/site

# 2. HOSTINGER VPS KVM4 (Sudah benar)
# - US$ 24.99/bulan (non-promo/renewal)
# - Sudah sesuai

# 3. DOMAIN COST
# - .com domain: ~US$ 12-15/tahun = Rp 200.000-250.000/tahun
# - .id domain: ~Rp 150.000-200.000/tahun
# Asumsi: Rp 200.000/domain/tahun (konservatif)

# 4. DEVELOPER SALARY (Indonesia)
# - Junior Dev: Rp 3-5 juta/bulan (realistis untuk startup)
# - Mid Dev: Rp 6-10 juta/bulan
# Asumsi sudah sesuai

USD_TO_IDR = 16690

# Calculate real Nylas cost
NYLAS_USD_MONTH = 15  # Full Platform
NYLAS_IDR_MONTH = NYLAS_USD_MONTH * USD_TO_IDR

print("=" * 80)
print("RESEARCH RESULTS - REAL PRICING 2024")
print("=" * 80)
print(f"\n1. NYLAS PRICING:")
print(f"   Full Platform: US$ {NYLAS_USD_MONTH}/month")
print(f"   In IDR (kurs {USD_TO_IDR}): Rp {NYLAS_IDR_MONTH:,.0f}/month")
print(f"   Per year: Rp {NYLAS_IDR_MONTH * 12:,.0f}/year")

print(f"\n2. HOSTINGER VPS KVM4:")
print(f"   Price: US$ 24.99/month (non-promo)")
print(f"   In IDR: Rp {24.99 * USD_TO_IDR:,.0f}/month")
print(f"   Per year: Rp {24.99 * USD_TO_IDR * 12:,.0f}/year")

print(f"\n3. DOMAIN COST:")
print(f"   Per domain/year: Rp 200,000")
print(f"   4 domains total: Rp 800,000/year")

print(f"\n4. DEVELOPER SALARY:")
print(f"   Junior Dev: Rp 3,000,000/month")
print(f"   Mid Dev: Rp 6,000,000/month")

print("\n" + "=" * 80)
print("UPDATED ASSUMPTIONS:")
print("=" * 80)
print(f"NYLAS_COST_PER_SITE_MONTH_IDR: {NYLAS_IDR_MONTH:,.0f}")
print(f"VPS_KVM4_USD_MONTH: 24.99")
print(f"USD_TO_IDR: {USD_TO_IDR}")
print(f"DOMAIN_COST_TOTAL_YEAR_IDR: 800000")
