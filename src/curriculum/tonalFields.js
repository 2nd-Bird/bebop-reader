export const TONAL_FIELDS=[
  {
    tonalFieldId:'c-minor-melodic',
    title:'C minor · melodic-side field',
    tonic:'C',
    modeRole:'tonic-minor-melodic',
    collection:['C','D','Eb','F','G','A','B'],
    generator:'third-stack-skeleton-to-passing-filled-line',
    source:{type:'hamase',hamaseRef:'ex.241',sourcePage:198,sourceWork:'How Deep is the Ocean [take 1]',analysisRef:'Cm → F7(#11,13) → upper-structure third-stack G–B–D–F–A → passing fill → G–A–B–C–D–Eb–F–G–A',adaptation:'Internal C-tonic-minor field distilled from the verified source. The field name is not a learner scale-identification task.'}
  },
  {
    tonalFieldId:'c-minor-harmonic',
    title:'C minor · harmonic-side field',
    tonic:'C',
    modeRole:'tonic-minor-harmonic',
    collection:['C','D','Eb','F','G','Ab','B'],
    generator:'multi-bar-tonal-gravity-through-changing-baseline-harmony',
    source:{type:'hamase',hamaseRef:'ex.245',sourcePages:[200,201],sourceWork:'Bebop',analysisRef:'ex.245 preserves one F harmonic-minor field across bars 84–90 although baseline harmony and internal changes do not always coincide',adaptation:'Transposed/reduced to a comfortable C-minor field for the learner; no Parker phrase is copied and no scale-name question is shown.'}
  },
];
export const tonalFieldById=id=>TONAL_FIELDS.find(x=>x.tonalFieldId===id)||null;
