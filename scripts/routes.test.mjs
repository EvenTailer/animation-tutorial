import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COURSE_COUNTS,
  ANIMATION_COUNTS,
  drawPath,
  animationPath,
  lessonPath,
} from '../src/routing/paths.js';
import {masterclasses} from '../src/data/masterclasses.js';
import {weeks} from '../src/data/curriculum.js';

test('default entry points use visible step/frame 1',()=>{
  assert.equal(drawPath(),'/draw/duck/1');
  assert.equal(animationPath(),'/animation/idle/1');
  assert.equal(lessonPath(),'/lesson/w1-l1');
});

test('drawing URLs cover both complete courses without off-by-one errors',()=>{
  assert.equal(drawPath('duck',0),'/draw/duck/1');
  assert.equal(drawPath('duck',11),'/draw/duck/12');
  assert.equal(drawPath('duck',12),'/draw/duck/13');
  assert.equal(drawPath('duck',59),'/draw/duck/60');
  assert.equal(drawPath('boss',0),'/draw/boss/1');
  assert.equal(drawPath('boss',35),'/draw/boss/36');
  assert.throws(()=>drawPath('duck',60),RangeError);
  assert.throws(()=>drawPath('boss',36),RangeError);
});

test('URL course limits agree with the actual curriculum, not an obsolete 18/12-step course',()=>{
  assert.deepEqual(COURSE_COUNTS,{duck:60,boss:36});
  assert.deepEqual(masterclasses.map(c=>c.id).sort(),['boss','duck']);
  for(const c of masterclasses){
    const actual=c.chapters.flatMap(ch=>ch.steps).length;
    assert.equal(COURSE_COUNTS[c.id],actual,`${c.id} route limit must cover its real steps`);
    assert.doesNotThrow(()=>drawPath(c.id,actual-1));
    assert.throws(()=>drawPath(c.id,actual),RangeError);
  }
});

test('all animation routes use the correct full sequence length',()=>{
  assert.deepEqual(ANIMATION_COUNTS,{idle:4,run:6,jump:6,hit:6});
  assert.equal(animationPath('idle',3),'/animation/idle/4');
  assert.equal(animationPath('run',5),'/animation/run/6');
  assert.equal(animationPath('jump',5),'/animation/jump/6');
  assert.equal(animationPath('hit',5),'/animation/hit/6');
  for(const [type,count] of Object.entries(ANIMATION_COUNTS)){
    assert.throws(()=>animationPath(type,count),RangeError,`${type} must reject frame after its last frame`);
  }
});

test('indices must be finite integers: no coercion, rounding or silent clamping',()=>{
  const invalid=[-1,-100,0.1,1.5,NaN,Infinity,-Infinity,'0','1',null,true,{},[]];
  for(const index of invalid){
    assert.throws(()=>drawPath('duck',index),RangeError);
    assert.throws(()=>animationPath('run',index),RangeError);
  }
  assert.equal(drawPath('duck',undefined),'/draw/duck/1');
  assert.equal(animationPath('run',undefined),'/animation/run/1');
});

test('unknown characters, aliases and path injection never become drawing URLs',()=>{
  for(const character of ['wolf','Duck','','constructor','__proto__','toString','../duck','duck/2','duck?step=2',null]){
    assert.throws(()=>drawPath(character,0),TypeError);
  }
});

test('unknown motion names and inherited object keys never become animation URLs',()=>{
  for(const type of ['ball','Run','','constructor','__proto__','toString','../run','run/2','run#2',null]){
    assert.throws(()=>animationPath(type,0),TypeError);
  }
});

test('all 30 published exercises have unique valid lesson URLs',()=>{
  const ids=weeks.flatMap(w=>w.lessons.map(l=>l.id));
  assert.equal(ids.length,30);
  assert.equal(new Set(ids).size,30);
  assert.equal(lessonPath('w1-l1'),'/lesson/w1-l1');
  assert.equal(lessonPath('w10-l3'),'/lesson/w10-l3');
  for(const id of ids)assert.equal(lessonPath(id),`/lesson/${id}`);
});

test('lesson URLs reject impossible weeks, lesson numbers and mixed path/query input',()=>{
  for(const id of ['w0-l1','w11-l1','w01-l1','w1-l0','w1-l4','w10-l4','w1-l01','W1-l1','w1-L1','',' w1-l1','w1-l1 ','w1-l1\n','w1-l1/extra','w1-l1?from=draw','../w1-l1',null,1,{},[]]){
    assert.throws(()=>lessonPath(id),TypeError,`invalid lesson ${String(id)}`);
  }
});
