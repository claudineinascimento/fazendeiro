import Phaser from 'phaser';
import { LIMITE_TOQUE_MS, LIMITE_TOQUE_PX, MAPA, TILE_A, TILE_L, ZOOM_MAX, ZOOM_MIN } from '../config';
import { culturaPorId } from '../dados';
import { jogo } from '../jogo';
import { chave, dentroDaArea, type EstadoJogo } from '../nucleo/estado';
import type { Evento } from '../nucleo/acoes';
import { agora, estagio, progresso } from '../nucleo/tempo';
import { som } from '../audio';
import { gerarTexturas } from './texturas';
import { isoParaTela, profundidade, telaParaGrade } from './isometrico';

// Cena da fazenda: desenha o chão, os canteiros e as culturas, e cuida da câmera
// (arrastar com 1 dedo, pinça com 2 dedos, roda do mouse) e do toque nos tiles.
export class CenaFazenda extends Phaser.Scene {
  private chao = new Map<string, Phaser.GameObjects.Image>();
  private plantas = new Map<string, Phaser.GameObjects.Image>();
  private pulsos = new Map<string, Phaser.Tweens.Tween>();

  // estado dos gestos
  private inicioX = 0;
  private inicioY = 0;
  private inicioT = 0;
  private arrastou = false;
  private multitoque = false;
  private distPinca = 0;

  constructor() {
    super('fazenda');
  }

  create(): void {
    gerarTexturas(this);
    this.cameras.main.setBackgroundColor('#bfe7f7');
    this.criarChao();
    this.configurarCamera();
    this.configurarEntrada();

    this.sincronizar(jogo.estado);
    jogo.aoMudar((estado, eventos) => {
      this.sincronizar(estado);
      eventos.forEach((e) => this.mostrarEvento(e));
    });
    // Atualiza o estágio das culturas uma vez por segundo (não a cada quadro).
    this.time.addEvent({ delay: 1000, loop: true, callback: () => this.atualizarEstagios() });
    // Ao voltar para o jogo (troca de aba/app), recalcula na hora.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.atualizarEstagios();
    });
  }

  // ---------- desenho ----------

  private criarChao(): void {
    for (let y = 0; y < MAPA; y++) {
      for (let x = 0; x < MAPA; x++) {
        const p = isoParaTela(x, y);
        const img = this.add.image(p.x, p.y, 'grama1').setDepth(profundidade(x, y, 0));
        this.chao.set(chave(x, y), img);
      }
    }
  }

  private sincronizar(estado: EstadoJogo): void {
    for (let y = 0; y < MAPA; y++) {
      for (let x = 0; x < MAPA; x++) {
        const k = chave(x, y);
        const img = this.chao.get(k)!;
        let tex = 'bloqueado';
        if (dentroDaArea(estado, x, y)) tex = estado.canteiros[k] ? 'arado' : (x + y) % 2 ? 'grama1' : 'grama2';
        if (img.texture.key !== tex) img.setTexture(tex);
      }
    }
    // plantas: remove as que sumiram
    for (const [k, img] of this.plantas) {
      if (!estado.canteiros[k]?.cultura) {
        this.pulsos.get(k)?.stop();
        this.pulsos.delete(k);
        img.destroy();
        this.plantas.delete(k);
      }
    }
    this.atualizarEstagios();
  }

  private atualizarEstagios(): void {
    const t = agora();
    for (const [k, c] of Object.entries(jogo.estado.canteiros)) {
      if (!c.cultura) continue;
      const cultura = culturaPorId(c.cultura);
      if (!cultura) continue;
      const e = estagio(progresso(c, cultura, t));
      const tex = `${c.cultura}_${e}`;
      let img = this.plantas.get(k);
      const [xs, ys] = k.split(',');
      const x = Number(xs);
      const y = Number(ys);
      if (!img) {
        const p = isoParaTela(x, y);
        img = this.add.image(p.x, p.y, tex).setOrigin(0.5, 0.75).setDepth(profundidade(x, y, 1));
        this.plantas.set(k, img);
      }
      if (img.texture.key !== tex) img.setTexture(tex);
      // cultura pronta "pulsa" para chamar o toque
      if (e === 3 && !this.pulsos.has(k)) {
        this.pulsos.set(k, this.tweens.add({ targets: img, scaleX: 1.08, scaleY: 1.08, yoyo: true, repeat: -1, duration: 600, ease: 'Sine.easeInOut' }));
      } else if (e < 3 && this.pulsos.has(k)) {
        this.pulsos.get(k)!.stop();
        this.pulsos.delete(k);
        img.setScale(1);
      }
    }
  }

  private mostrarEvento(e: Evento): void {
    const texto = (x: number, y: number, msg: string, cor: string) => {
      const p = isoParaTela(x, y);
      const t = this.add
        .text(p.x, p.y - 40, msg, { fontFamily: 'sans-serif', fontSize: '28px', fontStyle: 'bold', color: cor, stroke: '#3b2a1a', strokeThickness: 5 })
        .setOrigin(0.5)
        .setDepth(10000);
      this.tweens.add({ targets: t, y: t.y - 70, alpha: 0, duration: 900, onComplete: () => t.destroy() });
    };
    switch (e.tipo) {
      case 'arou':
        texto(e.x, e.y, `-${e.custo} 🪙`, '#f7c531');
        som.arar();
        break;
      case 'plantou':
        texto(e.x, e.y, `-${e.custo} 🪙`, '#f7c531');
        som.plantar();
        break;
      case 'colheu':
        texto(e.x, e.y, `+1 ${culturaPorId(e.cultura)?.nome ?? ''}  +${e.xp} XP`, '#ffffff');
        som.colher();
        break;
      case 'nivel':
        som.nivel();
        break;
      case 'vendeu':
        som.moeda();
        break;
    }
  }

  // ---------- câmera e entrada ----------

  private configurarCamera(): void {
    const cam = this.cameras.main;
    const larg = MAPA * TILE_L;
    cam.setBounds(-larg / 2 - 300, -300, larg + 600, MAPA * TILE_A + 600);
    const centro = isoParaTela((MAPA - 1) / 2, (MAPA - 1) / 2);
    cam.centerOn(centro.x, centro.y);
    cam.setZoom(Phaser.Math.Clamp(this.scale.width / 1100, ZOOM_MIN + 0.1, 1));
  }

  private configurarEntrada(): void {
    this.input.addPointer(1); // habilita o 2º dedo (pinça)
    this.input.mouse?.disableContextMenu();

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (!this.input.pointer2.isDown) {
        this.inicioX = p.x;
        this.inicioY = p.y;
        this.inicioT = p.downTime;
        this.arrastou = false;
        this.multitoque = false;
      }
    });

    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!p.isDown || this.multitoque) return;
      if (!this.arrastou && Phaser.Math.Distance.Between(p.x, p.y, this.inicioX, this.inicioY) > LIMITE_TOQUE_PX) this.arrastou = true;
      if (this.arrastou) {
        const cam = this.cameras.main;
        cam.scrollX -= (p.x - p.prevPosition.x) / cam.zoom;
        cam.scrollY -= (p.y - p.prevPosition.y) / cam.zoom;
      }
    });

    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      const foiToque = !this.arrastou && !this.multitoque && p.upTime - this.inicioT < LIMITE_TOQUE_MS;
      if (!this.input.pointer1.isDown && !this.input.pointer2.isDown) {
        this.multitoque = false;
        this.distPinca = 0;
      }
      if (!foiToque) return;
      const w = this.cameras.main.getWorldPoint(p.x, p.y);
      const g = telaParaGrade(w.x, w.y);
      if (g.x < 0 || g.y < 0 || g.x >= MAPA || g.y >= MAPA) return;
      jogo.tocar(g.x, g.y);
    });

    // roda do mouse (desktop): zoom no ponto do cursor
    this.input.on('wheel', (p: Phaser.Input.Pointer, _o: unknown, _dx: number, dy: number) => {
      this.aplicarZoom(this.cameras.main.zoom * (dy > 0 ? 0.9 : 1.1), p.x, p.y);
    });
  }

  update(): void {
    const p1 = this.input.pointer1;
    const p2 = this.input.pointer2;
    if (p1.isDown && p2.isDown) {
      this.multitoque = true;
      const d = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
      if (this.distPinca > 0 && d > 0) {
        this.aplicarZoom(this.cameras.main.zoom * (d / this.distPinca), (p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
      }
      this.distPinca = d;
    }
  }

  /** Zoom (0,5× a 2×) mantendo o ponto (sx, sy) da tela parado. */
  private aplicarZoom(novo: number, sx: number, sy: number): void {
    const cam = this.cameras.main;
    const z = Phaser.Math.Clamp(novo, ZOOM_MIN, ZOOM_MAX);
    const mx = cam.width / 2;
    const my = cam.height / 2;
    // mundo sob o ponto antes do zoom: scroll + centro + (tela - centro) / zoom
    const antesX = cam.scrollX + mx + (sx - mx) / cam.zoom;
    const antesY = cam.scrollY + my + (sy - my) / cam.zoom;
    cam.setZoom(z);
    cam.scrollX = antesX - mx - (sx - mx) / z;
    cam.scrollY = antesY - my - (sy - my) / z;
  }
}
