import Phaser from 'phaser';
import { TILE_A, TILE_L } from '../config';
import { ANIMAIS, CULTURAS } from '../dados';

// Arte PLACEHOLDER gerada por código (sem arquivos). O Artista 2D substitui por atlas
// real mantendo as mesmas chaves de textura e o canvas de 128×128 com âncora (0.5, 0.75).

const CONTORNO = 0x3b2a1a;
export const COR_CULTURA: Record<string, number> = {
  rabanete: 0xe5534b,
  alface: 0x8bcb4a,
  cenoura: 0xf59a23,
  milho: 0xf7c531,
  tomate: 0xd9483b,
  batata: 0xc68a4e,
  morango: 0xe0386b,
  abobora: 0xf08a24,
  girassol: 0xffd23f,
  trigo: 0xe3c565,
  melancia: 0x3faa5a,
  algodao: 0xf4f4f4,
};

function losango(g: Phaser.GameObjects.Graphics, cor: number, borda: number, y0: number): void {
  const w = TILE_L / 2;
  const h = TILE_A / 2;
  const pts = [
    new Phaser.Math.Vector2(w, y0),
    new Phaser.Math.Vector2(TILE_L - 1, y0 + h),
    new Phaser.Math.Vector2(w, y0 + TILE_A - 1),
    new Phaser.Math.Vector2(1, y0 + h),
  ];
  g.fillStyle(cor, 1).fillPoints(pts, true);
  g.lineStyle(2, borda, 0.5).strokePoints(pts, true);
}

function gerar(cena: Phaser.Scene, chave: string, largura: number, altura: number, desenhar: (g: Phaser.GameObjects.Graphics) => void): void {
  if (cena.textures.exists(chave)) return;
  const g = cena.make.graphics({ x: 0, y: 0 }, false);
  desenhar(g);
  g.generateTexture(chave, largura, altura);
  g.destroy();
}

export function gerarTexturas(cena: Phaser.Scene): void {
  gerar(cena, 'grama1', TILE_L, TILE_A, (g) => losango(g, 0x8bcb4a, 0x6fae3a, 0));
  gerar(cena, 'grama2', TILE_L, TILE_A, (g) => losango(g, 0x7fc041, 0x6fae3a, 0));
  gerar(cena, 'bloqueado', TILE_L, TILE_A, (g) => losango(g, 0x5f8f3a, 0x3b5f24, 0));
  gerar(cena, 'arado', TILE_L, TILE_A, (g) => {
    losango(g, 0x9a6232, 0x6e4322, 0);
    g.lineStyle(3, 0x6e4322, 0.8); // sulcos
    for (let i = -2; i <= 2; i++) g.lineBetween(64 + i * 14 - 18, 32 + i * 7 - 9 + 18, 64 + i * 14 + 18, 32 + i * 7 + 9 - 18 + 18);
  });
  gerar(cena, 'seta', 24, 24, (g) => g.fillStyle(0xffffff, 1).fillCircle(12, 12, 10));

  for (const a of ANIMAIS) {
    gerar(cena, `animal_${a.id}`, TILE_L, TILE_L, (g) => desenharAnimal(g, COR_ANIMAL[a.id] ?? 0xffffff));
  }
  gerar(cena, 'bolha', 56, 56, (g) => {
    g.fillStyle(0xffffff, 1).fillCircle(28, 28, 24).lineStyle(4, CONTORNO, 1).strokeCircle(28, 28, 24);
    g.fillStyle(0xf7c531, 1).fillCircle(28, 28, 12);
  });

  for (const c of CULTURAS) {
    const cor = COR_CULTURA[c.id] ?? 0xffffff;
    for (let estagio = 0; estagio <= 3; estagio++) {
      gerar(cena, `${c.id}_${estagio}`, TILE_L, TILE_L, (g) => desenharCultura(g, cor, estagio));
    }
  }
}

// Centro do losango dentro do canvas 128×128: (64, 96).
function desenharCultura(g: Phaser.GameObjects.Graphics, cor: number, estagio: number): void {
  const cx = 64;
  const cy = 96;
  if (estagio === 0) {
    // semente: montinhos de terra
    g.fillStyle(0x6e4322, 1);
    for (const dx of [-16, 0, 16]) g.fillEllipse(cx + dx, cy + (dx === 0 ? 4 : -2), 14, 8);
    return;
  }
  const folha = 0x3fae49;
  const alturas = [0, 22, 36, 44][estagio] ?? 22;
  g.lineStyle(3, CONTORNO, 1);
  for (const dx of estagio === 1 ? [0] : [-14, 0, 14]) {
    g.fillStyle(folha, 1);
    g.fillTriangle(cx + dx - 7, cy, cx + dx + 7, cy, cx + dx, cy - alturas);
    g.strokeTriangle(cx + dx - 7, cy, cx + dx + 7, cy, cx + dx, cy - alturas);
  }
  if (estagio === 3) {
    // produto maduro na cor da cultura
    g.fillStyle(cor, 1).lineStyle(3, CONTORNO, 1);
    for (const dx of [-14, 0, 14]) {
      g.fillCircle(cx + dx, cy - alturas - 4 + (dx === 0 ? -6 : 4), 9);
      g.strokeCircle(cx + dx, cy - alturas - 4 + (dx === 0 ? -6 : 4), 9);
    }
  }
}

export const COR_ANIMAL: Record<string, number> = {
  galinha: 0xffffff,
  vaca: 0xf1e7d6,
  ovelha: 0xe8e8f0,
  porco: 0xf4a6b8,
  cabra: 0xc9b79c,
};

// Animal placeholder: corpo oval, cabeça e olho.
function desenharAnimal(g: Phaser.GameObjects.Graphics, cor: number): void {
  const cx = 64;
  const cy = 96;
  g.fillStyle(0x000000, 0.2).fillEllipse(cx, cy + 2, 50, 18);
  g.fillStyle(cor, 1).lineStyle(3, CONTORNO, 1);
  g.fillEllipse(cx, cy - 18, 46, 34).strokeEllipse(cx, cy - 18, 46, 34);
  g.fillCircle(cx + 18, cy - 36, 13).strokeCircle(cx + 18, cy - 36, 13);
  g.fillStyle(CONTORNO, 1).fillCircle(cx + 22, cy - 38, 2.5);
  g.fillStyle(0xf59a23, 1).fillTriangle(cx + 30, cy - 36, cx + 38, cy - 33, cx + 30, cy - 30);
}
