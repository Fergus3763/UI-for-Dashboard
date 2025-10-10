# PR Checklist

- [ ] CSVs are UTF-8, comma-delimited, with headers.
- [ ] Headers and column order match the **DataDictionary** exactly.
- [ ] Extra/source-only columns kept after targets, prefixed `x_`.
- [ ] `Rooms.code` present and **unique**.
- [ ] `RoomCatalogMap.roomId` and `catalogItemId` reference valid IDs.
- [ ] Numeric fields parse as numbers; blanks where unknown.
- [ ] VAT names referenced from `VAT.csv` (no hardcoding).
- [ ] `validator.py` run; `validation_report.txt` attached/updated.
- [ ] Plain-English summary of changes in the PR description.
