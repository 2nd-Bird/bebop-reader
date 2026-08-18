import {
  cBluesRepeatReady,
  cBluesMutationReady,
  cBluesConnectReady,
  cBluesTradeReady,
  cBluesRecallReady,
  cBluesOneChorusReady,
} from './mastery.js';

export function nextCBluesFlowAction(familyMastery = {}) {
  if (!cBluesRepeatReady(familyMastery)) return 'REPEAT';
  if (!cBluesMutationReady(familyMastery)) return 'MUTATION';
  if (!cBluesConnectReady(familyMastery)) return 'CONNECT';
  if (!cBluesTradeReady(familyMastery)) return 'TRADE';
  if (!cBluesRecallReady(familyMastery)) return 'RECALL';
  if (!cBluesOneChorusReady(familyMastery)) return 'ONE_CHORUS';
  return null;
}
