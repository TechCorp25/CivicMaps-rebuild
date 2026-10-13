# Barcode & QR Code Generation Reference

Generic, standards-based reference for linear (1D) and matrix (2D) barcode generation. Sourced from the public ISO specifications, not tied to any specific issuer.

---

## 1. Code 128 (Linear Barcode) — ISO/IEC 15417

Code 128 is a high-density alphanumeric 1D symbology. Subset B encodes ASCII text; Subset C encodes numeric digit pairs at double density.

### Data string

A clean numeric or alphanumeric sequence with no separators:

```
Data String = [C1 C2 C3 ... Cn]
```

### Modulo-103 check character

```
C = ( V_start + Σ(i=1 to n) [ i × V_char,i ] ) mod 103
```

- `C` — numeric value of the check character.
- `V_start` — value of the chosen start character: Start A = 103, Start B = 104, Start C = 105.
- `i` — position of each data character, indexed from 1 (the start character itself occupies position 1; the first data character also carries weight 1).
- `V_char,i` — the symbol value of that character from the Code 128 character table (values 0–102, per subset).

The remainder is converted back to its corresponding Code 128 symbol and inserted immediately before the stop character.

### Worked example (generic)

Encoding `"667390"` in Subset C (digit pairs 66, 73, 90), Start C = 105:

| Symbol | Value | Weight | Value × Weight |
|---|---|---|---|
| Start C | 105 | 1 | 105 |
| 66 | 66 | 1 | 66 |
| 73 | 73 | 2 | 146 |
| 90 | 90 | 3 | 270 |

Sum = 105 + 66 + 146 + 270 = 587
587 mod 103 = 72 → check character value 72

### Full symbol structure

```
[Start Character] + [Data Symbols] + [Check Character] + [Stop Character] + [Quiet Zone]
```

---

## 2. QR Code (Matrix/2D) — ISO/IEC 18004

QR Model 2 uses Reed–Solomon error correction over a Galois Field, allowing the symbol to remain scannable despite partial damage.

### Error correction levels

| Level | Approx. recoverable data |
|---|---|
| L | ~7% |
| M | ~15% |
| Q | ~25% |
| H | ~30% |

### Galois Field

```
GF(2^8), primitive polynomial p(x) = x^8 + x^4 + x^3 + x^2 + 1
```

### Generator polynomial

```
g(x) = Π(i=0 to E-1) (x − α^i) = (x − α^0)(x − α^1)...(x − α^(E-1))
```

- `α` — primitive root of GF(2^8).
- `E` — number of error-correction codewords required for the chosen QR version/EC-level combination (fixed by the ISO 18004 version tables).

### Generic payload format

Payload structure is entirely up to the implementer — QR just encodes bytes. A generic identifier-lookup pattern:

```
Payload = <base-url> + <record-id>
```

---

## Notes for implementation

- Both algorithms above are public, standardized, and identical regardless of issuer — a barcode library (e.g. ZXing, bwip-js, python-barcode) implements this same math.
- Real-world offence codes, penalty amounts, and statute references are jurisdiction-specific and legally authoritative — these come from the actual governing legislation (e.g. state Infringements Act, Road Rules) or a direct data-sharing agreement with each council, not from general web search output.
- Any production payload URL/domain should point to infrastructure you actually control and are authorized to issue against.
