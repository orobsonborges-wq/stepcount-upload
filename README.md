# StepCount — contador de degraus

Protótipo mobile-first para upload de vídeos de teste de degrau. A interface cobre o fluxo de seleção, configuração da borda do degrau, processamento demonstrativo e revisão da contagem.

## Como executar

Sirva esta pasta com qualquer servidor estático. Por exemplo:

```bash
python3 -m http.server 4173
```

Depois abra `http://localhost:4173`.

## Fluxo disponível

A tela inicial permite selecionar ou arrastar um vídeo, informa o limite de 200 MB e inclui o vídeo de referência informado pelo usuário: `https://www.youtube.com/shorts/2MnYpzTyVoA`.

Também há um caminho demonstrativo, “Conheça com um vídeo de exemplo”, para acessar a experiência sem selecionar um arquivo. Na configuração, a linha da borda do degrau pode ser arrastada verticalmente. O botão de análise inicia uma progressão visual até o resultado, que apresenta contagem, confiança, duração, cadência, ritmo e eventos revisáveis.

## Observação técnica

O protótipo atual implementa a experiência de produto e a simulação do processamento no navegador. A análise real exigiria um backend com pré-processamento de vídeo, detecção de pose, identificação da plataforma, máquina de estados para os ciclos de subida/retorno, armazenamento temporário e validação contra contagens humanas.
