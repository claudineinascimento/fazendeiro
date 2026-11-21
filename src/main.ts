import Phaser from 'phaser';
import { CenaFazenda } from './mundo/CenaFazenda';
import { montarInterface } from './ui/interface';

// Ponto de entrada: cria o jogo Phaser (mundo) e a interface em HTML (HUD, loja, celeiro).
new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'jogo',
  backgroundColor: '#bfe7f7',
  scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
  render: { antialias: true, roundPixels: false },
  scene: [CenaFazenda],
  input: { activePointers: 2 },
});

montarInterface();
