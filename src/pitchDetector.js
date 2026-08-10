export function yin(buffer, sampleRate){
  const n=buffer.length;
  let mean=0; for(let i=0;i<n;i++)mean+=buffer[i]; mean/=n;
  let rms=0; const centered=new Float32Array(n);
  for(let i=0;i<n;i++){const v=buffer[i]-mean; centered[i]=v; rms+=v*v;}
  rms=Math.sqrt(rms/n);
  if(rms<0.0035)return {hz:null,rms,clarity:0};

  const half=Math.floor(n/2);
  const maxTau=Math.min(half-2,Math.ceil(sampleRate/70));
  const minTau=Math.max(2,Math.floor(sampleRate/1000));
  const diff=new Float32Array(maxTau+1);
  const cmnd=new Float32Array(maxTau+1);
  for(let tau=1;tau<=maxTau;tau++){
    let sum=0;
    const limit=n-tau;
    for(let i=0;i<limit;i++){const d=centered[i]-centered[i+tau];sum+=d*d;}
    diff[tau]=sum;
  }
  cmnd[0]=1;
  let running=0;
  for(let tau=1;tau<=maxTau;tau++){running+=diff[tau];cmnd[tau]=diff[tau]*tau/(running||1);}

  let tauEstimate=-1;
  const threshold=0.22;
  for(let tau=minTau;tau<maxTau;tau++){
    if(cmnd[tau]<threshold){
      while(tau+1<=maxTau&&cmnd[tau+1]<cmnd[tau])tau++;
      tauEstimate=tau;break;
    }
  }
  if(tauEstimate<0){
    let best=Infinity,bestTau=-1;
    for(let tau=minTau;tau<=maxTau;tau++){if(cmnd[tau]<best){best=cmnd[tau];bestTau=tau;}}
    if(bestTau<0||best>0.48)return {hz:null,rms,clarity:Math.max(0,1-best)};
    tauEstimate=bestTau;
  }

  const x0=Math.max(minTau,tauEstimate-1),x2=Math.min(maxTau,tauEstimate+1);
  const s0=cmnd[x0],s1=cmnd[tauEstimate],s2=cmnd[x2];
  const denom=2*(2*s1-s2-s0);
  const better=tauEstimate+(Math.abs(denom)>1e-9?(s2-s0)/denom:0);
  const hz=sampleRate/better;
  if(!Number.isFinite(hz)||hz<70||hz>1000)return {hz:null,rms,clarity:0};
  return {hz,rms,clarity:Math.max(0,Math.min(1,1-cmnd[tauEstimate]))};
}
export const freqToMidi=hz=>69+12*Math.log2(hz/440);
export const midiToFreq=m=>440*Math.pow(2,(m-69)/12);
export const centsBetween=(hz,midi)=>1200*Math.log2(hz/midiToFreq(midi));
export function noteNameFromHz(hz){if(!hz)return '—';const m=Math.round(freqToMidi(hz));const names=['C','C♯','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];return names[(m%12+12)%12]+(Math.floor(m/12)-1);}
