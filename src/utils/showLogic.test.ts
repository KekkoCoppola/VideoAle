import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BEAT_DURATION_MS,
  DISCO_START_MS,
  DRUMROLL_DURATION_MS,
  computeDiscoBounceState,
  computeDrumrollState,
  createConfettiBurst,
  getPhaseAtTime,
  parseShowQueryParams,
  stepConfettiParticles,
} from './showLogic';

test('getPhaseAtTime transitions cleanly from drumroll to reveal to disco', () => {
  assert.equal(getPhaseAtTime(0), 'drumroll');
  assert.equal(getPhaseAtTime(DRUMROLL_DURATION_MS - 1), 'drumroll');
  assert.equal(getPhaseAtTime(DRUMROLL_DURATION_MS), 'reveal');
  assert.equal(getPhaseAtTime(DISCO_START_MS - 1), 'reveal');
  assert.equal(getPhaseAtTime(DISCO_START_MS), 'disco');
  assert.equal(getPhaseAtTime(25000), 'disco');
});

test('getPhaseAtTime respects forcedPhase override', () => {
  assert.equal(getPhaseAtTime(0, 'disco'), 'disco');
  assert.equal(getPhaseAtTime(10000, 'reveal'), 'reveal');
});

test('parseShowQueryParams supports autostart=1 and phase overrides', () => {
  const def = parseShowQueryParams('');
  assert.equal(def.forcedPhase, null);
  assert.equal(def.initialElapsedMs, 0);

  const auto = parseShowQueryParams('?autostart=1');
  assert.equal(auto.forcedPhase, null);
  assert.equal(auto.initialElapsedMs, DISCO_START_MS);

  const reveal = parseShowQueryParams('?phase=reveal');
  assert.equal(reveal.forcedPhase, 'reveal');
  assert.equal(getPhaseAtTime(reveal.initialElapsedMs, reveal.forcedPhase), 'reveal');

  const disco = parseShowQueryParams('?phase=disco');
  assert.equal(disco.forcedPhase, 'disco');
});

test('computeDrumrollState counts down 3 -> 2 -> 1 and increases scale', () => {
  const start = computeDrumrollState(100);
  const mid = computeDrumrollState(DRUMROLL_DURATION_MS * 0.5);
  const end = computeDrumrollState(DRUMROLL_DURATION_MS - 50);

  assert.equal(start.countdown, 3);
  assert.equal(mid.countdown, 2);
  assert.equal(end.countdown, 1);
  assert.ok(end.scale > start.scale);
});

test('computeDiscoBounceState alternates photo left and right across the screen on successive beats', () => {
  const beat0Start = computeDiscoBounceState(10);
  const beat1Start = computeDiscoBounceState(BEAT_DURATION_MS + 10);

  // Beat 0 starts on the left (< 0), Beat 1 starts on the right (> 0)
  assert.ok(beat0Start.xPercent < -15, `Expected negative xPercent on beat 0, got ${beat0Start.xPercent}`);
  assert.ok(beat1Start.xPercent > 15, `Expected positive xPercent on beat 1, got ${beat1Start.xPercent}`);
  assert.notEqual(beat0Start.theme.id, beat1Start.theme.id);
});

test('createConfettiBurst and stepConfettiParticles update particle positions', () => {
  const initial = createConfettiBurst(1440, 900, 60);
  assert.equal(initial.length, 60);

  const next = stepConfettiParticles(initial, 1440, 900, true);
  assert.equal(next.length, 60);
  assert.notEqual(next[0].x, initial[0].x);
  assert.notEqual(next[0].y, initial[0].y);
});
