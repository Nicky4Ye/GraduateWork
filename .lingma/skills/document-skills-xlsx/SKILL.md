---
name: document-skills-xlsx
description: Comprehensive spreadsheet creation, editing, and analysis with support for formulas, formatting, data analysis, and visualization. Use when working with spreadsheets (.xlsx, .xlsm, .csv, .tsv, etc) for: (1) Creating new spreadsheets with formulas and formatting, (2) Reading or analyzing data, (3) Modifying existing spreadsheets while preserving formulas, (4) Data analysis and visualization in spreadsheets, or (5) Recalculating formulas.
---

# XLSX Creation, Editing, and Analysis

## Requirements for Outputs

### All Excel files

**Zero Formula Errors**  
Every Excel model MUST be delivered with ZERO formula errors (#REF!, #DIV/0!, #VALUE!, #N/A, #NAME?).

**Preserve Existing Templates (when updating)**  
- Study and EXACTLY match existing format, style, and conventions when modifying files  
- Never impose standardized formatting on files with established patterns  
- Existing template conventions ALWAYS override these guidelines  

### Financial models

**Color coding (unless user or template says otherwise)**  
- **Blue (0,0,255)**: Hardcoded inputs, scenario numbers  
- **Black (0,0,0)**: All formulas and calculations  
- **Green (0,128,0)**: Links from other sheets in same workbook  
- **Red (255,0,0)**: External links to other files  
- **Yellow fill (255,255,0)**: Key assumptions or cells to update  

**Number formatting**  
- **Years**: Text (e.g. "2024" not "2,024")  
- **Currency**: $#,##0; units in headers ("Revenue ($mm)")  
- **Zeros**: Show as "-" via format (e.g. "$#,##0;($#,##0);-")  
- **Percentages**: 0.0%  
- **Multiples**: 0.0x (e.g. EV/EBITDA, P/E)  
- **Negatives**: Parentheses (123) not minus  

**Formulas**  
- Put assumptions in separate cells; reference them, do not hardcode in formulas  
- Example: `=B5*(1+$B$6)` not `=B5*1.05`  
- Document hardcoded values: "Source: [System/Document], [Date], [Reference], [URL]"  

---

## CRITICAL: Use Formulas, Not Hardcoded Values

**Use Excel formulas for calculations instead of computing in code and writing a number.** Keeps the sheet dynamic.

**Wrong**  
```python
total = df['Sales'].sum()
sheet['B10'] = total  # Hardcodes result
```

**Correct**  
```python
sheet['B10'] = '=SUM(B2:B9)'
```

Same for growth, averages, ratios: use `=...` in the cell.

---

## Workflows

### 1. Choose tool
- **pandas**: Data analysis, bulk ops, simple export  
- **openpyxl**: Formulas, formatting, multi-sheet structure  

### 2. Create or load
- New: `Workbook()`  
- Existing: `load_workbook('file.xlsx')`  

### 3. Modify
- Add/edit data, formulas, formatting  
- Preserve existing formulas when editing  

### 4. Save
- `wb.save('output.xlsx')`  

### 5. Recalculate (if file has formulas)
- Excel formulas written by openpyxl are not evaluated. Use a recalc step (e.g. LibreOffice + script, or open/save in Excel) so values are correct.  
- If using a `recalc.py` script: `python recalc.py output.xlsx [timeout_seconds]`  
- After recalc, verify no #REF!, #DIV/0!, #VALUE!, #NAME? remain.  

---

## Reading and analyzing data (pandas)

```python
import pandas as pd

df = pd.read_excel('file.xlsx')  # First sheet
all_sheets = pd.read_excel('file.xlsx', sheet_name=None)  # All sheets

df.head()
df.info()
df.describe()

df.to_excel('output.xlsx', index=False)
```

- Use `dtype={'id': str}` etc. to avoid bad inference.  
- Large files: `usecols=['A','C','E']`, `parse_dates=['date_column']`.  

---

## Creating new Excel files (openpyxl)

```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

wb = Workbook()
sheet = wb.active

sheet['A1'] = 'Hello'
sheet['B1'] = 'World'
sheet.append(['Row', 'of', 'data'])
sheet['B2'] = '=SUM(A1:A10)'

sheet['A1'].font = Font(bold=True, color='FF0000')
sheet['A1'].fill = PatternFill('solid', start_color='FFFF00')
sheet['A1'].alignment = Alignment(horizontal='center')
sheet.column_dimensions['A'].width = 20

wb.save('output.xlsx')
```

---

## Editing existing Excel files (openpyxl)

```python
from openpyxl import load_workbook

wb = load_workbook('existing.xlsx')
sheet = wb.active  # or wb['SheetName']

for name in wb.sheetnames:
    ws = wb[name]

sheet['A1'] = 'New Value'
sheet.insert_rows(2)
sheet.delete_cols(3)
new_sheet = wb.create_sheet('NewSheet')

wb.save('modified.xlsx')
```

- **Warning**: `load_workbook('file.xlsx', data_only=True)` reads values only; saving then overwrites and removes formulas. Use `data_only=True` only for read-only analysis.  
- Large files: `read_only=True` for reading, `write_only=True` for writing.  
- Rows/columns are 1-based (row 1, col 1 = A1).  

---

## Formula verification checklist

- [ ] Test a few cell references before building the full model  
- [ ] Column mapping correct (e.g. column 64 = BL)  
- [ ] Row offset: DataFrame row 5 = Excel row 6 (1-based)  
- [ ] NaN: use `pd.notna()` before writing  
- [ ] No division by zero (#DIV/0!)  
- [ ] All referenced cells exist (#REF!)  
- [ ] Cross-sheet: use `Sheet1!A1`  
- [ ] Test edge cases: zero, negative, large numbers  

---

## Code style

- Minimal Python; no unnecessary comments or prints.  
- In the Excel file: add cell comments for complex formulas and key assumptions; document sources for hardcoded values.  
