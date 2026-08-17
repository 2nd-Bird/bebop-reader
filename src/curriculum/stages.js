export const STAGES = [
  { stage: 0, id: 'staff-anchor', title: 'Staff Anchor', unlock: { notes: ['C4','G4'], rhythm: ['quarter','half'] }, field: 'training-4', gate: 'ドとソを、拍から落ちずに初見で歌える' },
  { stage: 1, id: 'do-sol-in-time', title: 'DO / SOL in Time', unlock: { notes: ['C4','G4'], rhythm: ['quarter','eighth-pair','rest','pickup','offbeat-entry'] }, field: 'training-4', gate: 'ドとソの短い譜面を、休符や8分音符があっても流れの中で歌える' },
  { stage: 2, id: 'tonic-shape', title: 'C–E–G Shape', unlock: { notes: ['C4','E4','G4','C5'], rhythm: ['quarter','half'] }, field: 'training-4', gate: 'C–E–Gを一音ずつではなく、見慣れた形として読める' },
  { stage: 3, id: 'make-the-line', title: 'Make the Line', unlock: { notes: ['B3','C4','D4','E4','F4','G4'], rhythm: ['quarter','eighth-pair','rest'] }, field: 'training-4', gate: 'EやCへ向かう短い線を、一つの動きとして読んで歌える' },
  { stage: 4, id: 'fill-the-line', title: 'Fill the Line', unlock: { notes: ['Bb3','C4','D4','E4','F4','G4','A4','Bb4'], rhythm: ['eighth-stream'] }, field: 'training-4', gate: '上行・下降の骨格に音が増えても、拍の中で同じ流れとして読める' },
  { stage: 5, id: 'grow-the-line', title: 'Grow the Line', unlock: { notes: ['F4','G4','A4','Bb4'], rhythm: ['quarter','eighth-pair','rhythm-change'] }, field: 'training-4', gate: 'G→Fの動きに音やリズムが増えても、同じ線として初見で歌える' },
];
export const stageByNumber = stage => STAGES.find(s => s.stage === Number(stage)) || null;
export const stagesThrough = stage => STAGES.filter(s => s.stage <= Number(stage));
