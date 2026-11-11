# Eu no Jogo Kids — versão 11

Jogo infantil em que a criança coloca o próprio rosto num personagem, escolhe fantasias e brinca em casa, na escola, no parque e no castelo, com amigos.

Esta é a versão 11 (inclui **Meu mundo**, **fachada** e **Minha casa**). O jogo completo roda no aparelho, e o modo online usa amigos simulados. O servidor (login real e amigos de verdade) é a próxima etapa.

## Instalar no Android (APK)

Baixe no celular: **https://github.com/Wesley-Sal/eu-no-jogo-kids/releases/latest/download/eu-no-jogo-kids.apk**

Toque no arquivo baixado para instalar. Se aparecer o aviso de "fontes desconhecidas", permita para o navegador/gerenciador de arquivos.

O APK é gerado automaticamente pelo GitHub (`.github/workflows/apk.yml`) a cada atualização na branch `main` e publicado em **Releases**. Ele usa uma chave fixa (`android/app/eunojogo.keystore`), então cada versão nova instala por cima da anterior sem perder os dados. Para publicar na Play Store, troque por uma chave privada.

O app Android (`android/`) é um "envelope" que mostra o jogo (copiado para `assets/www`) e abre câmera/galeria para as fotos.

## Jogar no celular (GitHub Pages)

1. No GitHub, abra o repositório → **Settings** → **Pages**.
2. Em **Source**, escolha **Deploy from a branch**, branch **main**, pasta **/ (root)** → **Save**.
3. Em 1 ou 2 minutos aparece o link: `https://SEU-USUARIO.github.io/eu-no-jogo-kids/`.
4. Abra esse link no celular:
   - **Android (Chrome):** menu ⋮ → **Adicionar à tela inicial** / **Instalar app**.
   - **iPhone (Safari):** botão Compartilhar → **Adicionar à Tela de Início**.
5. Pronto: o jogo ganha ícone e abre em tela cheia, como um app. Depois do primeiro acesso funciona até sem internet.

Os dados (perfis, fotos, cômodos, desenhos) ficam salvos **só no celular**, dentro do navegador. Nada vai para o GitHub.

## Como rodar

Não precisa instalar nada. Abra o `index.html` num navegador moderno (Chrome, Safari, Edge ou Firefox), no computador ou no celular.

Para testar no celular pela rede local:

```bash
cd eu-no-jogo-v1
python3 -m http.server 8080
# no celular: http://IP-DO-COMPUTADOR:8080
```

## O que já funciona

- **Área dos pais:** login (simulado), criação de perfis (apelido, idade digitada de 1 a 17 e até 3 hobbies), consentimento para uso da foto, pergunta "só para adultos" para entrar nas configurações, sons, bloqueio do modo online, limite de tempo por sessão, apagar foto, excluir perfil e apagar tudo.
- **Vários perfis por aparelho**, salvos localmente (localStorage).
- **Foto:** câmera ou galeria, recorte em círculo, zoom e arrasto. A foto fica **só no aparelho**.
- **Avatar cartoon:** detecta pele e cabelo pela foto e permite editar cabelo, olhos, óculos, sardas e laço.
- **Modo offline** (foto real, joga sozinho) e **modo online** (avatar cartoon, com amigos).
- **12 fantasias originais.** 8 são liberadas desde o início e 4 são desbloqueadas com estrelas: Mago 15, Ninja 30, Robô 50 e Sereia 75. O desbloqueio é por conquista, sem sorteio e sem dinheiro.
- **4 cenários com objetos interativos:**
  - Casa: cama (dormir), blocos (montar torre), estante (ler)
  - Escola: quadro (desenhar), carteira (estudar), relógio (mostra a hora real)
  - Parque: escorregador, balanço, lago com patos, **caixa de areia** (constrói um castelo de areia) e o **cachorro Bolinha**, que passeia pelo parque, ganha carinho e segue a criança por um tempo
  - Castelo: trono, baú do tesouro
- **Meu mundo (mapa):** um mapa com os lugares do jogo (Casa do jogo, Escola, Parque, Castelo) e até 6 lugares criados pela família (ex.: "Minha casa", "Casa da vó"), cada um com nome, ícone e cor. O personagem anda até o lugar escolhido.
  - Cada lugar tem vários cômodos. No jogo, a barra "📍 Lugar" troca de cômodo, e **portas 🚪** nas laterais levam ao próximo cômodo.
  - Criar e editar lugares e cômodos exige a pergunta para adultos. Na área dos pais dá para gerenciar tudo.
- **Fachada cria a casa:** ao criar um lugar, o primeiro passo é fotografar a **fachada**. A foto vira a casinha no mapa (offline) e a "entrada" do lugar. Marque a **🚪 Porta** para entrar nos cômodos. A ferramenta **🙈 Esconder** borra de verdade (pixeliza antes de salvar) o número da casa, a placa do carro ou o nome da rua. No modo online, o mapa mostra uma casinha desenhada com a cor da fachada.
- **Minha casa:** fotografe um cômodo da casa e ele vira cenário. São 4 passos: foto e enquadramento, linha do chão e tamanho do personagem, marcar os móveis e nome.
  - 14 tipos de móveis com ação: cama (dormir), sofá e cadeira (sentar), TV (assistir), mesa (comer), geladeira, fogão (cozinhar), pia, banho, livros, brinquedos, computador (lição), janela (dia/noite) e planta (regar).
  - Offline: aparece a **foto real** (fica só no aparelho). Online: aparece uma **versão desenhada**, gerada só com as cores e a posição dos móveis (`Home.recipe()`).
  - Para criar um cômodo é preciso passar pela pergunta para adultos. Na área dos pais dá para editar e excluir cômodos.
- **Desenho livre (`drawpad.js`):** o quadro da escola e o hobby Desenhar abrem uma prancheta para desenhar com o dedo. Tem cores (giz no quadro, lápis no papel), 3 espessuras, borracha, desfazer, limpar e carimbos (⭐❤️🌈🌸🐶☀️🦋🚗). O desenho fica guardado no perfil (só no aparelho) e aparece no quadro da escola e no cavalete do jogo.
- **Foto integrada ao personagem (`stylizePhoto`):** no modo offline a foto aparece em 3 estilos: **Rosto recortado** (`cutFace`: detecta a pele na foto, recorta só o rosto sem fundo nem cabelo e encaixa na cabeça do personagem, com o cabelo do avatar), **Desenho** (filtro de desenho animado) e **Natural**.
- **Tela cheia:** jogo e mapa ocupam a tela toda, com botões em cima e hobbies/falas embaixo. No APK as barras do Android somem.
- **Professora Ana (`quiz.js`):** na escola, toque na professora, escolha o tema (Matemática, Letras e palavras, Animais, Cores e formas, Natureza e corpo) e responda 10 perguntas adaptadas à idade. No fim sai a **nota de 0 a 10**, estrelas e a melhor nota de cada tema fica guardada no boletim.
- **Minha roupa (`outfit.js`):** foto de uma camiseta/vestido vira a roupa do personagem em estilo desenho (fica só no aparelho; online vão só as cores).
- **Cavalete no quarto e Quadro de desenho:** na Casa do jogo há um cavalete 🎨; nos cômodos fotografados dá para marcar um "Quadro de desenho". O desenho fica pendurado no lugar.
- **Tela limpa:** em cima só 🏠, personagem, ⭐, 📍 cômodo (nas casas da família), 🗺️ Mapa e ☰ Menu (fantasias, bichinhos, avatar, foto, modo online/offline, fotografar cômodo, tela cheia, pais). Embaixo: botão 🎮 Fazer, 💬 Falar (só online) e 🔍 zoom.
- **12 brincadeiras no Fazer:** as 6 de antes + pular, dar estrelinha, bater palmas, bolhas de sabão, soltar pipa e tocar violão (as favoritas do perfil aparecem primeiro com ❤️).
- **Zoom no jogo:** botões ＋/1×/− na lateral, pinça com dois dedos ou roda do mouse; a câmera segue o personagem.
- **Rosto centralizado:** ao escolher a foto, o jogo acha o rosto (`locateFace`) e já centraliza e aproxima no círculo.
- **Atalhos:** botão 🏠 Início no jogo e barra "🏡 Minha casa: 📷 Fotografar cômodo" (cria a "Minha casa" sozinha se ainda não existir).
- **Bichinhos (`pets.js`):** botão 🐾 para adotar cachorro, gato, pássaro ou tartaruga, escolher a cor e dar nome. Eles vivem nas casas da família (e na Casa do jogo). Ao tocar: carinho, dar comida, brincar ou "vem comigo" (segue a criança).
- **Hobbies animados:** jogar bola (embaixadinhas), desenhar (cavalete), dançar, ler, cantar e pular corda. Amigos que têm o mesmo hobby vêm brincar junto.
- **Estrelas:** rodadas de 5 estrelas, com bônus ao completar e +1 na primeira vez que usa cada objeto.
- **Frases prontas** em vez de chat livre. Sons sintetizados, sem arquivos de áudio.
- Funciona com toque (celular) e com setas/WASD (computador).

## Estrutura do código

```
index.html          telas (HTML)
manifest.webmanifest / sw.js / icons/   instalação como app (PWA) e uso sem internet
css/style.css       visual
js/util.js          utilidades de desenho e constantes do mundo (960x600)
js/sound.js         efeitos sonoros (Web Audio)
js/avatar.js        rosto cartoon, detecção pela foto, avatarRecipe()
js/storage.js       dados locais (perfis, configurações)
js/characters.js    fantasias e desenho do personagem (drawChar)
js/hobbies.js       hobbies e suas animações
js/scenes.js        cenários (fundos) e objetos interativos (OBJECTS)
js/home.js          Minha casa: tipos de móveis, fundo foto/cartoon, ações
js/room-editor.js   editor de cômodo a partir da foto
js/drawpad.js       prancheta de desenho livre (quadro e cavalete)
js/world.js         mapa do mundo, lugares, criar/editar lugar
js/game.js          motor: movimento, ações dos objetos (ACTS), estrelas, desenho da cena
js/friends.js       amigos do modo online (hoje simulados)
js/app.js           telas, perfis, área dos pais, laço principal
```

Todo o visual é desenhado por código (canvas). Não há imagens nem personagens licenciados.

### Como adicionar conteúdo

- **Nova fantasia:** inclua em `COSTUMES` e `ST` (`characters.js`) e desenhe os detalhes nos `switch` de `drawChar`.
- **Novo objeto num cenário:** inclua em `OBJECTS` (`scenes.js`) e crie a ação em `ACTS` (`game.js`).
- **Novo cenário:** inclua em `SCENES`, crie a função de desenho em `DRAW` e os objetos em `OBJECTS`.
- **Novo hobby:** inclua em `HOBBIES` e desenhe em `drawActFront` / `drawActBack` (`hobbies.js`).

## Próximas etapas (online)

1. **Família (só online):** pai, mãe e criança com avatares na mesma sala, cada um no seu celular.
2. **Login real:** Firebase Authentication com "Entrar com Google" para o **responsável**. A criança não tem conta própria: os perfis ficam dentro da conta do responsável.
3. **Servidor:** Firebase (Firestore ou Realtime Database) para:
   - perfis públicos: apelido, fantasia e `avatarRecipe()` (**nunca a foto**)
   - amizades aprovadas pelos pais (convite com código + aprovação)
   - salas: posição, hobby em andamento e frase pronta de cada jogador
4. **Trocar `friends.js`** por uma versão conectada ao servidor. O resto do jogo só lê `game.bots`.
5. **Moderação:** denúncia, bloqueio e regras de segurança no servidor.
6. **Lojas:** empacotar com Capacitor (o mesmo código vira app Android/iOS).

## Checklist de privacidade (para revisão jurídica)

Base: LGPD e ECA Digital (Lei 15.211/2025, em vigor desde 17/03/2026).

- [x] Conta e perfis criados pelo responsável, com consentimento explícito
- [x] Foto processada e guardada só no aparelho, com opção de apagar
- [x] Fotos da casa e da fachada só no aparelho; online usa apenas versão desenhada
- [x] Ferramenta para borrar número da casa, placa e nome da rua antes de salvar
- [x] Online usa só avatar cartoon + apelido (dados mínimos)
- [x] Sem chat livre, só frases prontas
- [x] Modo online pode ser bloqueado pelos pais
- [x] Limite de tempo configurável pelos pais
- [x] Sem loot boxes, sem compras, sem publicidade
- [ ] Verificação de idade/responsável que não seja autodeclaração (etapa online)
- [ ] Aprovação de amigos pelos pais (etapa online)
- [ ] Canal de denúncia e moderação (etapa online)
- [ ] Política de privacidade e termos revisados por advogado
