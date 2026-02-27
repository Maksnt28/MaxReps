-- MaxReps Exercise Seed Data
-- Base exercise set (53). Additional exercises added via migrations 20260226100000 and 20260227100000.
-- Each exercise has EN/FR names and coaching cues

insert into public.exercises (name_en, name_fr, muscle_primary, muscle_secondary, equipment, category, cues_en, cues_fr, difficulty) values

-- ============================================================================
-- CHEST
-- ============================================================================
('Barbell Bench Press', 'Développé couché barre', 'chest', '{triceps,shoulders}', 'barbell', 'compound', 'Retract shoulder blades, feet flat, drive through heels. Lower bar to mid-chest, press up and slightly back.', 'Rétractez les omoplates, pieds à plat, poussez avec les talons. Descendez la barre au milieu de la poitrine, poussez vers le haut.', 'intermediate'),
('Dumbbell Incline Press', 'Développé incliné haltères', 'chest', '{triceps,shoulders}', 'dumbbell', 'compound', 'Set bench to 30-45°. Press dumbbells up from chest level, squeeze at top. Control the descent.', 'Réglez le banc à 30-45°. Poussez les haltères depuis la poitrine, contractez en haut. Contrôlez la descente.', 'intermediate'),
('Cable Fly', 'Écarté à la poulie', 'chest', '{}', 'cable', 'isolation', 'Set pulleys at chest height. Slight bend in elbows, bring handles together in a hugging motion. Squeeze chest at center.', 'Réglez les poulies à hauteur de poitrine. Légère flexion des coudes, rapprochez les poignées. Contractez au centre.', 'beginner'),
('Machine Chest Press', 'Presse pectorale machine', 'chest', '{triceps,shoulders}', 'machine', 'compound', 'Adjust seat so handles align with mid-chest. Push forward, do not lock elbows. Slow negative.', 'Ajustez le siège pour aligner les poignées avec la poitrine. Poussez, ne verrouillez pas les coudes. Négatif lent.', 'beginner'),
('Push-Up', 'Pompes', 'chest', '{triceps,shoulders}', 'bodyweight', 'compound', 'Hands shoulder-width, body straight from head to heels. Lower until chest nearly touches floor. Push back up.', 'Mains largeur d''épaules, corps droit. Descendez jusqu''à ce que la poitrine touche presque le sol. Remontez.', 'beginner'),
('Banded Chest Fly', 'Écarté avec bande', 'chest', '{}', 'bands', 'isolation', 'Anchor band behind you at chest height. Arms extended with slight elbow bend, bring hands together in front.', 'Ancrez la bande derrière vous à hauteur de poitrine. Bras tendus, légère flexion, rapprochez les mains devant.', 'beginner'),

-- ============================================================================
-- BACK
-- ============================================================================
('Barbell Bent-Over Row', 'Rowing barre buste penché', 'back', '{biceps}', 'barbell', 'compound', 'Hinge at hips, back flat at ~45°. Pull bar to lower chest, squeeze shoulder blades together. Lower with control.', 'Penchez le buste à ~45°, dos plat. Tirez la barre vers le bas de la poitrine, serrez les omoplates. Descendez avec contrôle.', 'intermediate'),
('Dumbbell Single-Arm Row', 'Rowing unilatéral haltère', 'back', '{biceps}', 'dumbbell', 'compound', 'One hand and knee on bench. Pull dumbbell to hip, elbow close to body. Squeeze lat at top.', 'Une main et un genou sur le banc. Tirez l''haltère vers la hanche, coude près du corps. Contractez en haut.', 'beginner'),
('Cable Lat Pulldown', 'Tirage vertical poulie', 'back', '{biceps}', 'cable', 'compound', 'Wide grip, lean back slightly. Pull bar to upper chest, squeeze lats. Control the return.', 'Prise large, penchez-vous légèrement en arrière. Tirez la barre vers le haut de la poitrine, contractez les dorsaux.', 'beginner'),
('Pull-Up', 'Traction', 'back', '{biceps}', 'bodyweight', 'compound', 'Overhand grip, shoulder-width or wider. Pull chin over bar, squeeze lats. Lower fully with control.', 'Prise pronation, largeur d''épaules ou plus. Tirez le menton au-dessus de la barre, contractez les dorsaux. Descendez avec contrôle.', 'advanced'),
('Machine Seated Row', 'Rowing assis machine', 'back', '{biceps}', 'machine', 'compound', 'Sit tall, chest against pad. Pull handles to torso, squeeze shoulder blades. Slow return.', 'Asseyez-vous droit, poitrine contre le support. Tirez les poignées vers le torse, serrez les omoplates.', 'beginner'),
('Band Pull-Apart', 'Écarté dorsal avec bande', 'back', '{shoulders}', 'bands', 'isolation', 'Hold band at shoulder width, arms extended. Pull apart until band touches chest. Squeeze rear delts.', 'Tenez la bande largeur d''épaules, bras tendus. Écartez jusqu''à la poitrine. Contractez les deltoïdes postérieurs.', 'beginner'),

-- ============================================================================
-- SHOULDERS
-- ============================================================================
('Barbell Overhead Press', 'Développé militaire barre', 'shoulders', '{triceps}', 'barbell', 'compound', 'Bar at collarbone, grip just outside shoulders. Press overhead, lock out. Keep core tight, no leg drive.', 'Barre aux clavicules, prise juste en dehors des épaules. Poussez au-dessus de la tête. Gainez, pas d''élan.', 'intermediate'),
('Dumbbell Lateral Raise', 'Élévations latérales haltères', 'shoulders', '{}', 'dumbbell', 'isolation', 'Arms at sides, slight elbow bend. Raise to shoulder height, lead with elbows. Control the descent.', 'Bras le long du corps, légère flexion. Montez à hauteur d''épaules, coudes en premier. Contrôlez la descente.', 'beginner'),
('Cable Face Pull', 'Face pull poulie', 'shoulders', '{back}', 'cable', 'isolation', 'Rope at face height. Pull toward face, elbows high and wide. Squeeze rear delts and rotate externally.', 'Corde à hauteur du visage. Tirez vers le visage, coudes hauts. Contractez les deltoïdes postérieurs, rotation externe.', 'beginner'),
('Machine Shoulder Press', 'Développé épaules machine', 'shoulders', '{triceps}', 'machine', 'compound', 'Adjust seat so handles start at ear level. Press up without locking elbows. Slow negative.', 'Ajustez le siège pour que les poignées démarrent au niveau des oreilles. Poussez sans verrouiller. Négatif lent.', 'beginner'),
('Pike Push-Up', 'Pompes en pike', 'shoulders', '{triceps}', 'bodyweight', 'compound', 'Hips high in inverted V. Hands shoulder-width, lower head toward floor. Press back up.', 'Hanches hautes en V inversé. Mains largeur d''épaules, descendez la tête vers le sol. Remontez.', 'intermediate'),
('Band Shoulder Press', 'Développé épaules avec bande', 'shoulders', '{triceps}', 'bands', 'compound', 'Stand on band, grip at shoulder height. Press overhead until arms are extended. Control the return.', 'Debout sur la bande, prise aux épaules. Poussez au-dessus de la tête. Contrôlez la descente.', 'beginner'),

-- ============================================================================
-- BICEPS
-- ============================================================================
('Barbell Curl', 'Curl barre', 'biceps', '{}', 'barbell', 'isolation', 'Shoulder-width grip, elbows pinned at sides. Curl to shoulder level. Lower with control, full extension.', 'Prise largeur d''épaules, coudes collés au corps. Montez jusqu''aux épaules. Descendez avec contrôle, extension complète.', 'beginner'),
('Dumbbell Hammer Curl', 'Curl marteau haltères', 'biceps', '{forearms}', 'dumbbell', 'isolation', 'Neutral grip (palms facing in). Curl to shoulder, keep elbows still. Targets brachialis and forearms.', 'Prise neutre (paumes face à face). Montez à l''épaule, coudes fixes. Cible le brachial et les avant-bras.', 'beginner'),
('Cable Bicep Curl', 'Curl biceps poulie', 'biceps', '{}', 'cable', 'isolation', 'Low pulley, straight bar. Curl up keeping elbows at sides. Squeeze at top, slow negative.', 'Poulie basse, barre droite. Montez en gardant les coudes au corps. Contractez en haut, négatif lent.', 'beginner'),
('Chin-Up', 'Traction supination', 'biceps', '{back}', 'bodyweight', 'compound', 'Underhand grip, shoulder-width. Pull chin over bar. Squeeze biceps at top. Full extension at bottom.', 'Prise supination, largeur d''épaules. Menton au-dessus de la barre. Contractez en haut. Extension complète en bas.', 'intermediate'),
('Band Bicep Curl', 'Curl biceps avec bande', 'biceps', '{}', 'bands', 'isolation', 'Stand on band, grip handles. Curl up keeping elbows pinned. Squeeze at top, resist on the way down.', 'Debout sur la bande, montez en gardant les coudes fixes. Contractez en haut, résistez en descendant.', 'beginner'),

-- ============================================================================
-- TRICEPS
-- ============================================================================
('Barbell Close-Grip Bench Press', 'Développé couché prise serrée', 'triceps', '{chest,shoulders}', 'barbell', 'compound', 'Hands shoulder-width or narrower. Lower bar to lower chest, elbows close to body. Press up.', 'Mains largeur d''épaules ou plus serrées. Descendez vers le bas de la poitrine, coudes au corps. Poussez.', 'intermediate'),
('Dumbbell Overhead Tricep Extension', 'Extension triceps au-dessus de la tête', 'triceps', '{}', 'dumbbell', 'isolation', 'Hold one dumbbell overhead with both hands. Lower behind head, elbows pointing up. Extend back up.', 'Tenez un haltère au-dessus de la tête à deux mains. Descendez derrière la tête, coudes vers le haut. Remontez.', 'beginner'),
('Cable Tricep Pushdown', 'Extension triceps poulie haute', 'triceps', '{}', 'cable', 'isolation', 'High pulley, rope or bar. Elbows pinned at sides, extend forearms down. Squeeze at bottom.', 'Poulie haute, corde ou barre. Coudes au corps, tendez les avant-bras vers le bas. Contractez en bas.', 'beginner'),
('Diamond Push-Up', 'Pompes diamant', 'triceps', '{chest}', 'bodyweight', 'compound', 'Hands together forming a diamond under chest. Lower chest to hands, elbows close to body. Push back up.', 'Mains rapprochées en diamant sous la poitrine. Descendez, coudes au corps. Remontez.', 'intermediate'),
('Machine Tricep Dip', 'Dips triceps machine', 'triceps', '{chest,shoulders}', 'machine', 'compound', 'Adjust seat, grip handles. Push down until arms are extended. Slow negative back to start.', 'Ajustez le siège, saisissez les poignées. Poussez jusqu''à l''extension. Négatif lent.', 'beginner'),

-- ============================================================================
-- QUADS
-- ============================================================================
('Barbell Back Squat', 'Squat barre arrière', 'quads', '{glutes,hamstrings}', 'barbell', 'compound', 'Bar on upper traps, feet shoulder-width. Sit back and down to parallel or below. Drive through whole foot.', 'Barre sur les trapèzes, pieds largeur d''épaules. Descendez en parallèle ou plus bas. Poussez avec tout le pied.', 'intermediate'),
('Dumbbell Goblet Squat', 'Squat goblet haltère', 'quads', '{glutes}', 'dumbbell', 'compound', 'Hold dumbbell at chest, elbows inside knees. Squat deep, chest up. Push through heels to stand.', 'Tenez l''haltère à la poitrine, coudes à l''intérieur des genoux. Descendez, poitrine haute. Poussez avec les talons.', 'beginner'),
('Leg Press', 'Presse à cuisses', 'quads', '{glutes,hamstrings}', 'machine', 'compound', 'Feet shoulder-width on platform. Lower until 90° knee bend. Press up without locking knees.', 'Pieds largeur d''épaules sur la plateforme. Descendez à 90°. Poussez sans verrouiller les genoux.', 'beginner'),
('Bodyweight Squat', 'Squat au poids du corps', 'quads', '{glutes}', 'bodyweight', 'compound', 'Feet shoulder-width, arms forward for balance. Sit back to parallel, chest up. Stand tall.', 'Pieds largeur d''épaules, bras devant. Descendez en parallèle, poitrine haute. Remontez.', 'beginner'),
('Cable Goblet Squat', 'Squat goblet poulie', 'quads', '{glutes}', 'cable', 'compound', 'Low pulley, rope handle held at chest. Squat deep with chest up. Stand back up with control.', 'Poulie basse, corde tenue à la poitrine. Descendez, poitrine haute. Remontez avec contrôle.', 'beginner'),
('Band Squat', 'Squat avec bande', 'quads', '{glutes}', 'bands', 'compound', 'Stand on band, loop over shoulders. Squat to parallel, drive up against resistance.', 'Debout sur la bande, passez-la sur les épaules. Descendez en parallèle, poussez contre la résistance.', 'beginner'),

-- ============================================================================
-- HAMSTRINGS
-- ============================================================================
('Barbell Romanian Deadlift', 'Soulevé de terre roumain barre', 'hamstrings', '{glutes,back}', 'barbell', 'compound', 'Shoulder-width grip, slight knee bend. Hinge at hips, lower bar along legs. Feel hamstring stretch, drive hips forward.', 'Prise largeur d''épaules, légère flexion des genoux. Penchez-vous, barre le long des jambes. Sentez l''étirement, poussez les hanches.', 'intermediate'),
('Dumbbell Stiff-Leg Deadlift', 'Soulevé de terre jambes tendues haltères', 'hamstrings', '{glutes,back}', 'dumbbell', 'compound', 'Hold dumbbells in front, minimal knee bend. Hinge forward, lower along legs. Squeeze glutes to stand.', 'Haltères devant, flexion minimale des genoux. Penchez-vous, descendez le long des jambes. Contractez les fessiers.', 'intermediate'),
('Machine Lying Leg Curl', 'Leg curl allongé machine', 'hamstrings', '{}', 'machine', 'isolation', 'Lie face down, pad above heels. Curl toward glutes, squeeze at top. Slow negative.', 'Allongé face vers le bas, pad au-dessus des talons. Montez vers les fessiers, contractez. Négatif lent.', 'beginner'),
('Kettlebell Swing', 'Swing kettlebell', 'hamstrings', '{glutes,back}', 'kettlebell', 'compound', 'Hinge at hips, swing bell between legs. Drive hips forward explosively to chest height. Control the fall.', 'Penchez les hanches, balancez entre les jambes. Poussez les hanches explossivement à hauteur de poitrine. Contrôlez.', 'intermediate'),
('Band Leg Curl', 'Leg curl avec bande', 'hamstrings', '{}', 'bands', 'isolation', 'Anchor band low, loop around ankle. Standing or lying, curl heel toward glute. Slow return.', 'Ancrez la bande en bas, boucle à la cheville. Debout ou allongé, montez le talon vers le fessier. Retour lent.', 'beginner'),

-- ============================================================================
-- GLUTES
-- ============================================================================
('Barbell Hip Thrust', 'Hip thrust barre', 'glutes', '{hamstrings}', 'barbell', 'compound', 'Upper back on bench, bar over hips. Drive hips up until body is straight. Squeeze glutes hard at top.', 'Haut du dos sur le banc, barre sur les hanches. Poussez les hanches. Contractez fort les fessiers en haut.', 'intermediate'),
('Dumbbell Bulgarian Split Squat', 'Squat bulgare haltères', 'glutes', '{quads}', 'dumbbell', 'compound', 'Rear foot elevated on bench. Lower until front thigh is parallel. Drive through front heel.', 'Pied arrière surélevé sur le banc. Descendez jusqu''à la parallèle. Poussez avec le talon avant.', 'intermediate'),
('Cable Pull-Through', 'Pull-through poulie', 'glutes', '{hamstrings}', 'cable', 'compound', 'Face away from low pulley, rope between legs. Hinge at hips, then drive forward squeezing glutes.', 'Dos à la poulie basse, corde entre les jambes. Penchez-vous, puis poussez les hanches en contractant.', 'beginner'),
('Glute Bridge', 'Pont fessier', 'glutes', '{hamstrings}', 'bodyweight', 'isolation', 'Lie on back, feet flat, knees bent. Drive hips up, squeeze glutes at top. Lower with control.', 'Allongé sur le dos, pieds à plat. Poussez les hanches, contractez en haut. Descendez avec contrôle.', 'beginner'),
('Kettlebell Sumo Deadlift', 'Soulevé de terre sumo kettlebell', 'glutes', '{quads,hamstrings}', 'kettlebell', 'compound', 'Wide stance, toes out. Grip kettlebell between feet. Drive through heels, squeeze glutes at top.', 'Position large, pointes de pieds vers l''extérieur. Saisissez le kettlebell. Poussez avec les talons, contractez en haut.', 'beginner'),

-- ============================================================================
-- CALVES
-- ============================================================================
('Barbell Standing Calf Raise', 'Mollets debout barre', 'calves', '{}', 'barbell', 'isolation', 'Bar on traps, balls of feet on elevated surface. Rise onto toes, squeeze at top. Full stretch at bottom.', 'Barre sur les trapèzes, avant-pieds surélevés. Montez sur les orteils, contractez. Étirement complet en bas.', 'beginner'),
('Machine Seated Calf Raise', 'Mollets assis machine', 'calves', '{}', 'machine', 'isolation', 'Sit with pad on knees, balls of feet on platform. Rise onto toes, hold at top. Full stretch.', 'Assis, pad sur les genoux, avant-pieds sur la plateforme. Montez, tenez en haut. Étirement complet.', 'beginner'),
('Bodyweight Single-Leg Calf Raise', 'Mollets unipodal poids du corps', 'calves', '{}', 'bodyweight', 'isolation', 'Stand on one foot on a step edge. Rise onto toes, pause at top. Lower below step for full stretch.', 'Sur un pied au bord d''une marche. Montez sur les orteils, pause. Descendez sous la marche pour l''étirement.', 'beginner'),

-- ============================================================================
-- ABS
-- ============================================================================
('Cable Woodchop', 'Woodchop poulie', 'abs', '{shoulders}', 'cable', 'compound', 'High pulley, rotate torso diagonally downward. Keep arms extended, rotate from core. Control return.', 'Poulie haute, rotation du torse en diagonale vers le bas. Bras tendus, rotation du tronc. Contrôlez le retour.', 'intermediate'),
('Dumbbell Russian Twist', 'Rotation russe haltère', 'abs', '{}', 'dumbbell', 'isolation', 'Sit with knees bent, lean back slightly. Hold dumbbell at chest, rotate side to side.', 'Assis, genoux fléchis, penché en arrière. Haltère à la poitrine, tournez de chaque côté.', 'beginner'),
('Hanging Leg Raise', 'Relevé de jambes suspendu', 'abs', '{}', 'bodyweight', 'isolation', 'Hang from bar, legs straight. Raise legs to 90° or higher. Lower with control, no swinging.', 'Suspendu à la barre, jambes droites. Montez les jambes à 90° ou plus. Descendez sans balancer.', 'advanced'),
('Plank', 'Planche', 'abs', '{shoulders}', 'bodyweight', 'isolation', 'Forearms and toes on floor, body straight. Squeeze glutes and core. Hold position, breathe steadily.', 'Avant-bras et orteils au sol, corps droit. Contractez fessiers et abdos. Maintenez, respirez.', 'beginner'),
('Machine Crunch', 'Crunch machine', 'abs', '{}', 'machine', 'isolation', 'Adjust seat, grip handles. Crunch down by flexing spine. Squeeze abs at bottom. Slow return.', 'Ajustez le siège, saisissez les poignées. Crunchez en fléchissant la colonne. Contractez en bas. Retour lent.', 'beginner'),
('Band Pallof Press', 'Pallof press avec bande', 'abs', '{}', 'bands', 'isolation', 'Anchor band at chest height, sideways. Press handles straight out, resist rotation. Hold, then return.', 'Ancrez la bande à hauteur de poitrine, de côté. Poussez les poignées devant vous, résistez à la rotation.', 'beginner');
