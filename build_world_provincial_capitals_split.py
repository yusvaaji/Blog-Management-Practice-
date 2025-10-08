#!/usr/bin/env python3
"""
build_world_provincial_capitals_split.py

Produces:
 - world_provincial_capitals_geo_regions.csv  (combined)
 - world_provincial_capitals_APAC.csv
 - world_provincial_capitals_EMEA.csv
 - world_provincial_capitals_Americas.csv
 - README_world_provincial_capitals.txt

Requirements:
 - Python 3.8+
 - pip install pandas requests

Notes:
 - Uses dr5hn/countries-states-cities-database (GitHub master zip).
 - Attempts to fetch UN M49 mapping; if not available, some UN_Sub_Region values may be blank.
 - Dataset license: dr5hn is typically ODbL. Respect attribution.
"""

import os
import io
import zipfile
import requests
import pandas as pd
from collections import defaultdict

# Config
OUT_COMBINED = "world_provincial_capitals_geo_regions.csv"
OUT_APAC = "world_provincial_capitals_APAC.csv"
OUT_EMEA = "world_provincial_capitals_EMEA.csv"
OUT_AMERICAS = "world_provincial_capitals_Americas.csv"
README = "README_world_provincial_capitals.txt"

DR5HN_ZIP = "https://github.com/dr5hn/countries-states-cities-database/archive/refs/heads/master.zip"
# Try a generic UN M49 CSV mirror. If it fails, script continues (UN_Sub_Region may be blank).
UN_M49_CSV = "https://unstats.un.org/unsd/methodology/m49/overview"  # NOTE: UN page, not CSV; we handle fallback

TOP_N_CITIES = 3
TIMEOUT = 60

session = requests.Session()
session.headers.update({"User-Agent": "world-crm-export-script/1.0 (mailto:you@example.com)"})

def download_and_extract_dr5hn():
    print("Downloading dr5hn dataset (this may take ~10-30s)...")
    r = session.get(DR5HN_ZIP, stream=True, timeout=TIMEOUT)
    r.raise_for_status()
    z = zipfile.ZipFile(io.BytesIO(r.content))
    names = z.namelist()

    # find CSV file paths (case-insensitive)
    countries_fp = next((n for n in names if n.lower().endswith("countries.csv")), None)
    states_fp = next((n for n in names if n.lower().endswith("states.csv")), None)
    cities_fp = next((n for n in names if n.lower().endswith("cities.csv")), None)

    if not (countries_fp and states_fp and cities_fp):
        raise RuntimeError("Could not find countries/states/cities CSV files in dr5hn zip. Files found: " + ", ".join(names))

    print("Reading CSVs from zip...")
    countries = pd.read_csv(z.open(countries_fp), dtype=str)
    states = pd.read_csv(z.open(states_fp), dtype=str)
    cities = pd.read_csv(z.open(cities_fp), dtype=str)
    print(f"Loaded: {len(countries)} countries, {len(states)} states, {len(cities)} cities (approx).")
    return countries, states, cities

def download_un_m49_guess():
    # The UN site doesn't provide a single neat CSV URL consistently. Try a few known mirrors.
    candidate_urls = [
        # Common mirrors / copies - these may or may not be reachable. Script will try them in order.
        "https://datahub.io/core/country-codes/r/country-codes.csv",  # large but contains region info
        "https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/all/all.csv",
        # A small M49-style table may be maintained on other mirrors; add more if you want.
    ]
    for url in candidate_urls:
        try:
            print("Attempting to download UN / region mapping from:", url)
            r = session.get(url, timeout=30)
            if r.status_code == 200 and r.text:
                df = pd.read_csv(io.StringIO(r.text), dtype=str)
                print(f"Downloaded region mapping from {url} (rows: {len(df)})")
                return df
        except Exception as e:
            print("Failed to fetch", url, ":", str(e))
    print("Could not download a UN M49 CSV from known mirrors - continuing with fallback (UN_Sub_Region may be blank).")
    return pd.DataFrame()

def normalize_columns(df):
    # Trim whitespace from column names
    df.columns = [c.strip() for c in df.columns]
    return df

def build_un_map(un_df):
    if un_df.empty:
        return {}, {}
    un_df = normalize_columns(un_df)
    # Try to find an ISO2 column, a country-name column, and subregion column
    iso2_col = None
    name_col = None
    sub_col = None
    for c in un_df.columns:
        cl = c.lower()
        if not iso2_col and ("iso" in cl and ("alpha2" in cl or "iso2" in cl or cl == "iso")):
            iso2_col = c
        if not name_col and ("name" in cl and ("country" in cl or "country or area" in cl or "official_name" in cl or cl == "name")):
            name_col = c
        # subregion heuristics
        if not sub_col and ("sub" in cl and "region" in cl or "subregion" in cl or "region" in cl):
            sub_col = c
    # Fallbacks to likely columns
    if iso2_col is None:
        for c in un_df.columns:
            if c.lower() in ("iso2", "alpha2", "iso"):
                iso2_col = c
    if name_col is None:
        for c in un_df.columns:
            if "country" in c.lower() or "name" in c.lower():
                name_col = c
                break
    if sub_col is None:
        for c in un_df.columns:
            if "sub" in c.lower() and "region" in c.lower():
                sub_col = c
                break

    map_iso2 = {}
    map_name = {}
    if iso2_col:
        for _, r in un_df.iterrows():
            iso = r.get(iso2_col)
            sub = r.get(sub_col) if sub_col else None
            name = r.get(name_col) if name_col else None
            if pd.notna(iso):
                map_iso2[str(iso).strip().upper()] = str(sub).strip() if pd.notna(sub) else ""
            if pd.notna(name):
                map_name[str(name).strip().lower()] = str(sub).strip() if pd.notna(sub) else ""
    else:
        # if no iso2 found, map by name only
        for _, r in un_df.iterrows():
            name = r.get(name_col) if name_col else None
            sub = r.get(sub_col) if sub_col else None
            if pd.notna(name):
                map_name[str(name).strip().lower()] = str(sub).strip() if pd.notna(sub) else ""
    return map_iso2, map_name

def choose_business_region(un_subregion):
    if not un_subregion or not isinstance(un_subregion, str):
        return ""
    lower = un_subregion.lower()
    if any(x in lower for x in ("asia", "oceania", "australia", "micronesia", "melanesia", "polynesia")):
        return "APAC"
    if any(x in lower for x in ("america", "caribbean", "south america", "northern america", "central america")):
        return "Americas"
    # fallback EMEA
    return "EMEA"

def build_output_df(countries, states, cities, un_map_iso2, un_map_name, top_n=TOP_N_CITIES):
    # normalize colnames
    countries = normalize_columns(countries)
    states = normalize_columns(states)
    cities = normalize_columns(cities)

    # ensure id and linking fields are strings
    for df, col in ((countries, "id"), (states, "id"), (states, "country_id")):
        if col in df.columns:
            df[col] = df[col].astype(str)

    if 'country_id' in cities.columns:
        cities['country_id'] = cities['country_id'].astype(str)
    if 'state_id' in cities.columns:
        cities['state_id'] = cities['state_id'].astype(str)
    else:
        # some datasets include 'state_code' or 'state_code' linking; keep as-is (best-effort)
        cities['state_id'] = cities.get('state_id', cities.get('state_code', '')).astype(str)

    country_index = {}
    if 'id' in countries.columns:
        country_index = {str(r['id']): r for _, r in countries.iterrows()}
    else:
        # fallback on iso2 mapping if ids missing
        for _, r in countries.iterrows():
            key = str(r.get('iso2') or r.get('iso') or "").upper()
            if key:
                country_index[key] = r

    # Group cities by (country_id, state_id)
    cities_grouped = defaultdict(list)
    for _, r in cities.iterrows():
        key = (str(r.get('country_id','')), str(r.get('state_id','')))
        cities_grouped[key].append(r)

    # detect useful city columns
    pop_col = None
    lat_col = None
    lon_col = None
    for c in cities.columns:
        lc = c.lower()
        if not pop_col and "pop" in lc:
            pop_col = c
        if not lat_col and lc in ("latitude","lat"):
            lat_col = c
        if not lon_col and lc in ("longitude","lon","lng","long"):
            lon_col = c

    # detect city capital flag columns
    capital_flags = [c for c in cities.columns if "cap" in c.lower()]

    rows = []
    # iterate states
    if 'id' in states.columns:
        iter_states = states.itertuples(index=False)
    else:
        iter_states = states.itertuples(index=False)

    for _, srow in states.iterrows():
        country_id = str(srow.get('country_id',''))
        state_id = str(srow.get('id', ''))
        state_name = srow.get('name') or srow.get('state') or ''
        # get country info
        cinfo = country_index.get(country_id)
        if cinfo is None:
            cinfo = {}
        # if country_index keyed by ISO2, try to fallback get iso2 from country row
        if cinfo.empty and 'iso2' in srow and pd.notna(srow.get('iso2')):
            cinfo = country_index.get(str(srow.get('iso2')).upper())
            if cinfo is None:
                cinfo = {}

        country_name = str(cinfo.get('name') or cinfo.get('country') or srow.get('country_name') or '')
        country_iso2 = str(cinfo.get('iso2') or cinfo.get('iso') or '').upper()
        country_capital = str(cinfo.get('capital') or '')

        # candidate cities in this state
        key = (country_id, state_id)
        candidates = cities_grouped.get(key, [])

        # find province capital first by explicit flag
        prov_cap = ""
        prov_lat = ""
        prov_lon = ""
        found_cap = False
        for city in candidates:
            for f in capital_flags:
                try:
                    val = city.get(f)
                    if pd.notna(val) and str(val).strip().lower() in ("1","true","yes","y","t"):
                        prov_cap = city.get('name') or ''
                        prov_lat = city.get(lat_col) if lat_col and lat_col in city else city.get('latitude', '')
                        prov_lon = city.get(lon_col) if lon_col and lon_col in city else city.get('longitude', '') or city.get('lng','') or city.get('lon','')
                        found_cap = True
                        break
                except Exception:
                    continue
            if found_cap:
                break

        # fallback heuristics
        if not found_cap and candidates:
            # match equal name
            for city in candidates:
                if str(city.get('name','')).strip().lower() == str(state_name).strip().lower():
                    prov_cap = city.get('name') or ''
                    prov_lat = city.get(lat_col,'') or city.get('latitude','')
                    prov_lon = city.get(lon_col,'') or city.get('longitude','') or city.get('lng','') or city.get('lon','')
                    found_cap = True
                    break
        if not found_cap and candidates:
            # fallback to first candidate
            city = candidates[0]
            prov_cap = city.get('name') or ''
            prov_lat = city.get(lat_col,'') or city.get('latitude','')
            prov_lon = city.get(lon_col,'') or city.get('longitude','') or city.get('lng','') or city.get('lon','')

        # select top N major cities for this state
        major_cities = []
        major_cities_latlon = []
        if candidates:
            # sort by population if available
            if pop_col and pop_col in cities.columns:
                try:
                    sorted_cities = sorted(candidates, key=lambda r: float(r.get(pop_col) or 0), reverse=True)
                except Exception:
                    sorted_cities = candidates
            else:
                sorted_cities = candidates

            seen = set()
            for city in sorted_cities:
                nm = str(city.get('name') or '').strip()
                if not nm or nm in seen:
                    continue
                seen.add(nm)
                lat = city.get(lat_col,'') or city.get('latitude','') or ''
                lon = city.get(lon_col,'') or city.get('longitude','') or city.get('lng','') or city.get('lon','')
                major_cities.append(nm)
                major_cities_latlon.append(f"{nm}|({lat},{lon})")
                if len(major_cities) >= top_n:
                    break

        major_cities_str = ";".join(major_cities)
        major_cities_latlon_str = ";".join(major_cities_latlon)

        # UN subregion lookup
        un_sub = ""
        if country_iso2 and country_iso2 in un_map_iso2:
            un_sub = un_map_iso2.get(country_iso2, "")
        elif country_name and country_name.lower() in un_map_name:
            un_sub = un_map_name.get(country_name.lower(), "")

        business_region = choose_business_region(un_sub)

        rows.append({
            "Country": country_name or '',
            "Country_Code": country_iso2 or '',
            "State_or_Province": state_name or '',
            "Province_Capital": prov_cap or '',
            "Country_Capital": country_capital or '',
            "Business_Region": business_region,
            "UN_Sub_Region": un_sub or '',
            "Latitude": prov_lat or '',
            "Longitude": prov_lon or '',
            "Major_Cities": major_cities_str,
            "Major_Cities_LatLon": major_cities_latlon_str,
        })

    df_out = pd.DataFrame(rows)
    return df_out

def save_splits_and_combined(df):
    # Combined
    df.to_csv(OUT_COMBINED, index=False, encoding='utf-8')
    print("Saved combined:", OUT_COMBINED)

    # Splits
    apac = df[df['Business_Region'] == 'APAC']
    emea = df[df['Business_Region'] == 'EMEA']
    amer = df[df['Business_Region'] == 'Americas']

    apac.to_csv(OUT_APAC, index=False, encoding='utf-8')
    emea.to_csv(OUT_EMEA, index=False, encoding='utf-8')
    amer.to_csv(OUT_AMERICAS, index=False, encoding='utf-8')

    print("Saved splits:", OUT_APAC, OUT_EMEA, OUT_AMERICAS)

def write_readme():
    with open(README, "w", encoding="utf-8") as fh:
        fh.write("world_provincial_capitals_geo_regions dataset\n")
        fh.write("\n")
        fh.write("Produced by build_world_provincial_capitals_split.py\n")
        fh.write("\n")
        fh.write("Sources and attribution:\n")
        fh.write("- dr5hn / countries-states-cities-database (GitHub) — public dataset (commonly ODbL). Please review license and attribution requirements.\n")
        fh.write("- UN M49 / regional mappings (UN Statistics Division) where available.\n")
        fh.write("\n")
        fh.write("Output files:\n")
        fh.write(f"- {OUT_COMBINED}\n")
        fh.write(f"- {OUT_APAC}\n")
        fh.write(f"- {OUT_EMEA}\n")
        fh.write(f"- {OUT_AMERICAS}\n")
        fh.write("\n")
        fh.write("Notes:\n")
        fh.write("- Province_Capital is detected best-effort from the dr5hn cities.csv; some provinces may not have a detected capital and will be blank.\n")
        fh.write("- Major_Cities lists the top N cities for each state, preferring population if available.\n")
        fh.write("\n")
    print("Wrote README:", README)

def main():
    try:
        countries, states, cities = download_and_extract_dr5hn()
    except Exception as e:
        print("Error downloading dr5hn dataset:", e)
        return

    un_df = download_un_m49_guess()
    un_map_iso2, un_map_name = build_un_map(un_df) if not un_df.empty else ({}, {})

    print("Building output table. This may take a minute for large city tables.")
    df_out = build_output_df(countries, states, cities, un_map_iso2, un_map_name, top_n=TOP_N_CITIES)

    print("Total rows (states/provinces) in output:", len(df_out))
    save_splits_and_combined(df_out)
    write_readme()
    print("Done. Please inspect the 'Province_Capital' column and 'Major_Cities' for completeness; manual verification may be required for a few countries.")

if __name__ == "__main__":
    main()