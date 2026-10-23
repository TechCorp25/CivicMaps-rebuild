# M1 audit raw evidence

This directory contains the frozen packet, run/job/step metadata, raw local and hosted logs (gzip-compressed to preserve bytes and avoid whitespace normalization), and inspected screenshots. `evidence-sha256.txt` records the hashes of each original unencoded evidence file. Restore a log with `gzip -dc <file.log.gz> > <file.log>` and verify it against that manifest. `MANIFEST.sha256` binds the unmodified independent report in the parent directory.
