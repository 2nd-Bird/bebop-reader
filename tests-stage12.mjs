import {STAGES} from './src/curriculum/stages.js';
import {familyById} from './src/curriculum/phraseFamilies.js';
import {STAGE12_VARIANTS,stage12VariantById} from './src/curriculum/variantsStage12.js';
import {variantById,VARIANTS} from './src/curriculum/variantRegistry.js';
import {TONAL_FIELDS,tonalFieldById} from './src/curriculum/tonalFields.js';
import {harmonyFieldById} from './src/curriculum/harmonyFields.js';
import {validateCurriculum} from './src/curriculum/validate.js';
import {buildDailySessionPlan} from './src/curriculum/scheduler.js';
import {createTimeline} from './src/session/timeline.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};
const pitches=id=>variantById(id).notes.filter(n=>!n.rest).map(n=>n.pitch);
const pc=pitch=>String(pitch).match(/^([A-G](?:b|#)?)/)?.[1]||null;
const endBeat=id=>Math.max(...variantById(id).notes.map(n=>n.startBeat+n.duration));

assert(validateCurriculum(),'Stage 12 curriculum validates');
const stage=STAGES.find(s=>s.stage===12),melodic=familyById('tonic-minor-melodic-field'),harmonic=familyById('tonic-minor-harmonic-field');
assert(stage?.id==='tonic-minor-tonal-field'&&stage.title==='Tonic Minor / Tonal Field','Stage 12 roadmap entry');
assert(stage.field==='phrase-8','Stage 12 remains a multi-bar musical field');
assert(stage.unlock.tonalFields.join(',')==='c-minor-melodic,c-minor-harmonic','Stage 12 unlocks two internal tonal fields');
assert(stage.unlock.notes.includes('Eb4')&&stage.unlock.notes.includes('G3'),'new minor-field notes unlock only when the generated material needs them');
assert(!stage.unlock.notes.includes('Eb5'),'Stage 12 does not front-load an arbitrary full-range minor scale');

const melodicField=tonalFieldById('c-minor-melodic'),harmonicField=tonalFieldById('c-minor-harmonic');
assert(TONAL_FIELDS.length===2,'Stage 12 introduces exactly two Tonal Field primitives');
assert(melodicField.collection.join(',')==='C,D,Eb,F,G,A,B','melodic-side collection');
assert(harmonicField.collection.join(',')==='C,D,Eb,F,G,Ab,B','harmonic-side collection');
assert(melodicField.source.hamaseRef==='ex.241'&&melodicField.source.sourcePage===198,'ex.241 prepared-page traceability');
assert(harmonicField.source.hamaseRef==='ex.245'&&harmonicField.source.sourcePages.join(',')==='200,201','ex.245 prepared-page traceability');
assert(melodicField.source.adaptation&&harmonicField.source.adaptation,'Tonal Fields declare pedagogical adaptation');

assert(melodic?.invariant==='G–B–D–F–A skeleton remains embedded at indices 0/2/4/6/8 after filling','melodic family invariant is explicit');
assert(melodic.source.hamaseRef==='ex.241'&&melodic.source.sourcePage===198,'melodic family source');
const skeleton=pitches('tm-melodic-skeleton'),filled=pitches('tm-melodic-filled');
assert(skeleton.join(',')==='G3,B3,D4,F4,A4','verified third-stack skeleton');
assert(filled.join(',')==='G3,A3,B3,C4,D4,Eb4,F4,G4,A4','gaps fill into source-derived C minor line');
assert([0,2,4,6,8].map(i=>filled[i]).join(',')===skeleton.join(','),'filled surface preserves every skeleton tone in order');
assert(stage12VariantById('tm-melodic-filled').morphType==='INSERT'&&stage12VariantById('tm-melodic-filled').morphTargets.join(',')==='1,3,5,7','Phrase Morph highlights only inserted gap tones');
assert(endBeat('tm-melodic-skeleton')===8&&endBeat('tm-melodic-filled')===8,'skeleton and filled line remain two-bar phrases');
assert(filled.map(pc).every(x=>melodicField.collection.includes(x)),'filled line stays inside melodic-side Tonal Field');

assert(harmonic?.invariant==='C harmonic-minor tonal gravity persists across changing baseline harmony','harmonic family invariant is explicit');
assert(harmonic.source.hamaseRef==='ex.245'&&harmonic.source.sourcePages.join(',')==='200,201','harmonic family source');
const h2=pitches('tm-harmonic-2bar'),h4=pitches('tm-harmonic-4bar');
assert(h2.join(',')==='F4,Eb4,D4,C4,B3,Ab3,G3','2-bar line is the interval-preserving C transposition of the verified source segment');
assert(endBeat('tm-harmonic-2bar')===8&&endBeat('tm-harmonic-4bar')===16,'harmonic field grows two bars → four bars');
assert(h4.slice(0,h2.length).join(',')===h2.join(','),'4-bar field extends rather than replaces the known opening');
assert(h4.map(pc).every(x=>harmonicField.collection.includes(x)),'every 4-bar pitch remains inside one C harmonic-minor Tonal Field');
assert(h4.at(-1)==='C4','pedagogical continuation resolves back toward C tonic gravity');

const h2Field=harmonyFieldById('c-minor-harmonic-2bar'),h4Field=harmonyFieldById('c-minor-harmonic-4bar');
assert(h2Field.timeline.map(x=>`${x.beat}:${x.chord}`).join(',')==='0:Dm7b5,2:G7,4:Cm','2-bar baseline changes while Tonal Field stays fixed');
assert(h4Field.timeline.map(x=>`${x.beat}:${x.chord}`).join(',')==='0:Dm7b5,2:G7,4:Cm,8:Dm7b5,10:G7,12:Cm','4-bar baseline cycles inside one field');

assert(STAGE12_VARIANTS.every(v=>!('tonalFieldId' in v)&&!('harmonyFieldId' in v)&&!('harmonyTimeline' in v)),'Stage 12 Variants own neither Tonal nor Harmony Field assignment');
assert(VARIANTS.filter(v=>v.familyId.startsWith('tonic-minor-')).length===4,'aggregate Variant registry exposes all Stage 12 variants');

const plan=buildDailySessionPlan({currentStage:12,eventCount:20,targetSessionBeats:320});
assert(plan.focusFamilyIds.join(',')==='tonic-minor-melodic-field,tonic-minor-harmonic-field','Stage 12 focuses both generated tonal-field experiences');
assert(plan.form==='phrase-8','Stage 12 session stays in Phrase 8 world');
createTimeline(plan).validate();
const melodicEvents=plan.events.filter(e=>e.familyId===melodic.familyId),harmonicEvents=plan.events.filter(e=>e.familyId===harmonic.familyId);
assert(melodicEvents[0].variantId==='tm-melodic-skeleton'&&melodicEvents[0].tonalFieldId==='c-minor-melodic'&&melodicEvents[0].harmonyFieldId==='static-cm','melodic family starts from skeleton inside Cm field');
assert(melodicEvents.some(e=>e.variantId==='tm-melodic-filled'&&e.presentationMode==='BUILD'&&e.tonalFieldId==='c-minor-melodic'),'filled line grows without changing Tonal Field');
assert(harmonicEvents[0].variantId==='tm-harmonic-2bar'&&harmonicEvents[0].tonalFieldId==='c-minor-harmonic','harmonic family enters one persistent Tonal Field');
const harmonicGrow=harmonicEvents.find(e=>e.variantId==='tm-harmonic-4bar'&&e.presentationMode==='BUILD');
assert(harmonicGrow?.fieldBeats===32&&harmonicGrow.singEndBeat-harmonicGrow.singStartBeat===16,'four-bar tonal-field phrase uses Phrase 8 Learning Event');
assert(harmonicGrow.tonalFieldId==='c-minor-harmonic','Tonal Field ID remains constant across the whole four-bar phrase');
assert(new Set(harmonicGrow.harmonyTimeline.map(x=>x.chord)).size===3,'baseline harmony changes multiple times inside the fixed Tonal Field');
assert(plan.events.every(e=>!('scaleQuestion' in e)&&!('tonalFieldQuestion' in e)&&!('modeQuestion' in e)),'Melodic/Harmonic Minor naming never becomes a learner theory task');

console.log('OK: Stage 12 derives minor surfaces from structure and preserves one internal Tonal Field across changing multi-bar harmony');
