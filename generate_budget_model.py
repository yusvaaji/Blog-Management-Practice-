#!/usr/bin/env python3
"""
Hospitality Tech CRM - IT Budgeting & Capacity Planning Model
Generate comprehensive Excel budgeting model for IT infrastructure and manpower
"""

import pandas as pd
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from datetime import datetime

# ============================================================================
# ASSUMPTIONS & CONSTANTS
# ============================================================================

ASSUMPTIONS = {
    'VPS_KVM4_USD_MONTH': 24.99,
    'USD_TO_IDR': 16690,
    'SITES_PER_VPS': 12,
    'STORAGE_PER_SITE_GB': 5,
    'NYLAS_COST_PER_SITE_MONTH_IDR': 225000,
    'JUNIOR_DEV_SALARY_MONTH_IDR': 3000000,
    'MID_DEV_SALARY_MONTH_IDR': 6000000,
    'SITES_PER_DEV_OPS': 10,
    'CUSTOM_DEV_BUFFER_PCT': 0.30,
    'DOMAIN_COST_TOTAL_YEAR_IDR': 800000,
    'DOMAIN_COUNT': 4,
}

# ============================================================================
# CALCULATIONS
# ============================================================================

def calculate_vps_yearly_cost():
    """Calculate VPS yearly cost in IDR"""
    return ASSUMPTIONS['VPS_KVM4_USD_MONTH'] * ASSUMPTIONS['USD_TO_IDR'] * 12

def calculate_effective_sites_per_dev():
    """Calculate effective sites per dev after custom buffer"""
    return ASSUMPTIONS['SITES_PER_DEV_OPS'] * (1 - ASSUMPTIONS['CUSTOM_DEV_BUFFER_PCT'])

def calculate_vps_cost_per_site_month():
    """Calculate VPS cost per site per month"""
    vps_monthly = ASSUMPTIONS['VPS_KVM4_USD_MONTH'] * ASSUMPTIONS['USD_TO_IDR']
    return vps_monthly / ASSUMPTIONS['SITES_PER_VPS']

def calculate_vps_cost_per_site_year():
    """Calculate VPS cost per site per year"""
    return calculate_vps_yearly_cost() / ASSUMPTIONS['SITES_PER_VPS']

def calculate_domain_cost_per_site_year():
    """Calculate domain cost per site per year"""
    return ASSUMPTIONS['DOMAIN_COST_TOTAL_YEAR_IDR'] / ASSUMPTIONS['SITES_PER_VPS']

def calculate_domain_cost_per_site_month():
    """Calculate domain cost per site per month"""
    return calculate_domain_cost_per_site_year() / 12

def calculate_labour_cost_per_dev_year():
    """Calculate labour cost per dev per year"""
    return ASSUMPTIONS['JUNIOR_DEV_SALARY_MONTH_IDR'] * 12

def calculate_labour_cost_per_site_month():
    """Calculate labour cost per site per month (with custom buffer)"""
    effective_sites = calculate_effective_sites_per_dev()
    return ASSUMPTIONS['JUNIOR_DEV_SALARY_MONTH_IDR'] / effective_sites

def calculate_labour_cost_per_site_year():
    """Calculate labour cost per site per year"""
    return calculate_labour_cost_per_site_month() * 12

def calculate_total_cost_per_site_month():
    """Calculate total cost per site per month"""
    return (
        calculate_vps_cost_per_site_month() +
        ASSUMPTIONS['NYLAS_COST_PER_SITE_MONTH_IDR'] +
        calculate_labour_cost_per_site_month() +
        calculate_domain_cost_per_site_month()
    )

def calculate_total_cost_per_site_year():
    """Calculate total cost per site per year"""
    return (
        calculate_vps_cost_per_site_year() +
        (ASSUMPTIONS['NYLAS_COST_PER_SITE_MONTH_IDR'] * 12) +
        calculate_labour_cost_per_site_year() +
        calculate_domain_cost_per_site_year()
    )

def calculate_devs_required(sites):
    """Calculate number of devs required for given sites"""
    effective_sites = calculate_effective_sites_per_dev()
    import math
    return math.ceil(sites / effective_sites)

def calculate_vps_required(sites):
    """Calculate number of VPS required for given sites"""
    import math
    return math.ceil(sites / ASSUMPTIONS['SITES_PER_VPS'])

# ============================================================================
# EXCEL GENERATION
# ============================================================================

def format_header_cell(cell):
    """Format header cell"""
    cell.font = Font(bold=True, color="FFFFFF", size=11)
    cell.fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")
    cell.alignment = Alignment(horizontal="center", vertical="center")
    cell.border = Border(
        left=Side(style='thin'),
        right=Side(style='thin'),
        top=Side(style='thin'),
        bottom=Side(style='thin')
    )

def format_data_cell(cell, is_number=False):
    """Format data cell"""
    cell.alignment = Alignment(horizontal="right" if is_number else "left", vertical="center")
    cell.border = Border(
        left=Side(style='thin'),
        right=Side(style='thin'),
        top=Side(style='thin'),
        bottom=Side(style='thin')
    )
    if is_number:
        cell.number_format = '#,##0'

def create_assumptions_sheet(wb):
    """Create Assumptions sheet"""
    ws = wb.active
    ws.title = "Assumptions"
    
    # Headers
    headers = ["Item", "Value", "Unit", "Notes"]
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_idx, value=header)
        format_header_cell(cell)
    
    # Data
    assumptions_data = [
        ["VPS KVM4 USD / Month", ASSUMPTIONS['VPS_KVM4_USD_MONTH'], "USD", "Hostinger KVM4 US (normal/renewal price)"],
        ["USD to IDR", ASSUMPTIONS['USD_TO_IDR'], "IDR", "Exchange rate"],
        ["VPS Cost IDR / Year", "=B2*B3*12", "IDR", "Auto calculated"],
        ["Sites per VPS (max)", ASSUMPTIONS['SITES_PER_VPS'], "sites", "Safe capacity limit"],
        ["Avg Storage / Site", ASSUMPTIONS['STORAGE_PER_SITE_GB'], "GB", "Web apps + MySQL"],
        ["Nylas Cost / Site / Month", ASSUMPTIONS['NYLAS_COST_PER_SITE_MONTH_IDR'], "IDR", "Hospitality integration API"],
        ["Junior Dev Salary / Month", ASSUMPTIONS['JUNIOR_DEV_SALARY_MONTH_IDR'], "IDR", "Ops + dev work"],
        ["Mid Dev Salary / Month", ASSUMPTIONS['MID_DEV_SALARY_MONTH_IDR'], "IDR", "Senior dev work"],
        ["Sites per Dev (ops)", ASSUMPTIONS['SITES_PER_DEV_OPS'], "sites", "Baseline ops capacity"],
        ["Custom Dev Buffer %", ASSUMPTIONS['CUSTOM_DEV_BUFFER_PCT'] * 100, "%", "Hospitality custom requests"],
        ["Domain Cost / Year (total)", ASSUMPTIONS['DOMAIN_COST_TOTAL_YEAR_IDR'], "IDR", f"Shared across {ASSUMPTIONS['DOMAIN_COUNT']} domains"],
        ["Domain Count", ASSUMPTIONS['DOMAIN_COUNT'], "domains", "Existing domains"],
    ]
    
    for row_idx, row_data in enumerate(assumptions_data, 2):
        for col_idx, value in enumerate(row_data, 1):
            cell = ws.cell(row=row_idx, column=col_idx, value=value)
            if col_idx == 1:  # Item column
                format_data_cell(cell, False)
            elif col_idx == 2:  # Value column
                if isinstance(value, (int, float)) and not isinstance(value, str):
                    format_data_cell(cell, True)
                else:
                    format_data_cell(cell, False)
            else:
                format_data_cell(cell, False)
    
    # Auto-adjust column widths
    ws.column_dimensions['A'].width = 35
    ws.column_dimensions['B'].width = 20
    ws.column_dimensions['C'].width = 15
    ws.column_dimensions['D'].width = 50

def create_infra_labour_calc_sheet(wb):
    """Create Infra_Labour_Logic sheet"""
    ws = wb.create_sheet("Infra_Labour_Logic")
    
    # Headers
    headers = ["Component", "Formula", "Result", "Notes"]
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_idx, value=header)
        format_header_cell(cell)
    
    # Calculations
    calc_data = [
        ["Effective Sites / Dev", "Sites/dev × (1 - buffer)", "=Assumptions!B9*(1-Assumptions!B10/100)", "After custom buffer"],
        ["VPS Cost / Year (IDR)", "USD × FX × 12", "=Assumptions!B2*Assumptions!B3*12", "Yearly VPS cost"],
        ["VPS Cost / Site / Year", "VPS Year / Sites per VPS", "=B2/Assumptions!B4", "Per site yearly"],
        ["VPS Cost / Site / Month", "VPS Year / Sites / 12", "=B3/12", "Per site monthly"],
        ["Labour Cost / Dev / Year", "Salary × 12", "=Assumptions!B7*12", "Per dev yearly"],
        ["Labour Cost / Site / Month", "Salary / Effective Sites", "=Assumptions!B7/B1", "Per site monthly"],
        ["Labour Cost / Site / Year", "Monthly × 12", "=B6*12", "Per site yearly"],
        ["Domain Cost / Site / Year", "Total Domain / Sites", "=Assumptions!B11/Assumptions!B4", "Per site yearly"],
        ["Domain Cost / Site / Month", "Yearly / 12", "=B8/12", "Per site monthly"],
    ]
    
    for row_idx, row_data in enumerate(calc_data, 2):
        for col_idx, value in enumerate(row_data, 1):
            cell = ws.cell(row=row_idx, column=col_idx, value=value)
            if col_idx == 3:  # Result column with formula
                format_data_cell(cell, True)
            else:
                format_data_cell(cell, False)
    
    # Auto-adjust column widths
    ws.column_dimensions['A'].width = 30
    ws.column_dimensions['B'].width = 30
    ws.column_dimensions['C'].width = 25
    ws.column_dimensions['D'].width = 30

def create_per_site_cost_sheet(wb):
    """Create Per_Site_Cost sheet"""
    ws = wb.create_sheet("Per_Site_Cost")
    
    # Headers
    headers = ["Component", "Per Month (IDR)", "Per Year (IDR)", "Notes"]
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_idx, value=header)
        format_header_cell(cell)
    
    # Data with formulas
    cost_data = [
        ["VPS (shared)", "=Infra_Labour_Logic!B4", "=Infra_Labour_Logic!B3", "Shared VPS cost"],
        ["Nylas", "=Assumptions!B6", "=Assumptions!B6*12", "API service per site"],
        ["Labour (custom incl.)", "=Infra_Labour_Logic!B6", "=Infra_Labour_Logic!B7", "With 30% custom buffer"],
        ["Domain (shared)", "=Infra_Labour_Logic!B9", "=Infra_Labour_Logic!B8", "Shared domain cost"],
        ["TOTAL", "=SUM(B2:B5)", "=SUM(C2:C5)", "Total cost per site"],
    ]
    
    for row_idx, row_data in enumerate(cost_data, 2):
        for col_idx, value in enumerate(row_data, 1):
            cell = ws.cell(row=row_idx, column=col_idx, value=value)
            if col_idx in [2, 3]:  # Number columns
                format_data_cell(cell, True)
            else:
                format_data_cell(cell, False)
    
    # Auto-adjust column widths
    ws.column_dimensions['A'].width = 25
    ws.column_dimensions['B'].width = 20
    ws.column_dimensions['C'].width = 20
    ws.column_dimensions['D'].width = 30

def create_capacity_hiring_sheet(wb):
    """Create Capacity_and_Hiring sheet"""
    ws = wb.create_sheet("Capacity_and_Hiring")
    
    # Headers
    headers = ["Total Sites", "Junior Dev", "Mid Dev", "VPS Required", "Notes"]
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_idx, value=header)
        format_header_cell(cell)
    
    # Capacity planning data
    capacity_data = [
        [1, 1, 0, 1, "Early stage"],
        [7, 1, 0, 1, "Ops only"],
        [8, 2, 0, 1, "Load increase"],
        [14, 2, 0, 2, "Second VPS needed"],
        [15, 3, 1, 2, "Custom requests heavy"],
        [25, 3, 1, 3, "Scale up"],
        [30, 5, 2, 3, "Team split"],
        [50, 5, 2, 5, "Growth phase"],
        [60, 9, 2, 5, "Mature stage"],
    ]
    
    for row_idx, row_data in enumerate(capacity_data, 2):
        for col_idx, value in enumerate(row_data, 1):
            cell = ws.cell(row=row_idx, column=col_idx, value=value)
            if col_idx in [1, 2, 3, 4]:  # Number columns
                format_data_cell(cell, True)
            else:
                format_data_cell(cell, False)
    
    # Auto-adjust column widths
    ws.column_dimensions['A'].width = 15
    ws.column_dimensions['B'].width = 15
    ws.column_dimensions['C'].width = 15
    ws.column_dimensions['D'].width = 15
    ws.column_dimensions['E'].width = 25

def create_budget_summary_sheet(wb):
    """Create Budget_Summary sheet"""
    ws = wb.create_sheet("Budget_Summary")
    
    # Example: 10 sites
    example_sites = 10
    
    # Headers
    headers = ["Item", "Monthly (IDR)", "Yearly (IDR)", "Notes"]
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_idx, value=header)
        format_header_cell(cell)
    
    # Fixed IT Cost section
    ws.cell(row=2, column=1, value="FIXED IT COST").font = Font(bold=True, size=12)
    ws.merge_cells('A2:D2')
    
    fixed_data = [
        ["Junior Dev (1)", "=Assumptions!B7", "=B3*12", "Fixed manpower"],
        ["Mid Dev (0)", 0, 0, "Not yet needed"],
        ["VPS (amortized)", "=Infra_Labour_Logic!B2/12", "=Infra_Labour_Logic!B2", "Yearly VPS cost"],
        ["Subtotal Fixed", "=SUM(B3:B5)", "=SUM(C3:C5)", ""],
    ]
    
    for row_idx, row_data in enumerate(fixed_data, 3):
        for col_idx, value in enumerate(row_data, 1):
            cell = ws.cell(row=row_idx, column=col_idx, value=value)
            if col_idx in [2, 3]:  # Number columns
                format_data_cell(cell, True)
            else:
                format_data_cell(cell, False)
    
    # Variable Cost section
    var_row = 8
    ws.cell(row=var_row, column=1, value="VARIABLE COST").font = Font(bold=True, size=12)
    ws.merge_cells(f'A{var_row}:D{var_row}')
    
    ws.cell(row=var_row+1, column=1, value="Number of Sites").font = Font(bold=True)
    ws.cell(row=var_row+1, column=2, value=example_sites)
    format_data_cell(ws.cell(row=var_row+1, column=2), True)
    
    var_data = [
        ["Nylas", f"=Per_Site_Cost!B2*B{var_row+1}", f"=Per_Site_Cost!C2*B{var_row+1}", "Per site"],
        ["VPS share", f"=Per_Site_Cost!B1*B{var_row+1}", f"=Per_Site_Cost!C1*B{var_row+1}", "Per site"],
        ["Domain share", f"=Per_Site_Cost!B4*B{var_row+1}", f"=Per_Site_Cost!C4*B{var_row+1}", "Per site"],
        ["Subtotal Variable", f"=SUM(B{var_row+2}:B{var_row+4})", f"=SUM(C{var_row+2}:C{var_row+4})", ""],
    ]
    
    for row_idx, row_data in enumerate(var_data, var_row+2):
        for col_idx, value in enumerate(row_data, 1):
            cell = ws.cell(row=row_idx, column=col_idx, value=value)
            if col_idx in [2, 3]:  # Number columns
                format_data_cell(cell, True)
            else:
                format_data_cell(cell, False)
    
    # Total IT Budget
    total_row = var_row + 6
    ws.cell(row=total_row, column=1, value="TOTAL IT BUDGET").font = Font(bold=True, size=12, color="FFFFFF")
    ws.cell(row=total_row, column=1).fill = PatternFill(start_color="70AD47", end_color="70AD47", fill_type="solid")
    ws.cell(row=total_row, column=2, value=f"=B6+C{var_row+5}")
    ws.cell(row=total_row, column=3, value=f"=C6+C{var_row+5}")
    format_data_cell(ws.cell(row=total_row, column=2), True)
    format_data_cell(ws.cell(row=total_row, column=3), True)
    
    # Auto-adjust column widths
    ws.column_dimensions['A'].width = 30
    ws.column_dimensions['B'].width = 20
    ws.column_dimensions['C'].width = 20
    ws.column_dimensions['D'].width = 30

def create_budget_1_3_years_sheet(wb):
    """Create Budget_1_3_Years sheet"""
    ws = wb.create_sheet("Budget_1_3_Years")
    
    # Headers
    headers = ["Year", "Sites", "VPS", "Junior Dev", "Mid Dev", "Infra / Year (IDR)", "Labour / Year (IDR)", "Total IT Cost / Year (IDR)"]
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_idx, value=header)
        format_header_cell(cell)
    
    # Projected data
    projected_data = [
        [1, 12, "=CEILING(B2/Assumptions!B4,1)", "=CEILING(B2/(Assumptions!B9*(1-Assumptions!B10/100)),1)", 0, 
         "=C2*Infra_Labour_Logic!B2", "=D2*Assumptions!B7*12", "=F2+G2"],
        [2, 30, "=CEILING(B3/Assumptions!B4,1)", "=CEILING(B3/(Assumptions!B9*(1-Assumptions!B10/100)),1)", 1,
         "=C3*Infra_Labour_Logic!B2", "=D3*Assumptions!B7*12+E3*Assumptions!B8*12", "=F3+G3"],
        [3, 60, "=CEILING(B4/Assumptions!B4,1)", "=CEILING(B4/(Assumptions!B9*(1-Assumptions!B10/100)),1)", 2,
         "=C4*Infra_Labour_Logic!B2", "=D4*Assumptions!B7*12+E4*Assumptions!B8*12", "=F4+G4"],
    ]
    
    for row_idx, row_data in enumerate(projected_data, 2):
        for col_idx, value in enumerate(row_data, 1):
            cell = ws.cell(row=row_idx, column=col_idx, value=value)
            if col_idx == 1:  # Year column
                format_data_cell(cell, True)
            elif col_idx == 2:  # Sites column (editable)
                format_data_cell(cell, True)
                cell.fill = PatternFill(start_color="FFF2CC", end_color="FFF2CC", fill_type="solid")
            elif col_idx in [3, 4, 5, 6, 7, 8]:  # Calculated columns
                format_data_cell(cell, True)
            else:
                format_data_cell(cell, False)
    
    # Auto-adjust column widths
    for col in range(1, 9):
        ws.column_dimensions[get_column_letter(col)].width = 18

def create_pricing_tiers_sheet(wb):
    """Create Pricing_Tiers sheet"""
    ws = wb.create_sheet("Pricing_Tiers")
    
    # Headers
    headers = ["Tier", "Price / Month (IDR)", "Cost / Month (IDR)", "Margin / Month (IDR)", "Margin %", "Notes"]
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_idx, value=header)
        format_header_cell(cell)
    
    # Pricing tiers
    pricing_data = [
        ["Basic", 1200000, "=Per_Site_Cost!B6", "=B2-C2", "=D2/B2*100", "Entry level"],
        ["Pro", 1800000, "=Per_Site_Cost!B6", "=B3-C3", "=D3/B3*100", "Sweet spot"],
        ["Enterprise", 2500000, "=Per_Site_Cost!B6", "=B4-C4", "=D4/B4*100", "High margin"],
    ]
    
    for row_idx, row_data in enumerate(pricing_data, 2):
        for col_idx, value in enumerate(row_data, 1):
            cell = ws.cell(row=row_idx, column=col_idx, value=value)
            if col_idx in [2, 3, 4]:  # Number columns
                format_data_cell(cell, True)
            elif col_idx == 5:  # Percentage
                format_data_cell(cell, True)
                cell.number_format = '0.0"%"'
            else:
                format_data_cell(cell, False)
    
    # Auto-adjust column widths
    ws.column_dimensions['A'].width = 15
    ws.column_dimensions['B'].width = 20
    ws.column_dimensions['C'].width = 20
    ws.column_dimensions['D'].width = 20
    ws.column_dimensions['E'].width = 15
    ws.column_dimensions['F'].width = 25

def create_one_time_fees_sheet(wb):
    """Create One_Time_Fees sheet"""
    ws = wb.create_sheet("One_Time_Fees")
    
    # Headers
    headers = ["Item", "Fee (IDR)", "When Used", "Notes"]
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_idx, value=header)
        format_header_cell(cell)
    
    # One-time fees
    fees_data = [
        ["Initial Setup", 3000000, "Onboarding", "Domain, deploy, configuration"],
        ["Minor Custom Dev", 5000000, "Small requests", "Report, workflow kecil"],
        ["Major Custom Dev", 15000000, "Complex requests", "Logic booking, integration"],
    ]
    
    for row_idx, row_data in enumerate(fees_data, 2):
        for col_idx, value in enumerate(row_data, 1):
            cell = ws.cell(row=row_idx, column=col_idx, value=value)
            if col_idx == 2:  # Fee column
                format_data_cell(cell, True)
            else:
                format_data_cell(cell, False)
    
    # Auto-adjust column widths
    ws.column_dimensions['A'].width = 25
    ws.column_dimensions['B'].width = 20
    ws.column_dimensions['C'].width = 20
    ws.column_dimensions['D'].width = 40

def create_break_even_sheet(wb):
    """Create Break_Even sheet"""
    ws = wb.create_sheet("Break_Even")
    
    # Headers
    headers = ["Item", "Value", "Unit", "Notes"]
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_idx, value=header)
        format_header_cell(cell)
    
    # Break-even calculations
    break_even_data = [
        ["Avg Revenue / Site / Month", "=(Pricing_Tiers!B2+Pricing_Tiers!B3+Pricing_Tiers!B4)/3", "IDR", "Average of 3 tiers"],
        ["Cost / Site / Month", "=Per_Site_Cost!B6", "IDR", "Total cost per site"],
        ["Margin / Site / Month", "=B2-B3", "IDR", "Profit per site"],
        ["Fixed Monthly Cost (min)", "=Budget_Summary!B6", "IDR", "1 VPS + 1 Dev minimum"],
        ["Break-even Customers", "=CEILING(B5/B4,1)", "customers", "Minimum customers needed"],
    ]
    
    for row_idx, row_data in enumerate(break_even_data, 2):
        for col_idx, value in enumerate(row_data, 1):
            cell = ws.cell(row=row_idx, column=col_idx, value=value)
            if col_idx == 2:  # Value column
                format_data_cell(cell, True)
            else:
                format_data_cell(cell, False)
    
    # Auto-adjust column widths
    ws.column_dimensions['A'].width = 35
    ws.column_dimensions['B'].width = 25
    ws.column_dimensions['C'].width = 15
    ws.column_dimensions['D'].width = 40

def create_hiring_roadmap_sheet(wb):
    """Create Hiring_Roadmap sheet"""
    ws = wb.create_sheet("Hiring_Roadmap")
    
    # Headers
    headers = ["Stage", "Sites", "Junior", "Mid", "Focus", "Notes"]
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col_idx, value=header)
        format_header_cell(cell)
    
    # Hiring roadmap
    roadmap_data = [
        ["Early", "1-15", 1, 0, "Ops & bugfix", "Foundation"],
        ["Growth", "16-40", 3, 1, "Custom & refactor", "Scale up"],
        ["Scale", "41-80", 5, 2, "Split ops & dev", "Team structure"],
        ["Mature", "80+", 8, 3, "Team ownership", "Full team"],
    ]
    
    for row_idx, row_data in enumerate(roadmap_data, 2):
        for col_idx, value in enumerate(row_data, 1):
            cell = ws.cell(row=row_idx, column=col_idx, value=value)
            if col_idx in [3, 4]:  # Number columns
                format_data_cell(cell, True)
            else:
                format_data_cell(cell, False)
    
    # Auto-adjust column widths
    ws.column_dimensions['A'].width = 15
    ws.column_dimensions['B'].width = 15
    ws.column_dimensions['C'].width = 10
    ws.column_dimensions['D'].width = 10
    ws.column_dimensions['E'].width = 20
    ws.column_dimensions['F'].width = 25

def main():
    """Main function to generate Excel file"""
    print("Generating Hospitality Tech IT Budgeting Model...")
    
    # Create workbook
    wb = Workbook()
    
    # Create all sheets
    create_assumptions_sheet(wb)
    create_infra_labour_calc_sheet(wb)
    create_per_site_cost_sheet(wb)
    create_capacity_hiring_sheet(wb)
    create_budget_summary_sheet(wb)
    create_budget_1_3_years_sheet(wb)
    create_pricing_tiers_sheet(wb)
    create_one_time_fees_sheet(wb)
    create_break_even_sheet(wb)
    create_hiring_roadmap_sheet(wb)
    
    # Save file
    filename = "IT_Budgeting_Hospitality_Tech_FINAL.xlsx"
    wb.save(filename)
    print(f"✅ Excel file generated: {filename}")
    print(f"\n📊 Sheets created:")
    print("  1. Assumptions - Single source of truth")
    print("  2. Infra_Labour_Logic - Calculation logic")
    print("  3. Per_Site_Cost - Cost breakdown per site")
    print("  4. Capacity_and_Hiring - Hiring planning")
    print("  5. Budget_Summary - Example budget (10 sites)")
    print("  6. Budget_1_3_Years - 3-year projection")
    print("  7. Pricing_Tiers - Revenue & margin analysis")
    print("  8. One_Time_Fees - Setup & custom dev fees")
    print("  9. Break_Even - Break-even analysis")
    print("  10. Hiring_Roadmap - Team growth plan")
    
    # Print key calculations
    print(f"\n💰 Key Calculations:")
    print(f"  VPS Cost / Year: Rp {calculate_vps_yearly_cost():,.0f}")
    print(f"  VPS Cost / Site / Month: Rp {calculate_vps_cost_per_site_month():,.0f}")
    print(f"  Effective Sites / Dev: {calculate_effective_sites_per_dev():.1f}")
    print(f"  Labour Cost / Site / Month: Rp {calculate_labour_cost_per_site_month():,.0f}")
    print(f"  Total Cost / Site / Month: Rp {calculate_total_cost_per_site_month():,.0f}")
    print(f"  Total Cost / Site / Year: Rp {calculate_total_cost_per_site_year():,.0f}")

if __name__ == "__main__":
    main()
