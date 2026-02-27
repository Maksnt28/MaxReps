-- Exercise Library Expansion: 53 → 206 exercises
-- Adds movement_pattern column, backfills existing exercises, inserts 153 new exercises
-- Two new muscle groups: traps, forearms

-- ============================================================================
-- 1. ADD movement_pattern COLUMN
-- ============================================================================
ALTER TABLE public.exercises ADD COLUMN movement_pattern text;

-- ============================================================================
-- 2. BACKFILL movement_pattern ON EXISTING 53 EXERCISES
-- ============================================================================

-- PUSH (11)
UPDATE public.exercises SET movement_pattern = 'push' WHERE name_en IN (
  'Barbell Bench Press',
  'Dumbbell Incline Press',
  'Machine Chest Press',
  'Push-Up',
  'Barbell Overhead Press',
  'Machine Shoulder Press',
  'Pike Push-Up',
  'Band Shoulder Press',
  'Barbell Close-Grip Bench Press',
  'Diamond Push-Up',
  'Machine Tricep Dip'
);

-- PULL (12)
UPDATE public.exercises SET movement_pattern = 'pull' WHERE name_en IN (
  'Barbell Bent-Over Row',
  'Dumbbell Single-Arm Row',
  'Cable Lat Pulldown',
  'Pull-Up',
  'Machine Seated Row',
  'Band Pull-Apart',
  'Barbell Curl',
  'Dumbbell Hammer Curl',
  'Cable Bicep Curl',
  'Chin-Up',
  'Band Bicep Curl',
  'Cable Face Pull'
);

-- HINGE (6)
UPDATE public.exercises SET movement_pattern = 'hinge' WHERE name_en IN (
  'Barbell Romanian Deadlift',
  'Dumbbell Stiff-Leg Deadlift',
  'Kettlebell Swing',
  'Barbell Hip Thrust',
  'Cable Pull-Through',
  'Kettlebell Sumo Deadlift'
);

-- SQUAT (7)
UPDATE public.exercises SET movement_pattern = 'squat' WHERE name_en IN (
  'Barbell Back Squat',
  'Dumbbell Goblet Squat',
  'Leg Press',
  'Bodyweight Squat',
  'Cable Goblet Squat',
  'Band Squat',
  'Dumbbell Bulgarian Split Squat'
);

-- ROTATION (2)
UPDATE public.exercises SET movement_pattern = 'rotation' WHERE name_en IN (
  'Cable Woodchop',
  'Dumbbell Russian Twist'
);

-- ISOLATION (15)
UPDATE public.exercises SET movement_pattern = 'isolation' WHERE name_en IN (
  'Cable Fly',
  'Banded Chest Fly',
  'Dumbbell Lateral Raise',
  'Dumbbell Overhead Tricep Extension',
  'Cable Tricep Pushdown',
  'Machine Lying Leg Curl',
  'Band Leg Curl',
  'Glute Bridge',
  'Barbell Standing Calf Raise',
  'Machine Seated Calf Raise',
  'Bodyweight Single-Leg Calf Raise',
  'Plank',
  'Band Pallof Press',
  'Hanging Leg Raise',
  'Machine Crunch'
);

-- ============================================================================
-- 3. INSERT NEW EXERCISES (153 total)
-- ============================================================================

-- ============================================================================
-- CHEST (+12 new)
-- ============================================================================
INSERT INTO public.exercises (name_en, name_fr, muscle_primary, muscle_secondary, equipment, category, cues_en, cues_fr, difficulty, movement_pattern) VALUES
('Barbell Decline Bench Press', 'Développé décliné barre', 'chest', '{triceps,shoulders}', 'barbell', 'compound', 'Set bench to 15-30° decline. Unrack bar, lower to lower chest. Press up in a slight arc.', 'Réglez le banc en décliné 15-30°. Descendez la barre vers le bas de la poitrine. Poussez en arc léger.', 'intermediate', 'push'),
('Dumbbell Flat Bench Press', 'Développé couché haltères', 'chest', '{triceps,shoulders}', 'dumbbell', 'compound', 'Lie flat, press dumbbells from chest level. Squeeze at top, control the descent.', 'Allongé à plat, poussez les haltères depuis la poitrine. Contractez en haut, contrôlez la descente.', 'beginner', 'push'),
('Dumbbell Decline Press', 'Développé décliné haltères', 'chest', '{triceps,shoulders}', 'dumbbell', 'compound', 'Set bench to slight decline. Press dumbbells up from lower chest. Squeeze pecs at top.', 'Banc légèrement décliné. Poussez les haltères depuis le bas de la poitrine. Contractez en haut.', 'intermediate', 'push'),
('Dumbbell Fly', 'Écarté haltères', 'chest', '{}', 'dumbbell', 'isolation', 'Lie flat, slight bend in elbows. Lower dumbbells in wide arc until chest stretch. Squeeze back together.', 'Allongé, légère flexion des coudes. Descendez en arc large. Contractez pour remonter.', 'beginner', 'isolation'),
('Cable Crossover Low-to-High', 'Croisé poulie bas vers haut', 'chest', '{shoulders}', 'cable', 'isolation', 'Low pulleys, step forward. Bring handles up and together at chest height. Squeeze upper chest.', 'Poulies basses, avancez d''un pas. Remontez les poignées à hauteur de poitrine. Contractez le haut des pectoraux.', 'intermediate', 'isolation'),
('Cable Crossover High-to-Low', 'Croisé poulie haut vers bas', 'chest', '{}', 'cable', 'isolation', 'High pulleys, lean slightly forward. Bring handles down and together. Squeeze lower chest.', 'Poulies hautes, penchez-vous légèrement. Descendez les poignées et rapprochez-les. Contractez le bas des pectoraux.', 'intermediate', 'isolation'),
('Machine Pec Deck', 'Pec deck machine', 'chest', '{}', 'machine', 'isolation', 'Adjust seat so handles align with chest. Bring pads together, squeeze pecs. Slow return.', 'Ajustez le siège pour aligner les poignées avec la poitrine. Rapprochez les pads, contractez. Retour lent.', 'beginner', 'isolation'),
('Weighted Dip', 'Dips lestés', 'chest', '{triceps,shoulders}', 'bodyweight', 'compound', 'Lean forward slightly for chest emphasis. Lower until upper arms are parallel. Press back up. Start with bodyweight to master form.', 'Penchez-vous légèrement en avant. Descendez jusqu''à ce que les bras soient parallèles. Remontez. Commencez au poids du corps.', 'advanced', 'push'),
('Kettlebell Floor Press', 'Développé au sol kettlebell', 'chest', '{triceps}', 'kettlebell', 'compound', 'Lie on floor, kettlebell in one hand. Press up, lock out. Lower until elbow touches floor.', 'Allongé au sol, kettlebell en main. Poussez, verrouillez. Descendez jusqu''à ce que le coude touche le sol.', 'beginner', 'push'),
('Band Push-Up', 'Pompes avec bande', 'chest', '{triceps,shoulders}', 'bands', 'compound', 'Loop band across upper back, hold ends under hands. Perform push-up against band resistance.', 'Passez la bande sur le haut du dos, tenez les extrémités sous les mains. Faites des pompes contre la résistance.', 'beginner', 'push'),
('Smith Machine Bench Press', 'Développé couché Smith machine', 'chest', '{triceps,shoulders}', 'machine', 'compound', 'Lie on bench under Smith bar. Unrack, lower to mid-chest. Press up along the fixed path.', 'Allongé sous la barre Smith. Descendez vers la poitrine. Poussez le long du rail fixe.', 'beginner', 'push'),
('Typewriter Push-Up', 'Pompes machine à écrire', 'chest', '{triceps,shoulders}', 'bodyweight', 'compound', 'Wide hand placement. Lower to one side, slide across to the other. Requires significant chest and shoulder strength.', 'Mains écartées. Descendez d''un côté, glissez vers l''autre. Demande une force importante.', 'advanced', 'push');

-- ============================================================================
-- BACK (+14 new)
-- ============================================================================
INSERT INTO public.exercises (name_en, name_fr, muscle_primary, muscle_secondary, equipment, category, cues_en, cues_fr, difficulty, movement_pattern) VALUES
('Barbell Deadlift', 'Soulevé de terre barre', 'back', '{glutes,hamstrings,quads}', 'barbell', 'compound', 'Feet hip-width, grip just outside legs. Brace core, push floor away. Lock out hips at top. Keep bar close.', 'Pieds largeur de hanches, prise juste en dehors des jambes. Gainez, poussez le sol. Verrouillez les hanches en haut.', 'intermediate', 'hinge'),
('Barbell Pendlay Row', 'Rowing Pendlay barre', 'back', '{biceps}', 'barbell', 'compound', 'Bar on floor each rep. Flat back, explosive pull to lower chest. Lower with control to floor.', 'Barre au sol à chaque répétition. Dos plat, tirage explosif vers le bas de la poitrine. Reposez avec contrôle.', 'intermediate', 'pull'),
('Barbell T-Bar Row', 'Rowing T-bar', 'back', '{biceps}', 'barbell', 'compound', 'Straddle bar, close grip handle. Pull toward chest, squeeze back. Lower with control.', 'Enjambez la barre, prise serrée. Tirez vers la poitrine, contractez le dos. Descendez avec contrôle.', 'intermediate', 'pull'),
('Dumbbell Chest-Supported Row', 'Rowing haltère poitrine appuyée', 'back', '{biceps}', 'dumbbell', 'compound', 'Lie face down on incline bench. Row dumbbells to hips, squeeze shoulder blades. Eliminates momentum.', 'Allongé face contre banc incliné. Tirez les haltères vers les hanches, serrez les omoplates. Élimine l''élan.', 'beginner', 'pull'),
('Dumbbell Pullover', 'Pull-over haltère', 'back', '{chest}', 'dumbbell', 'compound', 'Lie across bench, dumbbell overhead. Lower behind head with slight elbow bend. Pull back over chest.', 'Allongé en travers du banc, haltère au-dessus. Descendez derrière la tête. Ramenez au-dessus de la poitrine.', 'intermediate', 'pull'),
('Cable Seated Row Close-Grip', 'Rowing assis poulie prise serrée', 'back', '{biceps}', 'cable', 'compound', 'Sit tall, close-grip handle. Pull to lower chest, squeeze shoulder blades. Slow return.', 'Assis droit, prise serrée. Tirez vers le bas de la poitrine, serrez les omoplates. Retour lent.', 'beginner', 'pull'),
('Cable Straight-Arm Pulldown', 'Tirage bras tendus poulie', 'back', '{}', 'cable', 'isolation', 'High pulley, straight arms. Pull bar down to thighs, squeezing lats. Control the return.', 'Poulie haute, bras tendus. Tirez la barre vers les cuisses en contractant les dorsaux. Contrôlez le retour.', 'intermediate', 'isolation'),
('Machine Lat Pulldown Close-Grip', 'Tirage vertical prise serrée machine', 'back', '{biceps}', 'machine', 'compound', 'Close-grip handle, lean back slightly. Pull to upper chest, squeeze lats. Control the return.', 'Prise serrée, penchez-vous légèrement. Tirez vers le haut de la poitrine, contractez les dorsaux. Retour contrôlé.', 'beginner', 'pull'),
('Machine Assisted Pull-Up', 'Traction assistée machine', 'back', '{biceps}', 'machine', 'compound', 'Select counterweight. Overhand grip, pull chin over bar. Control the descent.', 'Sélectionnez le contrepoids. Prise pronation, tirez le menton au-dessus de la barre. Descendez avec contrôle.', 'beginner', 'pull'),
('Inverted Row', 'Rowing inversé', 'back', '{biceps}', 'bodyweight', 'compound', 'Hang under a bar, body straight. Pull chest to bar, squeeze shoulder blades. Lower with control.', 'Suspendu sous une barre, corps droit. Tirez la poitrine vers la barre, serrez les omoplates. Descendez avec contrôle.', 'beginner', 'pull'),
('Band Lat Pulldown', 'Tirage vertical avec bande', 'back', '{biceps}', 'bands', 'compound', 'Anchor band overhead. Kneel or sit, pull band down to chest. Squeeze lats at bottom.', 'Ancrez la bande en hauteur. À genoux ou assis, tirez vers la poitrine. Contractez les dorsaux en bas.', 'beginner', 'pull'),
('Kettlebell Gorilla Row', 'Rowing gorille kettlebell', 'back', '{biceps}', 'kettlebell', 'compound', 'Wide stance over two kettlebells. Row one while stabilizing with the other. Alternate sides.', 'Position large au-dessus de deux kettlebells. Tirez un pendant que l''autre stabilise. Alternez.', 'intermediate', 'pull'),
('Kettlebell Single-Arm Row', 'Rowing unilatéral kettlebell', 'back', '{biceps}', 'kettlebell', 'compound', 'Hinge at hips, one hand on support. Row kettlebell to hip, elbow close to body. Squeeze lat.', 'Penché, une main en appui. Tirez le kettlebell vers la hanche, coude au corps. Contractez le dorsal.', 'beginner', 'pull'),
('Archer Pull-Up', 'Traction archer', 'back', '{biceps}', 'bodyweight', 'compound', 'Wide grip. Pull toward one hand while the other arm extends. Alternate sides. Requires significant pulling strength.', 'Prise large. Tirez vers une main pendant que l''autre bras s''étend. Alternez. Demande une force importante.', 'advanced', 'pull');

-- ============================================================================
-- SHOULDERS (+12 new)
-- ============================================================================
INSERT INTO public.exercises (name_en, name_fr, muscle_primary, muscle_secondary, equipment, category, cues_en, cues_fr, difficulty, movement_pattern) VALUES
('Barbell Push Press', 'Push press barre', 'shoulders', '{triceps}', 'barbell', 'compound', 'Bar at collarbone. Slight knee dip, then drive bar overhead explosively. Lock out at top.', 'Barre aux clavicules. Légère flexion des genoux, puis poussez explossivement. Verrouillez en haut.', 'intermediate', 'push'),
('Dumbbell Arnold Press', 'Arnold press haltères', 'shoulders', '{triceps}', 'dumbbell', 'compound', 'Start with palms facing you at shoulder height. Rotate palms outward as you press overhead.', 'Commencez paumes vers vous à hauteur des épaules. Tournez les paumes vers l''extérieur en poussant.', 'intermediate', 'push'),
('Dumbbell Seated Overhead Press', 'Développé militaire assis haltères', 'shoulders', '{triceps}', 'dumbbell', 'compound', 'Sit with back support. Press dumbbells from shoulder height to overhead. Control the descent.', 'Assis avec support dorsal. Poussez les haltères depuis les épaules. Contrôlez la descente.', 'beginner', 'push'),
('Dumbbell Front Raise', 'Élévation frontale haltères', 'shoulders', '{}', 'dumbbell', 'isolation', 'Arms at sides, palms facing thighs. Raise one or both dumbbells to shoulder height. Lower with control.', 'Bras le long du corps, paumes vers les cuisses. Montez à hauteur d''épaules. Descendez avec contrôle.', 'beginner', 'isolation'),
('Dumbbell Rear Delt Fly', 'Oiseau haltères', 'shoulders', '{back}', 'dumbbell', 'isolation', 'Hinge forward, arms hanging. Raise dumbbells out to sides, squeeze rear delts. Lower with control.', 'Penché en avant, bras pendants. Montez les haltères sur les côtés, contractez. Descendez avec contrôle.', 'beginner', 'isolation'),
('Cable Lateral Raise', 'Élévation latérale poulie', 'shoulders', '{}', 'cable', 'isolation', 'Low pulley, stand sideways. Raise arm to shoulder height, lead with elbow. Slow negative.', 'Poulie basse, de côté. Montez le bras à hauteur d''épaule, coude en premier. Négatif lent.', 'beginner', 'isolation'),
('Cable Reverse Fly', 'Oiseau inversé poulie', 'shoulders', '{back}', 'cable', 'isolation', 'Cross cables at high position. Pull handles apart at shoulder height. Squeeze rear delts.', 'Croisez les câbles en position haute. Écartez les poignées à hauteur d''épaules. Contractez les deltoïdes postérieurs.', 'beginner', 'isolation'),
('Machine Reverse Fly', 'Oiseau inversé machine', 'shoulders', '{back}', 'machine', 'isolation', 'Face the pad, grip handles. Open arms wide, squeeze rear delts. Slow return.', 'Face au support, saisissez les poignées. Ouvrez les bras, contractez les deltoïdes postérieurs. Retour lent.', 'beginner', 'isolation'),
('Handstand Push-Up', 'Pompes en poirier', 'shoulders', '{triceps}', 'bodyweight', 'compound', 'Kick up to handstand against wall. Lower head toward floor, press back up. Start with pike push-ups to build strength.', 'Montez en poirier contre le mur. Descendez la tête vers le sol, remontez. Commencez par les pompes pike.', 'advanced', 'push'),
('Kettlebell Press', 'Développé kettlebell', 'shoulders', '{triceps}', 'kettlebell', 'compound', 'Clean kettlebell to rack position. Press overhead, lock out. Lower with control. Keep core tight.', 'Amenez le kettlebell en position rack. Poussez au-dessus, verrouillez. Descendez avec contrôle. Gainez.', 'intermediate', 'push'),
('Kettlebell Turkish Get-Up', 'Relevé turc kettlebell', 'shoulders', '{abs}', 'kettlebell', 'compound', 'Lie on back, press kettlebell up. Stand while keeping arm locked out overhead. Reverse to return. Start with bodyweight only until comfortable with each phase.', 'Allongé, poussez le kettlebell. Levez-vous en gardant le bras verrouillé. Inversez pour redescendre. Commencez sans poids.', 'advanced', 'push'),
('Band Lateral Raise', 'Élévation latérale avec bande', 'shoulders', '{}', 'bands', 'isolation', 'Stand on band, raise arms to shoulder height. Lead with elbows, control the descent.', 'Debout sur la bande, montez les bras à hauteur d''épaules. Coudes en premier, contrôlez la descente.', 'beginner', 'isolation');

-- ============================================================================
-- BICEPS (+9 new)
-- ============================================================================
INSERT INTO public.exercises (name_en, name_fr, muscle_primary, muscle_secondary, equipment, category, cues_en, cues_fr, difficulty, movement_pattern) VALUES
('Barbell Preacher Curl', 'Curl au pupitre barre', 'biceps', '{}', 'barbell', 'isolation', 'Arms on preacher pad, shoulder-width grip. Curl bar up, squeeze at top. Lower with full control.', 'Bras sur le pupitre, prise largeur d''épaules. Montez la barre, contractez en haut. Descendez avec contrôle.', 'beginner', 'pull'),
('Barbell Drag Curl', 'Curl drag barre', 'biceps', '{}', 'barbell', 'isolation', 'Drag bar up along body, elbows move back. Squeeze biceps at top. Lower along the same path.', 'Faites glisser la barre le long du corps, coudes vers l''arrière. Contractez en haut. Descendez sur le même chemin.', 'intermediate', 'pull'),
('Dumbbell Incline Curl', 'Curl incliné haltères', 'biceps', '{}', 'dumbbell', 'isolation', 'Sit on 45° incline bench, arms hanging. Curl up without swinging. Emphasizes the long head stretch.', 'Assis sur banc incliné à 45°, bras pendants. Montez sans élan. Accentue l''étirement du long biceps.', 'intermediate', 'pull'),
('Dumbbell Concentration Curl', 'Curl concentration haltère', 'biceps', '{}', 'dumbbell', 'isolation', 'Sit, elbow braced on inner thigh. Curl dumbbell up, squeeze peak. Lower with control.', 'Assis, coude appuyé sur l''intérieur de la cuisse. Montez, contractez au sommet. Descendez avec contrôle.', 'beginner', 'pull'),
('Dumbbell Zottman Curl', 'Curl Zottman haltères', 'biceps', '{forearms}', 'dumbbell', 'isolation', 'Curl up with palms up, rotate to palms down at top, lower with pronated grip. Targets biceps and forearms.', 'Montez paumes vers le haut, tournez paumes vers le bas en haut, descendez en pronation. Cible biceps et avant-bras.', 'intermediate', 'pull'),
('Cable Rope Hammer Curl', 'Curl marteau corde poulie', 'biceps', '{forearms}', 'cable', 'isolation', 'Low pulley, rope attachment. Curl with neutral grip, squeeze at top. Slow negative.', 'Poulie basse, corde. Montez en prise neutre, contractez en haut. Négatif lent.', 'beginner', 'pull'),
('Machine Preacher Curl', 'Curl pupitre machine', 'biceps', '{}', 'machine', 'isolation', 'Adjust pad height so arms rest comfortably. Curl up, squeeze at top. Control the negative.', 'Ajustez la hauteur du pad. Montez, contractez en haut. Contrôlez la phase négative.', 'beginner', 'pull'),
('Kettlebell Curl', 'Curl kettlebell', 'biceps', '{forearms}', 'kettlebell', 'isolation', 'Hold kettlebell by handle, elbows at sides. Curl up, squeeze at top. The offset weight challenges grip.', 'Tenez le kettlebell par la poignée, coudes au corps. Montez, contractez. Le poids décalé travaille la prise.', 'beginner', 'pull'),
('Band Hammer Curl', 'Curl marteau avec bande', 'biceps', '{forearms}', 'bands', 'isolation', 'Stand on band, neutral grip. Curl up keeping thumbs up. Squeeze at top, resist on the way down.', 'Debout sur la bande, prise neutre. Montez pouces vers le haut. Contractez, résistez en descendant.', 'beginner', 'pull');

-- ============================================================================
-- TRICEPS (+9 new)
-- ============================================================================
INSERT INTO public.exercises (name_en, name_fr, muscle_primary, muscle_secondary, equipment, category, cues_en, cues_fr, difficulty, movement_pattern) VALUES
('Barbell Skull Crusher', 'Barre au front', 'triceps', '{}', 'barbell', 'isolation', 'Lie flat, lower bar toward forehead by bending elbows. Extend back up. Keep upper arms vertical.', 'Allongé, descendez la barre vers le front en fléchissant les coudes. Remontez. Gardez les bras verticaux.', 'intermediate', 'push'),
('Barbell JM Press', 'JM press barre', 'triceps', '{chest}', 'barbell', 'compound', 'Hybrid of close-grip bench and skull crusher. Lower to chin level, then press up. Advanced technique — master close-grip bench first.', 'Hybride entre développé serré et barre au front. Descendez au niveau du menton, puis poussez. Maîtrisez d''abord le développé serré.', 'advanced', 'push'),
('Dumbbell Kickback', 'Kickback haltère', 'triceps', '{}', 'dumbbell', 'isolation', 'Hinge forward, elbow at 90°. Extend forearm back, squeeze tricep. Lower with control.', 'Penché en avant, coude à 90°. Étendez l''avant-bras, contractez le triceps. Descendez avec contrôle.', 'beginner', 'push'),
('Dumbbell Tate Press', 'Tate press haltères', 'triceps', '{}', 'dumbbell', 'isolation', 'Lie flat, dumbbells above chest. Lower toward chest by bending elbows inward. Extend back up.', 'Allongé, haltères au-dessus de la poitrine. Descendez vers la poitrine en fléchissant. Remontez.', 'intermediate', 'push'),
('Cable Overhead Tricep Extension', 'Extension triceps au-dessus poulie', 'triceps', '{}', 'cable', 'isolation', 'Face away from high pulley, rope overhead. Extend arms forward, squeeze triceps. Control return.', 'Dos à la poulie haute, corde au-dessus. Étendez les bras, contractez les triceps. Retour contrôlé.', 'beginner', 'push'),
('Cable Single-Arm Pushdown', 'Extension triceps unilatérale poulie', 'triceps', '{}', 'cable', 'isolation', 'High pulley, single handle. Push down with one arm, elbow pinned. Squeeze at bottom.', 'Poulie haute, poignée simple. Poussez avec un bras, coude fixe. Contractez en bas.', 'beginner', 'push'),
('Bodyweight Dip', 'Dips au poids du corps', 'triceps', '{chest,shoulders}', 'bodyweight', 'compound', 'Grip parallel bars, body upright for tricep emphasis. Lower until upper arms parallel. Press back up.', 'Barres parallèles, corps droit pour cibler les triceps. Descendez jusqu''à la parallèle. Remontez.', 'intermediate', 'push'),
('Bench Dip', 'Dips sur banc', 'triceps', '{chest,shoulders}', 'bodyweight', 'compound', 'Hands on bench behind you, legs extended. Lower until elbows at 90°. Press back up.', 'Mains sur le banc derrière vous, jambes tendues. Descendez à 90°. Remontez.', 'beginner', 'push'),
('Kettlebell Overhead Extension', 'Extension triceps kettlebell', 'triceps', '{}', 'kettlebell', 'isolation', 'Hold kettlebell overhead with both hands. Lower behind head, elbows pointing up. Extend back up.', 'Tenez le kettlebell au-dessus à deux mains. Descendez derrière la tête. Remontez.', 'beginner', 'push');

-- ============================================================================
-- QUADS (+12 new)
-- ============================================================================
INSERT INTO public.exercises (name_en, name_fr, muscle_primary, muscle_secondary, equipment, category, cues_en, cues_fr, difficulty, movement_pattern) VALUES
('Barbell Front Squat', 'Squat avant barre', 'quads', '{glutes}', 'barbell', 'compound', 'Bar on front delts, elbows high. Squat deep, chest up. Drive through whole foot. Keeps torso upright.', 'Barre sur les deltoïdes avant, coudes hauts. Descendez, poitrine haute. Poussez avec tout le pied.', 'intermediate', 'squat'),
('Barbell Lunge', 'Fente barre', 'quads', '{glutes,hamstrings}', 'barbell', 'compound', 'Bar on upper back. Step forward into lunge, knee over ankle. Push back to start through front heel.', 'Barre sur le haut du dos. Fente avant, genou au-dessus de la cheville. Revenez en poussant avec le talon.', 'intermediate', 'squat'),
('Dumbbell Walking Lunge', 'Fente marchée haltères', 'quads', '{glutes,hamstrings}', 'dumbbell', 'compound', 'Hold dumbbells at sides. Step forward into lunge, then drive through to next step. Keep torso upright.', 'Haltères le long du corps. Fente avant, enchaînez le pas suivant. Gardez le torse droit.', 'intermediate', 'squat'),
('Dumbbell Step-Up', 'Step-up haltères', 'quads', '{glutes}', 'dumbbell', 'compound', 'Hold dumbbells, one foot on box or bench. Drive through elevated foot to stand. Step down with control.', 'Haltères en main, un pied sur la box. Poussez pour monter. Redescendez avec contrôle.', 'beginner', 'squat'),
('Dumbbell Leg Extension', 'Extension jambes haltère', 'quads', '{}', 'dumbbell', 'isolation', 'Sit on bench, dumbbell held between feet. Extend legs until straight. Lower with control.', 'Assis sur le banc, haltère entre les pieds. Étendez les jambes. Descendez avec contrôle.', 'beginner', 'isolation'),
('Cable Split Squat', 'Split squat poulie', 'quads', '{glutes}', 'cable', 'compound', 'Low pulley, split stance. Lower into lunge, front knee tracking over toes. Drive up through front heel.', 'Poulie basse, position fente. Descendez, genou au-dessus des orteils. Poussez avec le talon avant.', 'intermediate', 'squat'),
('Machine Leg Extension', 'Extension jambes machine', 'quads', '{}', 'machine', 'isolation', 'Adjust pad above ankles. Extend legs until straight, squeeze quads at top. Slow negative.', 'Ajustez le pad au-dessus des chevilles. Étendez les jambes, contractez en haut. Négatif lent.', 'beginner', 'isolation'),
('Machine Hack Squat', 'Hack squat machine', 'quads', '{glutes}', 'machine', 'compound', 'Shoulders under pads, feet on platform. Lower to 90° knee bend or below. Drive up without locking.', 'Épaules sous les pads, pieds sur la plateforme. Descendez à 90° ou plus. Remontez sans verrouiller.', 'intermediate', 'squat'),
('Pistol Squat', 'Squat pistol', 'quads', '{glutes}', 'bodyweight', 'compound', 'Stand on one leg, other extended forward. Squat deep on one leg. Requires significant strength and balance. Start with assisted versions.', 'Sur un pied, l''autre tendu devant. Descendez sur une jambe. Demande force et équilibre. Commencez avec assistance.', 'advanced', 'squat'),
('Jump Squat', 'Squat sauté', 'quads', '{glutes,calves}', 'bodyweight', 'compound', 'Squat down, then explode upward. Land softly with bent knees. Control each rep.', 'Descendez en squat, puis explosez vers le haut. Atterrissez en douceur, genoux fléchis.', 'intermediate', 'squat'),
('Kettlebell Goblet Squat', 'Squat goblet kettlebell', 'quads', '{glutes}', 'kettlebell', 'compound', 'Hold kettlebell at chest by horns. Squat deep, elbows inside knees. Drive through heels.', 'Tenez le kettlebell à la poitrine. Descendez, coudes à l''intérieur des genoux. Poussez avec les talons.', 'beginner', 'squat'),
('Band Leg Extension', 'Extension jambes avec bande', 'quads', '{}', 'bands', 'isolation', 'Sit on chair, band around ankle anchored behind. Extend leg against resistance. Slow return.', 'Assis, bande à la cheville ancrée derrière. Étendez la jambe contre la résistance. Retour lent.', 'beginner', 'isolation');

-- ============================================================================
-- HAMSTRINGS (+9 new)
-- ============================================================================
INSERT INTO public.exercises (name_en, name_fr, muscle_primary, muscle_secondary, equipment, category, cues_en, cues_fr, difficulty, movement_pattern) VALUES
('Barbell Good Morning', 'Good morning barre', 'hamstrings', '{glutes,back}', 'barbell', 'compound', 'Bar on upper back. Hinge at hips, push hips back. Keep slight knee bend. Feel hamstring stretch, return to upright.', 'Barre sur le haut du dos. Penchez les hanches, poussez-les vers l''arrière. Légère flexion des genoux. Remontez.', 'intermediate', 'hinge'),
('Barbell Snatch-Grip Deadlift', 'Soulevé de terre prise d''arraché', 'hamstrings', '{glutes,back}', 'barbell', 'compound', 'Extra-wide grip increases range of motion. Hinge at hips, maintain flat back. Drive hips forward to lockout. Start light to master the wider grip.', 'Prise extra-large pour plus d''amplitude. Penchez les hanches, dos plat. Poussez les hanches. Commencez léger pour maîtriser la prise.', 'advanced', 'hinge'),
('Dumbbell Single-Leg RDL', 'Soulevé de terre roumain unipodal haltère', 'hamstrings', '{glutes}', 'dumbbell', 'compound', 'Stand on one leg, hinge forward lowering dumbbell. Back leg extends behind. Squeeze glute to return.', 'Sur un pied, penchez-vous en descendant l''haltère. L''autre jambe s''étend derrière. Contractez le fessier pour remonter.', 'intermediate', 'hinge'),
('Cable Romanian Deadlift', 'Soulevé de terre roumain poulie', 'hamstrings', '{glutes}', 'cable', 'compound', 'Low pulley, rope between legs. Hinge at hips, push hips back. Feel hamstring stretch, drive hips forward.', 'Poulie basse, corde entre les jambes. Penchez les hanches vers l''arrière. Sentez l''étirement, poussez les hanches.', 'intermediate', 'hinge'),
('Machine Seated Leg Curl', 'Leg curl assis machine', 'hamstrings', '{}', 'machine', 'isolation', 'Sit with pad above ankles. Curl legs under, squeeze at bottom. Slow return.', 'Assis, pad au-dessus des chevilles. Fléchissez les jambes, contractez en bas. Retour lent.', 'beginner', 'isolation'),
('Nordic Hamstring Curl', 'Curl nordique', 'hamstrings', '{}', 'bodyweight', 'compound', 'Kneel with ankles anchored. Lower body forward slowly, resisting with hamstrings. Push back up from floor. Start with bodyweight only until comfortable with the eccentric phase.', 'À genoux, chevilles ancrées. Descendez lentement en résistant. Repoussez du sol. Commencez au poids du corps uniquement.', 'advanced', 'hinge'),
('Slider Hamstring Curl', 'Leg curl glisseur', 'hamstrings', '{}', 'bodyweight', 'isolation', 'Lie on back, heels on sliders. Bridge up, curl heels toward glutes. Extend back out with control.', 'Allongé, talons sur des glisseurs. Montez en pont, ramenez les talons vers les fessiers. Étendez avec contrôle.', 'intermediate', 'isolation'),
('Kettlebell Single-Leg Deadlift', 'Soulevé de terre unipodal kettlebell', 'hamstrings', '{glutes}', 'kettlebell', 'compound', 'Hold kettlebell in one hand, stand on opposite foot. Hinge forward, back leg extends. Drive hips to stand.', 'Kettlebell dans une main, sur le pied opposé. Penchez-vous, l''autre jambe s''étend. Poussez les hanches pour remonter.', 'intermediate', 'hinge'),
('Band Good Morning', 'Good morning avec bande', 'hamstrings', '{glutes}', 'bands', 'compound', 'Stand on band, loop over neck/shoulders. Hinge at hips, push hips back. Return to upright.', 'Debout sur la bande, passez-la sur le cou. Penchez les hanches vers l''arrière. Redressez-vous.', 'beginner', 'hinge');

-- ============================================================================
-- GLUTES (+9 new)
-- ============================================================================
INSERT INTO public.exercises (name_en, name_fr, muscle_primary, muscle_secondary, equipment, category, cues_en, cues_fr, difficulty, movement_pattern) VALUES
('Barbell Sumo Deadlift', 'Soulevé de terre sumo barre', 'glutes', '{quads,hamstrings}', 'barbell', 'compound', 'Wide stance, toes out, grip inside legs. Push floor away, drive hips through at top. Keep chest up.', 'Position large, pointes vers l''extérieur, prise entre les jambes. Poussez le sol, hanches en avant. Poitrine haute.', 'intermediate', 'hinge'),
('Dumbbell Frog Pump', 'Frog pump haltère', 'glutes', '{}', 'dumbbell', 'isolation', 'Lie on back, soles together and knees out. Hold dumbbell on hips. Drive hips up, squeeze glutes hard.', 'Allongé, plantes de pieds ensemble et genoux ouverts. Haltère sur les hanches. Poussez les hanches, contractez fort.', 'beginner', 'isolation'),
('Dumbbell Curtsy Lunge', 'Fente croisée haltères', 'glutes', '{quads}', 'dumbbell', 'compound', 'Hold dumbbells, step one leg behind and across. Lower into lunge, drive back up through front heel.', 'Haltères en main, passez une jambe derrière et en travers. Descendez en fente, remontez avec le talon avant.', 'intermediate', 'squat'),
('Cable Kickback', 'Kickback fessier poulie', 'glutes', '{hamstrings}', 'cable', 'isolation', 'Low pulley, ankle strap. Kick leg straight back, squeeze glute at top. Control return. Keep core stable.', 'Poulie basse, sangle à la cheville. Poussez la jambe en arrière, contractez le fessier. Retour contrôlé. Gainez.', 'beginner', 'isolation'),
('Machine Hip Abduction', 'Abduction hanche machine', 'glutes', '{}', 'machine', 'isolation', 'Sit in machine, pads on outer thighs. Push legs apart, squeeze glutes. Slow return.', 'Assis dans la machine, pads sur les cuisses. Écartez les jambes, contractez les fessiers. Retour lent.', 'beginner', 'isolation'),
('Single-Leg Glute Bridge', 'Pont fessier unipodal', 'glutes', '{hamstrings}', 'bodyweight', 'isolation', 'Lie on back, one foot flat. Extend other leg up. Drive hips up on working leg, squeeze glute.', 'Allongé, un pied à plat. L''autre jambe tendue. Poussez les hanches sur la jambe d''appui, contractez.', 'beginner', 'isolation'),
('Clamshell', 'Clamshell', 'glutes', '{}', 'bodyweight', 'isolation', 'Lie on side, knees bent, feet together. Open top knee like a clamshell. Squeeze glute. Keep feet stacked.', 'Allongé sur le côté, genoux fléchis, pieds ensemble. Ouvrez le genou du dessus. Contractez le fessier.', 'beginner', 'isolation'),
('Kettlebell Hip Thrust', 'Hip thrust kettlebell', 'glutes', '{hamstrings}', 'kettlebell', 'compound', 'Upper back on bench, kettlebell on hips. Drive hips up until body is straight. Squeeze glutes at top.', 'Haut du dos sur le banc, kettlebell sur les hanches. Poussez les hanches. Contractez fort en haut.', 'intermediate', 'hinge'),
('Band Hip Thrust', 'Hip thrust avec bande', 'glutes', '{hamstrings}', 'bands', 'compound', 'Upper back on bench, band across hips anchored to floor. Drive hips up against resistance. Squeeze at top.', 'Haut du dos sur le banc, bande sur les hanches ancrée au sol. Poussez contre la résistance. Contractez en haut.', 'beginner', 'hinge');

-- ============================================================================
-- CALVES (+7 new)
-- ============================================================================
INSERT INTO public.exercises (name_en, name_fr, muscle_primary, muscle_secondary, equipment, category, cues_en, cues_fr, difficulty, movement_pattern) VALUES
('Dumbbell Standing Calf Raise', 'Mollets debout haltères', 'calves', '{}', 'dumbbell', 'isolation', 'Hold dumbbells, balls of feet on elevated surface. Rise onto toes, squeeze at top. Full stretch at bottom.', 'Haltères en main, avant-pieds surélevés. Montez sur les orteils, contractez. Étirement complet en bas.', 'beginner', 'isolation'),
('Dumbbell Seated Calf Raise', 'Mollets assis haltères', 'calves', '{}', 'dumbbell', 'isolation', 'Sit on bench, dumbbells on knees. Balls of feet on elevated surface. Rise onto toes, pause at top.', 'Assis, haltères sur les genoux. Avant-pieds surélevés. Montez sur les orteils, pause en haut.', 'beginner', 'isolation'),
('Cable Standing Calf Raise', 'Mollets debout poulie', 'calves', '{}', 'cable', 'isolation', 'Low pulley, belt or rope. Stand on elevated surface, rise onto toes. Squeeze at top, full stretch at bottom.', 'Poulie basse, ceinture ou corde. Debout sur surface surélevée, montez sur les orteils. Contractez en haut.', 'beginner', 'isolation'),
('Machine Standing Calf Raise', 'Mollets debout machine', 'calves', '{}', 'machine', 'isolation', 'Shoulders under pads, balls of feet on platform. Rise onto toes, squeeze at top. Full stretch at bottom.', 'Épaules sous les pads, avant-pieds sur la plateforme. Montez sur les orteils, contractez. Étirement complet.', 'beginner', 'isolation'),
('Donkey Calf Raise', 'Mollets position âne', 'calves', '{}', 'bodyweight', 'isolation', 'Hinge at hips, hands on support. Balls of feet on step. Rise onto toes, full range of motion. Stretch at bottom.', 'Penché, mains sur un support. Avant-pieds sur une marche. Montez sur les orteils, amplitude complète.', 'intermediate', 'isolation'),
('Kettlebell Calf Raise', 'Mollets kettlebell', 'calves', '{}', 'kettlebell', 'isolation', 'Hold kettlebell in one hand, stand on elevated surface. Rise onto toes, squeeze. Switch hands each set.', 'Kettlebell dans une main, debout sur surface surélevée. Montez sur les orteils, contractez. Changez de main.', 'beginner', 'isolation'),
('Band Calf Raise', 'Mollets avec bande', 'calves', '{}', 'bands', 'isolation', 'Sit with band around ball of foot. Push foot down against resistance, squeezing calf. Control return.', 'Assis, bande autour de l''avant-pied. Poussez le pied contre la résistance. Contrôlez le retour.', 'beginner', 'isolation');

-- ============================================================================
-- ABS (+10 new)
-- ============================================================================
INSERT INTO public.exercises (name_en, name_fr, muscle_primary, muscle_secondary, equipment, category, cues_en, cues_fr, difficulty, movement_pattern) VALUES
('Barbell Rollout', 'Rollout barre', 'abs', '{}', 'barbell', 'isolation', 'Kneel with hands on barbell. Roll forward extending body, then pull back using core. Keep hips from sagging. Start with short range until strong enough for full extension.', 'À genoux, mains sur la barre. Roulez en avant, puis ramenez avec les abdos. Ne laissez pas les hanches descendre. Commencez avec une courte amplitude.', 'advanced', 'isolation'),
('Dumbbell Side Bend', 'Flexion latérale haltère', 'abs', '{}', 'dumbbell', 'isolation', 'Hold dumbbell in one hand. Bend sideways toward weighted side, then return. Keep hips still.', 'Haltère dans une main. Fléchissez sur le côté, puis revenez. Gardez les hanches fixes.', 'beginner', 'isolation'),
('Cable Crunch', 'Crunch poulie', 'abs', '{}', 'cable', 'isolation', 'Kneel below high pulley, rope behind head. Crunch down, rounding spine. Squeeze abs at bottom.', 'À genoux sous la poulie haute, corde derrière la tête. Crunchez en arrondissant la colonne. Contractez en bas.', 'beginner', 'isolation'),
('Cable Reverse Woodchop', 'Woodchop inversé poulie', 'abs', '{shoulders}', 'cable', 'compound', 'Low pulley, rotate torso diagonally upward. Keep arms extended, rotate from core. Control return.', 'Poulie basse, rotation du torse en diagonale vers le haut. Bras tendus, rotation du tronc. Contrôlez le retour.', 'intermediate', 'rotation'),
('Machine Torso Rotation', 'Rotation du torse machine', 'abs', '{}', 'machine', 'compound', 'Sit in machine, chest against pad. Rotate torso against resistance. Slow return. Work both sides equally.', 'Assis, poitrine contre le support. Tournez le torse contre la résistance. Retour lent. Travaillez les deux côtés.', 'beginner', 'rotation'),
('Bicycle Crunch', 'Crunch bicyclette', 'abs', '{}', 'bodyweight', 'isolation', 'Lie on back, hands behind head. Bring opposite elbow to knee, alternating sides. Control each rep.', 'Allongé, mains derrière la tête. Amenez le coude opposé au genou, en alternant. Contrôlez chaque répétition.', 'beginner', 'isolation'),
('Mountain Climber', 'Mountain climber', 'abs', '{}', 'bodyweight', 'isolation', 'Plank position. Drive knees toward chest alternately. Keep hips level, core tight.', 'Position de planche. Amenez les genoux vers la poitrine en alternant. Hanches stables, gainez.', 'beginner', 'isolation'),
('Dragon Flag', 'Dragon flag', 'abs', '{}', 'bodyweight', 'isolation', 'Lie on bench, grip behind head. Raise body until vertical, lower as one unit. Requires significant core strength. Start with tucked knees to build strength.', 'Allongé sur le banc, prise derrière la tête. Montez le corps, descendez d''un bloc. Commencez genoux fléchis.', 'advanced', 'isolation'),
('Ab Wheel Rollout', 'Rollout roue abdominale', 'abs', '{}', 'bodyweight', 'isolation', 'Kneel with hands on ab wheel. Roll forward extending body, pull back using core. Keep hips from sagging.', 'À genoux, mains sur la roue. Roulez en avant, ramenez avec les abdos. Ne laissez pas les hanches descendre.', 'intermediate', 'isolation'),
('Kettlebell Windmill', 'Windmill kettlebell', 'abs', '{shoulders}', 'kettlebell', 'compound', 'Kettlebell pressed overhead. Hinge sideways, free hand slides down leg. Keep eyes on kettlebell. Return to upright.', 'Kettlebell poussé au-dessus. Penchez-vous latéralement, l''autre main glisse le long de la jambe. Regardez le kettlebell.', 'intermediate', 'rotation');

-- ============================================================================
-- TRAPS (+10 new — NEW muscle group)
-- ============================================================================
INSERT INTO public.exercises (name_en, name_fr, muscle_primary, muscle_secondary, equipment, category, cues_en, cues_fr, difficulty, movement_pattern) VALUES
('Barbell Shrug', 'Shrug barre', 'traps', '{}', 'barbell', 'isolation', 'Hold bar at thighs, shoulder-width grip. Shrug shoulders straight up toward ears. Squeeze at top. Lower with control.', 'Barre aux cuisses, prise largeur d''épaules. Haussez les épaules vers les oreilles. Contractez en haut. Descendez avec contrôle.', 'beginner', 'isolation'),
('Barbell Upright Row', 'Tirage menton barre', 'traps', '{shoulders}', 'barbell', 'compound', 'Narrow grip on bar. Pull up along body to chin level, elbows high. Lower with control.', 'Prise serrée sur la barre. Tirez le long du corps jusqu''au menton, coudes hauts. Descendez avec contrôle.', 'intermediate', 'pull'),
('Dumbbell Shrug', 'Shrug haltères', 'traps', '{}', 'dumbbell', 'isolation', 'Hold dumbbells at sides. Shrug shoulders straight up, squeeze at top. Lower with control.', 'Haltères le long du corps. Haussez les épaules, contractez en haut. Descendez avec contrôle.', 'beginner', 'isolation'),
('Dumbbell Farmer Walk', 'Marche du fermier haltères', 'traps', '{forearms,abs}', 'dumbbell', 'compound', 'Hold heavy dumbbells at sides. Walk with tall posture, shoulders back. Keep core tight throughout.', 'Haltères lourds le long du corps. Marchez avec une posture droite, épaules en arrière. Gainez.', 'intermediate', 'carry'),
('Cable Shrug', 'Shrug poulie', 'traps', '{}', 'cable', 'isolation', 'Low pulley, bar or rope. Shrug shoulders straight up. Squeeze at top, slow negative.', 'Poulie basse, barre ou corde. Haussez les épaules. Contractez en haut, négatif lent.', 'beginner', 'isolation'),
('Cable Upright Row', 'Tirage menton poulie', 'traps', '{shoulders}', 'cable', 'compound', 'Low pulley, narrow grip. Pull up along body, elbows high. Lower with control.', 'Poulie basse, prise serrée. Tirez le long du corps, coudes hauts. Descendez avec contrôle.', 'beginner', 'pull'),
('Machine Shrug', 'Shrug machine', 'traps', '{}', 'machine', 'isolation', 'Stand in shrug machine, grip handles. Shrug shoulders up, squeeze at top. Slow return.', 'Debout dans la machine à shrug, saisissez les poignées. Haussez, contractez. Retour lent.', 'beginner', 'isolation'),
('Bodyweight Scapular Shrug', 'Shrug scapulaire au poids du corps', 'traps', '{}', 'bodyweight', 'isolation', 'Hang from bar with straight arms. Shrug shoulder blades down and together without bending elbows. Release slowly.', 'Suspendu à la barre, bras tendus. Abaissez les omoplates sans fléchir les coudes. Relâchez lentement.', 'beginner', 'isolation'),
('Kettlebell Farmer Walk', 'Marche du fermier kettlebell', 'traps', '{forearms,abs}', 'kettlebell', 'compound', 'Hold heavy kettlebells at sides. Walk with tall posture, shoulders packed. Core tight throughout.', 'Kettlebells lourds le long du corps. Marchez avec posture droite, épaules basses. Gainez.', 'intermediate', 'carry'),
('Band Shrug', 'Shrug avec bande', 'traps', '{}', 'bands', 'isolation', 'Stand on band, grip handles. Shrug shoulders up against resistance. Squeeze at top.', 'Debout sur la bande, saisissez les poignées. Haussez les épaules contre la résistance. Contractez en haut.', 'beginner', 'isolation');

-- ============================================================================
-- FOREARMS (+10 new — NEW muscle group)
-- ============================================================================
INSERT INTO public.exercises (name_en, name_fr, muscle_primary, muscle_secondary, equipment, category, cues_en, cues_fr, difficulty, movement_pattern) VALUES
('Barbell Wrist Curl', 'Curl poignet barre', 'forearms', '{}', 'barbell', 'isolation', 'Forearms on bench, wrists over edge. Curl bar up by flexing wrists. Lower with control.', 'Avant-bras sur le banc, poignets au bord. Montez la barre en fléchissant les poignets. Descendez avec contrôle.', 'beginner', 'isolation'),
('Barbell Reverse Curl', 'Curl inversé barre', 'forearms', '{biceps}', 'barbell', 'isolation', 'Overhand grip, shoulder-width. Curl bar up, keeping wrists straight. Lower with control.', 'Prise pronation, largeur d''épaules. Montez la barre, poignets droits. Descendez avec contrôle.', 'beginner', 'pull'),
('Dumbbell Wrist Curl', 'Curl poignet haltère', 'forearms', '{}', 'dumbbell', 'isolation', 'Forearm on thigh, wrist over knee. Curl dumbbell up by flexing wrist. Lower with control.', 'Avant-bras sur la cuisse, poignet au-dessus du genou. Montez en fléchissant le poignet. Descendez avec contrôle.', 'beginner', 'isolation'),
('Dumbbell Reverse Wrist Curl', 'Curl poignet inversé haltère', 'forearms', '{}', 'dumbbell', 'isolation', 'Forearm on thigh, palm down. Extend wrist upward against gravity. Lower with control.', 'Avant-bras sur la cuisse, paume vers le bas. Étendez le poignet vers le haut. Descendez avec contrôle.', 'beginner', 'isolation'),
('Dumbbell Farmer Walk Hold', 'Marche du fermier statique haltères', 'forearms', '{traps,abs}', 'dumbbell', 'compound', 'Hold heavy dumbbells at sides. Walk or stand, focusing on grip endurance. Shoulders back, core tight.', 'Haltères lourds le long du corps. Marchez ou restez debout, focus sur l''endurance de prise. Gainez.', 'beginner', 'carry'),
('Cable Wrist Curl', 'Curl poignet poulie', 'forearms', '{}', 'cable', 'isolation', 'Low pulley, forearms on bench. Curl handle up by flexing wrists. Constant tension from cable.', 'Poulie basse, avant-bras sur le banc. Montez la poignée en fléchissant les poignets. Tension constante.', 'beginner', 'isolation'),
('Plate Pinch Hold', 'Prise de plaque', 'forearms', '{}', 'barbell', 'isolation', 'Pinch two plates together smooth-sides-out. Hold for time, squeezing thumb and fingers together.', 'Pincez deux disques ensemble, côtés lisses vers l''extérieur. Tenez en serrant pouce et doigts.', 'intermediate', 'isolation'),
('Dead Hang', 'Suspension passive', 'forearms', '{back}', 'bodyweight', 'isolation', 'Hang from bar with straight arms. Relax shoulders, focus on grip. Hold for time.', 'Suspendu à la barre, bras tendus. Relâchez les épaules, concentrez-vous sur la prise. Tenez.', 'beginner', 'isolation'),
('Kettlebell Bottoms-Up Hold', 'Kettlebell tête en bas', 'forearms', '{shoulders}', 'kettlebell', 'isolation', 'Hold kettlebell upside down by handle at shoulder height. Squeeze grip to keep bell from tipping. Hold for time.', 'Tenez le kettlebell à l''envers par la poignée à hauteur d''épaule. Serrez pour stabiliser. Tenez.', 'intermediate', 'isolation'),
('Band Wrist Extension', 'Extension poignet avec bande', 'forearms', '{}', 'bands', 'isolation', 'Forearm on thigh, band around hand. Extend wrist upward against band resistance. Control return.', 'Avant-bras sur la cuisse, bande autour de la main. Étendez le poignet contre la résistance. Retour contrôlé.', 'beginner', 'isolation');

-- ============================================================================
-- OVERFLOW EXERCISES (+30 to reach 206 total)
-- ============================================================================

-- Additional shoulders
INSERT INTO public.exercises (name_en, name_fr, muscle_primary, muscle_secondary, equipment, category, cues_en, cues_fr, difficulty, movement_pattern) VALUES
('Kettlebell Clean', 'Clean kettlebell', 'shoulders', '{traps}', 'kettlebell', 'compound', 'Swing kettlebell between legs, then pull and rotate to rack position. Absorb with soft knees. Control the bell path.', 'Balancez le kettlebell entre les jambes, puis tirez et tournez en position rack. Absorbez avec les genoux. Contrôlez.', 'intermediate', 'pull'),
('Kettlebell Snatch', 'Arraché kettlebell', 'shoulders', '{traps,back}', 'kettlebell', 'compound', 'Swing kettlebell between legs, pull overhead in one motion. Lock out at top. Control the descent. Master the clean before attempting snatches.', 'Balancez entre les jambes, tirez au-dessus de la tête en un mouvement. Verrouillez. Maîtrisez le clean d''abord.', 'advanced', 'pull'),
('Barbell Clean and Press', 'Épaulé-jeté barre', 'shoulders', '{traps,quads}', 'barbell', 'compound', 'Clean bar to shoulders, then press overhead. Combines explosive pull with strict press. Start light to learn the transition.', 'Épaulez la barre, puis poussez au-dessus. Combine tirage explosif et développé strict. Commencez léger.', 'advanced', 'push'),
('Cable Face Pull to Press', 'Face pull vers développé poulie', 'shoulders', '{back,triceps}', 'cable', 'compound', 'Pull rope to face, then rotate and press overhead. Combines rear delt work with pressing. Control each phase.', 'Tirez la corde vers le visage, puis tournez et poussez au-dessus. Contrôlez chaque phase.', 'intermediate', 'push'),
('Band Face Pull', 'Face pull avec bande', 'shoulders', '{back}', 'bands', 'isolation', 'Anchor band at face height. Pull toward face, elbows high. Squeeze rear delts and rotate externally.', 'Ancrez la bande à hauteur du visage. Tirez vers le visage, coudes hauts. Contractez, rotation externe.', 'beginner', 'pull'),
('Dumbbell Prone Y-Raise', 'Élévation en Y haltères', 'shoulders', '{back}', 'dumbbell', 'isolation', 'Lie face down on incline bench. Raise arms in Y shape, thumbs up. Squeeze upper back and rear delts.', 'Allongé face contre banc incliné. Montez les bras en Y, pouces vers le haut. Contractez le haut du dos.', 'beginner', 'isolation'),
('Deficit Handstand Push-Up', 'Pompes en poirier avec déficit', 'shoulders', '{triceps}', 'bodyweight', 'compound', 'Hands on parallettes or blocks in handstand against wall. Lower head below hand level for extra range. Master regular handstand push-ups first.', 'Mains sur des parallettes en poirier contre le mur. Descendez la tête sous les mains. Maîtrisez les pompes en poirier d''abord.', 'advanced', 'push');

-- Additional back
INSERT INTO public.exercises (name_en, name_fr, muscle_primary, muscle_secondary, equipment, category, cues_en, cues_fr, difficulty, movement_pattern) VALUES
('Muscle-Up', 'Muscle-up', 'back', '{chest,triceps}', 'bodyweight', 'compound', 'Explosive pull-up transitioning over the bar into a dip. Requires significant upper body strength. Master strict pull-ups and dips first.', 'Traction explosive passant au-dessus de la barre. Demande une force importante. Maîtrisez d''abord tractions et dips.', 'advanced', 'pull'),
('Dumbbell Seal Row', 'Seal row haltères', 'back', '{biceps}', 'dumbbell', 'compound', 'Lie face down on elevated bench. Row dumbbells from dead hang, squeeze shoulder blades. Eliminates all momentum.', 'Allongé face contre banc surélevé. Tirez les haltères, serrez les omoplates. Élimine tout élan.', 'intermediate', 'pull'),
('Barbell Rack Pull', 'Rack pull barre', 'back', '{glutes,hamstrings}', 'barbell', 'compound', 'Set bar at knee height in rack. Grip and drive hips forward to lockout. Overloads the top portion of the deadlift.', 'Barre à hauteur des genoux dans le rack. Saisissez et poussez les hanches. Surcharge la partie haute du soulevé.', 'intermediate', 'hinge'),
('Kettlebell Renegade Row', 'Rowing renégat kettlebell', 'back', '{abs}', 'kettlebell', 'compound', 'Plank position on two kettlebells. Row one while stabilizing with the other. Alternate. Keep hips square — minimize rotation.', 'Position planche sur deux kettlebells. Tirez un pendant que l''autre stabilise. Alternez. Hanches stables.', 'advanced', 'pull'),
('Barbell Landmine Row', 'Rowing landmine barre', 'back', '{biceps}', 'barbell', 'compound', 'One end of barbell in corner. Straddle bar, row with one or both hands to chest. Squeeze back at top.', 'Un bout de barre dans un coin. Enjambez, tirez d''une ou deux mains vers la poitrine. Contractez en haut.', 'intermediate', 'pull'),
('Front Lever Row', 'Rowing front lever', 'back', '{abs}', 'bodyweight', 'compound', 'Hang from bar in tucked or full front lever position. Pull body up to bar while maintaining horizontal position. Extreme strength required.', 'Suspendu en position front lever. Tirez le corps vers la barre en restant horizontal. Force extrême requise.', 'advanced', 'pull'),
('Ring Muscle-Up', 'Muscle-up aux anneaux', 'back', '{chest,triceps}', 'bodyweight', 'compound', 'Explosive pull on rings transitioning above into support. Requires false grip mastery. Start with strict ring pull-ups and dips.', 'Traction explosive aux anneaux passant au-dessus. Demande la maîtrise du false grip. Commencez par tractions et dips aux anneaux.', 'advanced', 'pull');

-- Additional quads
INSERT INTO public.exercises (name_en, name_fr, muscle_primary, muscle_secondary, equipment, category, cues_en, cues_fr, difficulty, movement_pattern) VALUES
('Shrimp Squat', 'Squat crevette', 'quads', '{glutes}', 'bodyweight', 'compound', 'Stand on one leg, hold back foot behind. Squat down on one leg, rear knee touches floor. Significant balance and strength required.', 'Sur un pied, tenez l''autre derrière. Descendez sur une jambe, le genou touche le sol. Demande équilibre et force.', 'advanced', 'squat'),
('Smith Machine Squat', 'Squat Smith machine', 'quads', '{glutes}', 'machine', 'compound', 'Bar on traps in Smith machine. Squat to parallel or below. Fixed bar path allows focus on legs.', 'Barre sur les trapèzes dans la Smith machine. Descendez en parallèle ou plus. Le rail fixe permet de cibler les jambes.', 'beginner', 'squat'),
('Dumbbell Thruster', 'Thruster haltères', 'quads', '{shoulders,glutes}', 'dumbbell', 'compound', 'Dumbbells at shoulders. Squat down, then drive up and press overhead in one fluid motion. Combine squat and press.', 'Haltères aux épaules. Descendez en squat, puis poussez et développez en un mouvement fluide.', 'intermediate', 'squat'),
('Barbell Zercher Squat', 'Squat Zercher barre', 'quads', '{glutes,abs}', 'barbell', 'compound', 'Bar in crook of elbows. Squat deep, chest up. Challenges core stability. Use padding on bar for comfort.', 'Barre dans le creux des coudes. Descendez, poitrine haute. Travaille la stabilité du tronc. Utilisez un pad.', 'advanced', 'squat'),
('Dumbbell Reverse Lunge', 'Fente arrière haltères', 'quads', '{glutes}', 'dumbbell', 'compound', 'Hold dumbbells at sides. Step backward into lunge, front knee at 90°. Push through front heel to return.', 'Haltères le long du corps. Reculez en fente, genou avant à 90°. Poussez avec le talon avant pour remonter.', 'beginner', 'squat'),
('Machine Leg Press Narrow Stance', 'Presse à cuisses pieds serrés', 'quads', '{}', 'machine', 'compound', 'Feet narrow and low on platform. Press up, emphasizing quads. Lower to 90° knee bend.', 'Pieds serrés et bas sur la plateforme. Poussez, accent sur les quadriceps. Descendez à 90°.', 'beginner', 'squat'),
('Sissy Squat', 'Sissy squat', 'quads', '{}', 'bodyweight', 'compound', 'Hold support with one hand. Lean back, bending knees forward while rising onto toes. Intense quad stretch. Start with partial range.', 'Tenez un support. Penchez-vous en arrière, genoux en avant sur les orteils. Étirement intense. Commencez partiellement.', 'advanced', 'squat');

-- Additional calves
INSERT INTO public.exercises (name_en, name_fr, muscle_primary, muscle_secondary, equipment, category, cues_en, cues_fr, difficulty, movement_pattern) VALUES
('Leg Press Calf Raise', 'Mollets presse à cuisses', 'calves', '{}', 'machine', 'isolation', 'Position feet at bottom edge of leg press platform. Push with toes, full calf contraction. Lower for full stretch.', 'Pieds au bord bas de la plateforme. Poussez avec les orteils, contraction complète. Descendez pour l''étirement.', 'beginner', 'isolation');

-- Additional abs
INSERT INTO public.exercises (name_en, name_fr, muscle_primary, muscle_secondary, equipment, category, cues_en, cues_fr, difficulty, movement_pattern) VALUES
('L-Sit', 'L-sit', 'abs', '{}', 'bodyweight', 'isolation', 'Support on parallel bars or floor, legs extended horizontal. Hold position with straight legs. Requires significant core and hip flexor strength.', 'En appui sur barres parallèles ou sol, jambes tendues à l''horizontale. Tenez. Demande une force importante.', 'advanced', 'isolation'),
('Cable Woodchop Low-to-High', 'Woodchop poulie bas vers haut', 'abs', '{shoulders}', 'cable', 'compound', 'Low pulley, rotate torso diagonally upward. Arms extended, power from core rotation. Control return.', 'Poulie basse, rotation du torse en diagonale vers le haut. Bras tendus, puissance du tronc. Contrôlez le retour.', 'intermediate', 'rotation');

-- Additional chest
INSERT INTO public.exercises (name_en, name_fr, muscle_primary, muscle_secondary, equipment, category, cues_en, cues_fr, difficulty, movement_pattern) VALUES
('Svend Press', 'Svend press haltères', 'chest', '{}', 'dumbbell', 'isolation', 'Squeeze two light dumbbells or a plate together at chest level. Press forward, maintaining squeeze. Return to chest.', 'Serrez deux haltères légers ensemble à hauteur de poitrine. Poussez vers l''avant en maintenant la pression. Ramenez.', 'beginner', 'push'),
('Barbell Landmine Press', 'Développé landmine barre', 'chest', '{shoulders,triceps}', 'barbell', 'compound', 'One end of barbell in corner. Press the other end up and forward from chest. Great for shoulder-friendly pressing.', 'Un bout de barre dans un coin. Poussez l''autre extrémité vers le haut. Excellent pour les épaules sensibles.', 'intermediate', 'push'),
('Planche Push-Up', 'Pompes en planche', 'chest', '{shoulders,triceps}', 'bodyweight', 'compound', 'Full planche position with feet off ground. Perform push-up while maintaining planche. Extreme upper body strength required. Master tuck planche first.', 'Position planche complète, pieds décollés. Faites des pompes en maintenant la planche. Force extrême requise. Maîtrisez la planche groupée d''abord.', 'advanced', 'push');

-- Additional glutes
INSERT INTO public.exercises (name_en, name_fr, muscle_primary, muscle_secondary, equipment, category, cues_en, cues_fr, difficulty, movement_pattern) VALUES
('Dumbbell Lateral Lunge', 'Fente latérale haltères', 'glutes', '{quads}', 'dumbbell', 'compound', 'Hold dumbbells at sides. Step wide to one side, push hips back. Drive through heel to return. Alternate sides.', 'Haltères le long du corps. Grand pas sur le côté, hanches en arrière. Poussez avec le talon. Alternez.', 'intermediate', 'squat');

-- Additional triceps
INSERT INTO public.exercises (name_en, name_fr, muscle_primary, muscle_secondary, equipment, category, cues_en, cues_fr, difficulty, movement_pattern) VALUES
('Band Tricep Extension', 'Extension triceps avec bande', 'triceps', '{}', 'bands', 'isolation', 'Anchor band overhead. Face away, press handles forward. Squeeze triceps at extension. Control return.', 'Ancrez la bande en hauteur. Dos à l''ancrage, poussez les poignées. Contractez les triceps. Retour contrôlé.', 'beginner', 'push');

-- Additional forearms
INSERT INTO public.exercises (name_en, name_fr, muscle_primary, muscle_secondary, equipment, category, cues_en, cues_fr, difficulty, movement_pattern) VALUES
('Band Reverse Curl', 'Curl inversé avec bande', 'forearms', '{biceps}', 'bands', 'isolation', 'Stand on band, overhand grip. Curl up keeping wrists straight. Targets brachioradialis and forearm extensors.', 'Debout sur la bande, prise pronation. Montez en gardant les poignets droits. Cible le brachio-radial.', 'beginner', 'pull');
