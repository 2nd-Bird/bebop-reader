export const STAGES = [
  { stage: 0, id: 'staff-anchor', title: 'Staff Anchor', unlock: { notes: ['C4','G4'], rhythm: ['quarter','half'] }, field: 'training-4', gate: 'C/G cold read stability' },
  { stage: 1, id: 'do-sol-in-time', title: 'DO / SOL in Time', unlock: { notes: ['C4','G4'], rhythm: ['quarter','eighth-pair','rest','pickup','offbeat-entry'] }, field: 'training-4', gate: 'DO/SOL phrase reading in time' },
  { stage: 2, id: 'tonic-shape', title: 'Tonic Shape', unlock: { notes: ['C4','E4','G4','C5'], rhythm: ['quarter','half'] }, field: 'training-4', gate: 'C-E-G as one visual/aural shape' },
  { stage: 3, id: 'make-the-line', title: 'Make the Line', unlock: { notes: ['B3','C4','D4','E4','F4','G4'], rhythm: ['quarter','eighth-pair','rest'] }, field: 'training-4', gate: 'read motion toward structural tones' },
  { stage: 4, id: 'chord-tones-in-time', title: 'Chord Tones in Time', unlock: { notes: ['Bb3','C4','D4','E4','F4','G4','A4','Bb4'], rhythm: ['eighth-stream'] }, field: 'training-4', gate: 'keep 7-5-3-1 / 1-3-5-b7 chord tones on the beat while passing tones fill the line' },
];
export const stageByNumber = stage => STAGES.find(s => s.stage === Number(stage)) || null;
export const stagesThrough = stage => STAGES.filter(s => s.stage <= Number(stage));
