import fs from 'node:fs';
import {recoveryDisplayState} from './src/session/recoveryDisplay.js';

const assert=(c,m)=>{if(!c)throw new Error(m)};
const source={eventId:'f-transfer',key:'F',sourceKey:'C',keyTransfer:true,scoreModel:{key:'F',id:'f-score'}};
const echoSlot={eventId:'later-c-slot',key:'C',sourceKey:'C',keyTransfer:false,scoreModel:{key:'C',id:'c-score'}};
const events=[source,echoSlot],echoWindows=[{eventId:echoSlot.eventId,startBeat:16,endBeat:20,sourceEventId:source.eventId}];

const during=recoveryDisplayState({event:echoSlot,beat:18,echoWindows,events});
assert(during.echo&&during.event===source,'Answer Echo displays the failed source Event, not the later slot');
assert(during.event.key==='F'&&during.event.scoreModel.key==='F','transferred Answer Echo keeps F notation/key identity');
assert(during.displayToken==='echo:f-transfer','echo display has a distinct token so the normal slot can redraw afterwards');
assert(Math.abs(during.progress-.5)<1e-9,'echo playhead follows the model window');

const after=recoveryDisplayState({event:echoSlot,beat:21,echoWindows,events});
assert(!after.echo&&after.event===echoSlot&&after.displayToken==='later-c-slot','after Echo, display returns to the real later C Event');

const missingSource=recoveryDisplayState({event:echoSlot,beat:18,echoWindows,events:[echoSlot]});
assert(missingSource.event===echoSlot,'missing recovery source fails safely to the underlying slot');

const engine=fs.readFileSync(new URL('./src/session/engine.js',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('./sw.js',import.meta.url),'utf8');
assert(engine.includes('recoveryDisplayState')&&engine.includes('event: displayEvent'),'Session Engine drives view/key pill from recovery display context');
assert(sw.includes("'./src/session/recoveryDisplay.js'"),'PWA caches recovery display helper');

console.log('OK: Answer Echo audio/notation/key display stays with the failed transfer Event and returns to the scheduled slot afterwards');
