# Taallam.xyz

موقع بسيط تم انشاؤه بهدف توفير محتوى تعلمي بسيط ومفيد للاطفال.
الموقع تم انشاءه بمساعدة هبة وحمزة، وهو مهدى لهم.

## Todo:
[*] add sound effects
[*] make the win overlay responsive
[*] add the win overlay to all games
[*] translate texts to arabic
[*] Add a global SFX mute/unmute toggle (Header + sfx.js support) — next priority.

[] Game ideas:
    [*]Sound Matching (audio-memory)
        Description: Play a short sound, kid chooses the matching picture from a set.
        Target skills: listening, vocabulary, language recognition.
        Contract: input = list of {id, soundUrl, imageUrl}, difficulty (count); output = correct/score, progress.
        Edge cases: missing audio file → skip and show placeholder; low bandwidth → preload/caching.
    [*]Drag-and-Drop Labeling
        Description: Drag labels (words) onto pictures (or vice versa). Immediate feedback and gentle snapping.
        Target skills: reading, vocabulary, fine motor.
        Contract: input = items {id, image, correctLabel}, level; output = attempts, correctness per item.
        Edge cases: non-droppable areas, mobile touch UX — ensure large hit targets and fallback tap-to-assign.
    [*]Sequence / Pattern Builder
        Description: Show a short visual or audio sequence, then ask the kid to reproduce it (increasing length).
        Target skills: memory, pattern recognition.
        Contract: input = pool of tiles (colors/sounds), initial length; output = pass/fail, longest streak.
        Edge cases: repeated taps / accidental double input — debounce and clear UX.
    []Sort & Categorize
        Description: Drag items into buckets (e.g., fruits vs. vegetables, big vs. small).
        Target skills: classification, vocabulary, reasoning.
        Contract: input = items with categories; output = items sorted, score/time.
        Edge cases: ambiguous items — allow “maybe” or hint after first wrong.
    []Spot-the-Difference (kid-friendly)
        Description: Show two similar images; kid taps differences. Limited hints and lives.
        Target skills: attention to detail, visual perception.
        Contract: input = pair images + differences coords; output = found count, time.
        Edge cases: tiny diffs on small screens — ensure diffs are tappable regions.
    []Letter / Number Tracing
        Description: Guided tracing over SVG strokes with real-time feedback.
        Target skills: handwriting, letter recognition, motor control.
        Contract: input = SVG path for glyph, tolerance, hints; output = completion % and strokes count.
        Edge cases: accessibility for left-handed/variable stroke order — allow forgiving detection.
    [*]Musical “Simon Says”
        Description: Sequence of colored pads that light/sound; kid repeats sequence.
        Target skills: working memory, auditory discrimination.
        Contract: input = pads {color,sound}, start length; output = streak/score.
        Edge cases: sound autoplay blocking in browsers — use user gesture to start.
    [*]Puzzle Assembly (shape jigsaw)
        Description: Drag shaped pieces to fit into silhouette; pieces snap when near.
        Target skills: spatial reasoning.
        Contract: input = silhouette + pieces, snapping threshold; output = completion time.
        Edge cases: overlapping pieces on small screens — implement zoom or scale pieces smaller.
    []Counting on a Number Line
        Description: Move character along number line to match “3+2” answers, visualizes sums.
        Target skills: basic arithmetic, number sense.
        Contract: input = problem set, number line range; output = correctness, attempts.
        Edge cases: negative numbers / out-of-range answers — constrain inputs to kid level.
    []Category Collector (timed)
        Description: Given a basket type (e.g., “fruits”), drag falling items into correct basket before time runs out.
        Target skills: quick categorization, hand-eye coordination.
        Contract: input = falling items with categories, time limit; output = score, misses.
        Edge cases: accessibility for slower kids — adjust difficulty and speed.