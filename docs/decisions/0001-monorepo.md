# ADR 0001: monorepositório modular

## Status

Aceita.

## Decisão

Manter web, banco e pipeline no mesmo repositório, preservando dependências e limites
de responsabilidade separados.

## Motivo

O produto ainda evolui como uma unidade. A organização reduz custos operacionais e
permite validações integradas sem impedir uma separação futura dos serviços.
