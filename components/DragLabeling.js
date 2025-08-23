'use client'
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { playSfx, preloadSfx } from '@/lib/sfx';
import { Box, Grid, Paper, Typography, Button } from '@mui/material';
import WinOverlay from './WinOverlay';

// Contract: items = [{ id, image, correctLabel, label }] level ignored for now
export default function DragLabeling({ items = [], level = 1 }) {
  const available = useMemo(() => (items || []), [items]);
  const [targets, setTargets] = useState([]); // { id, image, assignedLabel }
  const [labels, setLabels] = useState([]); // { id, text, assignedTo }
  const [attempts, setAttempts] = useState({});
  const [completed, setCompleted] = useState(false);
  const [errors, setErrors] = useState({});
  const dragItem = useRef(null);

  const init = () => {
    // init targets and labels (limit to max 6 items)
    const sample = [...available].sort(() => 0.5 - Math.random()).slice(0, 6);
    // For matching use a stable key (prefer enName, fallback to name)
    const t = sample.map(it => {
      const key = it.enName || it.name;
      return ({ key, id: key, image: it.image || '/globe.svg', correctKey: key, assigned: null, assignedText: null });
    });
    // create labels with mixed languages (ar, en, fr)
    const l = sample.map(it => {
      const key = it.enName || it.name;
      const variants = [it.name, it.enName, it.frName].filter(Boolean);
      const text = variants[Math.floor(Math.random() * variants.length)];
      return ({ id: key + '-lbl', key, text, assignedTo: null });
    });
    // shuffle labels
    for (let i = l.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [l[i], l[j]] = [l[j], l[i]];
    }
    setTargets(t);
    setLabels(l);
    setAttempts({});
    setCompleted(false);
    setErrors({});
  };

  useEffect(() => { init(); }, [items]);

  useEffect(() => {
    preloadSfx();
  }, []);

  // drag handlers
  const onDragStart = (e, labelId) => {
    dragItem.current = labelId;
    try { e.dataTransfer.setData('text/plain', labelId); } catch (e) {}
  };

  const onDropToTarget = (e, targetId) => {
    e.preventDefault();
    const labelId = dragItem.current || (e.dataTransfer && e.dataTransfer.getData('text/plain'));
    if (!labelId) return;
    assignLabelToTarget(labelId, targetId);
    dragItem.current = null;
  };

  const assignLabelToTarget = (labelId, targetId) => {
    // read current objects
    const labelObj = labels.find(l => l.id === labelId) || { key: labelId.replace(/-lbl$/, '') };
    const targetObj = targets.find(t => t.id === targetId) || { correctKey: targetId };
    const isCorrect = (labelObj.key || labelId.replace(/-lbl$/, '')) === (targetObj.correctKey || targetId);
    if (!isCorrect) {
      // wrong: increment attempts and flash error, do not assign
      setAttempts(a => ({ ...a, [targetId]: (a[targetId] || 0) + 1 }));
      setErrors(e => ({ ...e, [targetId]: true }));
  playSfx('wrong');
      setTimeout(() => setErrors(e => { const copy = { ...e }; delete copy[targetId]; return copy; }), 700);
      return;
    }

  // correct: assign target (store assignedText) and remove label from list
  const newTargets = targets.map(t => t.id === targetId ? { ...t, assigned: labelId, assignedText: labelObj.text } : t);
  setTargets(newTargets);
  setLabels(prev => prev.filter(l => l.id !== labelId));
    setAttempts(a => ({ ...a, [targetId]: a[targetId] || 0 }));
  playSfx('correct');

    // completion check
  const allAssigned = newTargets.every(t => !!t.assigned);
    if (allAssigned) setCompleted(true);
  if (allAssigned) playSfx('win');
  };

  // touch / tap fallback: tap label then tap target to assign
  const selectedLabel = useRef(null);
  const onLabelTap = (labelId) => {
    selectedLabel.current = labelId;
  };
  const onTargetTap = (targetId) => {
    if (selectedLabel.current) {
      assignLabelToTarget(selectedLabel.current, targetId);
      selectedLabel.current = null;
    }
  };

  const reset = () => {
  playSfx('click');
  init();
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Paper sx={{ width: '100%', maxWidth: 960, p: 3, position: 'relative' }}>
  <Typography variant="h5" sx={{ mb: 2 }}>سحب وإفلات التسميات</Typography>
  <Typography variant="body2" sx={{ mb: 2 }}>اسحب التسميات وأفلتها على الصورة المطابقة. على الأجهزة اللمسية، انقر على التسمية ثم انقر على الصورة.</Typography>

        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
              {labels.map(l => {
                // count errors for this label key by summing attempts on targets with same key
                const errorsCount = Object.keys(attempts).reduce((acc, tid) => {
                  const tgt = targets.find(t => t.id === tid);
                  if (tgt && tgt.id === tgt.key && tgt.id === l.key) return acc + (attempts[tid] || 0);
                  // if target key matches label key
                  if (tgt && (tgt.key === l.key)) return acc + (attempts[tid] || 0);
                  return acc;
                }, 0);
                return (
                  <Box key={l.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ fontSize: 12, color: 'error.main', minHeight: 16 }}>{errorsCount > 0 ? `✖ ${errorsCount}` : ''}</Box>
                    <Paper
                      draggable
                      onDragStart={(e) => onDragStart(e, l.id)}
                      onClick={() => onLabelTap(l.id)}
                      sx={{ p: 1, px: 2, cursor: 'grab', display: 'inline-flex', alignItems: 'center' }}
                    >
                      <Typography>{l.text}</Typography>
                    </Paper>
                  </Box>
                );
              })}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={2} justifyContent="center">
              {targets.map(t => (
                <Grid item xs={6} sm={4} md={3} key={t.id}>
                  <Paper
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onDropToTarget(e, t.id)}
                    onClick={() => onTargetTap(t.id)}
                    sx={{ p: 1, textAlign: 'center', minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Box sx={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box component="img" src={t.image} alt={t.id} sx={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 1, border: errors[t.id] ? '2px solid rgba(220,53,69,0.9)' : 'none' }} />
                      <Box sx={{ height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {t.assigned ? (
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.assignedText}</Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">أضف التسمية</Typography>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item xs={12} sx={{ textAlign: 'center', mt: 1 }}>
            <Button variant="contained" onClick={reset}>إعادة اللعب</Button>
          </Grid>
        </Grid>
        {completed && (
          <WinOverlay moves={Object.values(attempts).reduce((a,b)=>a+b,0) || 0} errors={Object.keys(errors).length} onPlayAgain={reset} />
        )}
      </Paper>
    </Box>
  );
}

