export const STAGES = [
  { stage: 0, id: 'staff-anchor', title: 'Staff Anchor', unlock: { notes: ['C4','G4'], rhythm: ['quarter'] }, field: 'training-4', gate: 'ドとソを、拍から落ちずに初見で歌える' },
  { stage: 1, id: 'do-sol-in-time', title: 'DO / SOL in Time', unlock: { notes: ['C4','G4'], rhythm: ['quarter','eighth-pair','rest','pickup','offbeat-entry'] }, field: 'training-4', gate: 'ドとソの短い譜面を、休符や8分音符があっても流れの中で歌える' },
  { stage: 2, id: 'tonic-shape', title: 'Tonic Shape', unlock: { notes: ['C4','E4','G4'], rhythm: ['quarter'] }, field: 'training-4', gate: 'C–E–Gを一音ずつではなく、一つのshapeとして読める' },
  { stage: 3, id: 'make-the-line', title: 'Make the Line', unlock: { notes: ['B3','C4','D4','E4','F4','G4'], rhythm: ['quarter','eighth-pair'] }, field: 'training-4', gate: 'Tonic Shapeに音が加わっても、一つの線として読んで歌える' },
  { stage: 4, id: 'second-harmonic-family', title: 'Second Harmonic Family', unlock: { notes: ['A3','C4','D4','E4','F4','G4','A4','C5'], rhythm: ['quarter'], harmony: ['C','C6','Am7','Dm7'] }, field: 'training-4', gate: 'C / C6 / Am7 / Dm7で、似たshapeを五線譜から歌える' },
  { stage: 5, id: 'dominant-ii-v-i', title: 'Dominant / ii–V–I', unlock: { notes: ['C4','D4','E4','F4','G4','A4','B4'], rhythm: ['quarter','two-bar'], harmony: ['Dm7','G7','Cmaj7'] }, field: 'training-4', phraseBeats: 8, gate: '2小節の譜面を、barlineを越えて線を切らずに歌える' },
];
export const stageByNumber = stage => STAGES.find(s => s.stage === Number(stage)) || null;
export const stagesThrough = stage => STAGES.filter(s => s.stage <= Number(stage));
