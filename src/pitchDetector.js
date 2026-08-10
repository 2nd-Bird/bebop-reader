export function yin(buffer, sampleRate){
  const n=buffer.length; const half=Math.floor(n/2); const diff=new Float32Array(half); const cmnd=new Float32Array(half);
  let rms=0; for(let i=0;i<n;i++)rms+=buffer[i]*buffer[i]; rms=Math.sqrt(rms/n); if(rms<0.012)return {hz:null,rms,clarity:0};
  for(let tau=1;tau<half;tau++){let sum=0;for(let i=0;i<half;i++){const d=buffer[i]-buffer[i+tau];sum+=d*d;}diff[tau]=sum;}
  cmnd[0]=1; let running=0; let tauEstimate=-1;
  for(let tau=1;tau<half;tau++){running+=diff[tau]; cmnd[tau]=diff[tau]*tau/(running||1);}
  for(let tau=3;tau<half-1;tau++){if(cmnd[tau]<0.13){while(tau+1<half && cmnd[tau+1]<cmnd[tau])tau++;tauEstimate=tau;break;}}
  if(tauEstimate<0)return {hz:null,rms,clarity:0};
  const x0=tauEstimate>1?tauEstimate-1:tauEstimate, x2=tauEstimate+1<half?tauEstimate+1:tauEstimate;
  const s0=cmnd[x0],s1=cmnd[tauEstimate],s2=cmnd[x2];
  const better=tauEstimate + (s2-s0)/(2*(2*s1-s2-s0)||1); const hz=sampleRate/better;
  if(hz<70||hz>1000)return {hz:null,rms,clarity:0};
  return {hz,rms,clarity:Math.max(0,1-cmnd[tauEstimate])};
}
export const freqToMidi=hz=>69+12*Math.log2(hz/440);
export const midiToFreq=m=>440*Math.pow(2,(m-69)/12);
export const centsBetween=(hz,midi)=>1200*Math.log2(hz/midiToFreq(midi));
export function noteNameFromHz(hz){if(!hz)return '—';const m=Math.round(freqToMidi(hz));const names=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];return names[(m%12+12)%12]+(Math.floor(m/12)-1);}
