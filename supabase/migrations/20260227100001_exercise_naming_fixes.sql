-- Fix dumbbell overhead press naming (match barbell convention) + add missing fundamentals

-- Rename for consistency with "Barbell Overhead Press" / "Barbell Seated Overhead Press"
UPDATE public.exercises
SET name_en = 'Dumbbell Overhead Press',
    name_fr = 'Développé militaire haltères'
WHERE name_en = 'Dumbbell Standing Shoulder Press';

UPDATE public.exercises
SET name_en = 'Dumbbell Seated Overhead Press',
    name_fr = 'Développé militaire assis haltères'
WHERE name_en = 'Dumbbell Seated Shoulder Press';

-- Add missing fundamental exercises
INSERT INTO public.exercises (name_en, name_fr, muscle_primary, muscle_secondary, equipment, category, cues_en, cues_fr, difficulty, movement_pattern) VALUES
('EZ-Bar Curl', 'Curl barre EZ', 'biceps', '{forearms}', 'barbell', 'isolation', 'Grip EZ-bar at angled portions. Curl up keeping elbows pinned to sides. Squeeze at top, lower with control. The angled grip reduces wrist strain.', 'Saisissez la barre EZ aux parties coudées. Montez en gardant les coudes collés. Contractez en haut, descendez avec contrôle. La prise coudée réduit la tension aux poignets.', 'beginner', 'pull'),
('Cable Standing Row', 'Tirage debout poulie', 'back', '{biceps,shoulders}', 'cable', 'compound', 'Stand facing cable at chest height. Pull handle to torso, squeezing shoulder blades together. Extend arms with control. Keep core braced and avoid swaying.', 'Debout face à la poulie à hauteur de poitrine. Tirez vers le torse en serrant les omoplates. Étendez les bras avec contrôle. Gainez et évitez de balancer.', 'beginner', 'pull');
