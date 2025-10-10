"""
validator.py — lightweight checks for /data CSVs.

Run:
  python validator.py

Outputs:
  validation_report.txt (plain English summary)
"""
import pandas as pd
from pathlib import Path

EXPECTED = {
    "Catalog.csv": ["id","name","heading","vatCategory","ratePerHour","rateHalfDay","rateDay","ratePerPerson","ratePerBooking","includedDefault","includedCondition","notes"],
    "Rooms.csv": ["id","venueId","name","code","description","sizeSqm","heightM","accessible","featuresJSON","imagesJSON","layoutsJSON","baseRateHour","baseRateHalfDay","baseRateDay"],
    "RoomCatalogMap.csv": ["id","roomId","catalogItemId","visibility","basisOverride","rateOverridesJSON","minQty","maxQty","defaultQty","autoSuggest"],
    "VAT.csv": ["id","name","ratePercent","appliesToJSON"],
    "Durations.csv": ["code","label","hours"],
}

NUMERIC_FIELDS = {
    "Catalog.csv": ["ratePerHour","rateHalfDay","rateDay","ratePerPerson","ratePerBooking"],
    "Rooms.csv": ["sizeSqm","heightM","baseRateHour","baseRateHalfDay","baseRateDay"],
    "VAT.csv": ["ratePercent"],
    "Durations.csv": ["hours"],
}

def main():
    data_dir = Path("data")
    report_lines = ["Validation Report", ""]

    dfs = {}
    for fname, cols in EXPECTED.items():
        p = data_dir/fname
        if not p.exists():
            report_lines.append(f"- {fname}: MISSING")
            continue
        try:
            df = pd.read_csv(p)
        except Exception as e:
            report_lines.append(f"- {fname}: ERROR reading file: {e}")
            continue

        dfs[fname] = df
        missing = [c for c in cols if c not in df.columns]
        extra = [c for c in df.columns if c not in cols]
        status = "OK" if not missing and not extra else "MISMATCH"
        report_lines.append(f"- {fname}: {status} (rows={len(df)}, missing={missing or '[]'}, extra={extra or '[]'})")

    # Rooms.code checks
    if "Rooms.csv" in dfs:
        codes = dfs["Rooms.csv"].get("code")
        if codes is not None:
            codes = codes.astype(str).str.strip()
            empties = (codes == "") | dfs["Rooms.csv"]["code"].isna()
            dups = codes[codes != ""].duplicated()
            if empties.any():
                report_lines.append(f"  • Rooms.csv: {int(empties.sum())} empty code(s)")
            if dups.any():
                dup_vals = sorted(codes[codes != ""][dups].unique().tolist())
                report_lines.append(f"  • Rooms.csv: duplicate code(s): {dup_vals}")

    # RoomCatalogMap foreign keys
    if "RoomCatalogMap.csv" in dfs:
        rcm = dfs["RoomCatalogMap.csv"]
        rooms = dfs.get("Rooms.csv")
        cat = dfs.get("Catalog.csv")
        if rooms is not None and cat is not None and {"roomId","catalogItemId"}.issubset(rcm.columns):
            bad_room = rcm[~rcm["roomId"].isin(rooms["id"])]
            bad_item = rcm[~rcm["catalogItemId"].isin(cat["id"])]
            if len(bad_room): report_lines.append(f"  • RoomCatalogMap.csv: {len(bad_room)} unknown roomId(s)")
            if len(bad_item): report_lines.append(f"  • RoomCatalogMap.csv: {len(bad_item)} unknown catalogItemId(s)")

    # VAT name matches
    if "Catalog.csv" in dfs and "VAT.csv" in dfs:
        cat = dfs["Catalog.csv"]; vat = dfs["VAT.csv"]
        if not vat.empty and "vatCategory" in cat.columns and "name" in vat.columns:
            bad = cat["vatCategory"].dropna().astype(str).str.strip()
            bad = bad[(bad != "") & (~bad.isin(vat["name"].astype(str).str.strip()))]
            if len(bad):
                report_lines.append(f"  • Catalog.csv: {len(bad)} item(s) reference VAT names not in VAT.csv")

    # Numeric parsing
    for fname, fields in NUMERIC_FIELDS.items():
        df = dfs.get(fname)
        if df is not None:
            for f in fields:
                if f in df.columns:
                    try:
                        pd.to_numeric(df[f].dropna(), errors="raise")
                    except Exception:
                        report_lines.append(f"  • {fname}: non-numeric values in {f}")

    Path("validation_report.txt").write_text("\n".join(report_lines), encoding="utf-8")
    print("validation_report.txt written.")

if __name__ == "__main__":
    main()
