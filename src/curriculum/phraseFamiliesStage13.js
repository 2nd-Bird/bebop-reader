export const STAGE13_PHRASE_FAMILIES=[
  {
    familyId:'density-g-to-f',
    title:'G → F · More Notes, Same Move',
    stage:13,
    structure:'the already-known structural G→F cell remains identifiable while the surface is densified inside a fixed span or extended by reinterpreting a cell exit as the next entry; BPM remains an independent axis',
    invariant:'structural G→F cell identity remains identifiable while density or continuation transforms change the surface at a held BPM',
    structuralTargets:['G','F'],
    line:['G','F'],
    cells:[['G','F']],
    harmonyRoles:['pedagogical G7 structural cell'],
    variants:['density-gf-seed','density-gf-arpeggio','density-gf-scalar','density-gf-chromatic','density-gf-double','density-gf-restart'],
    source:{
      type:'hamase',
      hamaseRef:'ex.267',
      hamaseRefs:['ex.267','ex.268'],
      sourcePage:232,
      sourcePages:[232,233],
      sourceWork:'Ballade',
      operatorSources:[
        {hamaseRef:'ex.267',sourcePage:232,role:'DENSITY_EXPANSION',sourceHarmony:'Gm7b5 (= Bbm6) 1→7 within Eb7(#11,13)',analysis:'a structural g→f cell is expanded by arpeggiation, passing-tone scalarization and chromaticization'},
        {hamaseRef:'ex.268',sourcePage:233,role:'CELL_RESTART_EXTENSION',sourceHarmony:'G7(#11,13) Relative Major FMaj7(#11)',analysis:'the preceding exit notes are reinterpreted as a double-appoggiatura entry and the same Relative Major is restarted to extend the phrase'}
      ],
      analysisRef:'ex.267 supplies the within-cell density-expansion operator; ex.268 supplies a distinct exit→next-entry→restart operator',
      pedagogicalApplication:'Apply the verified operators to the already-known C-key/G7 structural G→F cell. This is not a transcription, simplification of the Ballade surface, or preservation of ex.267/ex.268 source harmony.',
      adaptation:'C-key/G7 pedagogical application of verified operators. Surface boundaries and phrase length are allowed to change when the declared structural G→F identity remains traceable.'
    }
  }
];
