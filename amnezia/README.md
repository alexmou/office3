# Amnezia RU profiles

This directory contains the client-side profile artifacts generated from the live production endpoint without modifying the server stack.

## Source-of-truth
- Server: 188.166.182.158
- XRay: TCP 443 / VLESS Reality / SNI www.apple.com / fingerprint chrome
- AWG: UDP 39262 / AmneziaWG 3.1 / jc: 6 / I1 present
- Production state was verified from the live container config, not guessed.

## Status
- RU_XRAY443: generated and placed in each user folder
- RU_AWG443: generated and placed in each user folder
- Real external Russian validation remains pending; no success claim is made yet.

## Files per user
- Maha
- Ya
- Mama
- Sasha_P
- Murygin_V
- Murygin_A

Each user folder contains:
- RU_XRAY443.vless
- RU_XRAY443.png
- RU_AWG443.awg.conf
- RU_AWG443.png
- ${USER}_RU.zip
