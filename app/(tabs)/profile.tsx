import { useEffect, useRef, useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch as RNSwitch, TextInput, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { XStack, YStack } from 'tamagui'
import { useTranslation } from 'react-i18next'
import { signOut } from '@/lib/auth'
import { saveLocale } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'
import { useUserStore, type UserRow } from '@/stores/useUserStore'
import { useUpdateProfile, parseLimitations, formatLimitations } from '@/hooks/useUpdateProfile'
import type { ExperienceLevel, Goal, Sex } from '@/lib/types'
import { GOAL_CATEGORIES } from '@/lib/types'
import { AppText } from '@/components/ui/AppText'
import { AppButton } from '@/components/ui/AppButton'
import { AppCard } from '@/components/ui/AppCard'
import { PillSelector } from '@/components/ui/PillSelector'
import { RulerPicker } from '@/components/ui/RulerPicker'
import { SelectionCard } from '@/components/ui/SelectionCard'
import { Divider } from '@/components/ui/Divider'
import { colors, card, radii, semantic } from '@/lib/theme'
import { hapticNotification } from '@/lib/animations'

const EQUIPMENT = [
  'barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'bands', 'kettlebell',
] as const

// Tab bar content area height (CustomTabBar: paddingTop 8 + tab ~48)
const TAB_BAR_CONTENT_HEIGHT = 60

function SexCard({
  label, value, onSelect, options, accessibilityLabel,
}: {
  label: string; value: string | null; onSelect: (v: string) => void
  options: { value: string; label: string }[]; accessibilityLabel: string
}) {
  return (
    <View style={sexStyles.row} accessibilityLabel={accessibilityLabel}>
      <AppText preset="caption" color={colors.gray7}>
        {label}
      </AppText>
      <View style={sexStyles.segmentedControl}>
        {options.map((opt) => {
          const isSelected = opt.value === value
          return (
            <Pressable
              key={opt.value}
              onPress={() => onSelect(opt.value)}
              style={[sexStyles.segment, isSelected && sexStyles.segmentSelected]}
              accessibilityLabel={opt.label}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <AppText
                fontSize={13}
                fontWeight={isSelected ? '600' : '400'}
                color={isSelected ? '#FFFFFF' : colors.gray7}
              >
                {opt.label}
              </AppText>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const sexStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray5,
    backgroundColor: colors.gray3,
    width: 160,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSelected: {
    backgroundColor: colors.accent,
  },
})

// ── Profile Screen ──────────────────────────────────────────
export default function ProfileScreen() {
  const { t, i18n } = useTranslation()
  const insets = useSafeAreaInsets()
  const {
    displayName, experienceLevel, goals, equipment, locale,
    limitations, daysPerWeek, sex, age, heightCm, weightKg,
    defaultRestSeconds, restSecondsSuccess, restSecondsFailure, setUser,
  } = useUserStore()
  const updateProfile = useUpdateProfile()
  const [signOutLoading, setSignOutLoading] = useState(false)

  // Local editable state — initialized from store
  const [localExperience, setLocalExperience] = useState<ExperienceLevel | null>(experienceLevel)
  const [localGoals, setLocalGoals] = useState<Goal[]>(goals)
  const [localEquipment, setLocalEquipment] = useState(equipment)
  const [localDaysPerWeek, setLocalDaysPerWeek] = useState(daysPerWeek)
  const [localLimitations, setLocalLimitations] = useState(formatLimitations(limitations))
  const [localLocale, setLocalLocale] = useState(locale)
  const [localSex, setLocalSex] = useState<Sex | null>(sex)
  const [localAge, setLocalAge] = useState<number | null>(age)
  const [localHeightCm, setLocalHeightCm] = useState<number | null>(heightCm)
  const [localWeightKg, setLocalWeightKg] = useState<number | null>(weightKg)
  const [localDefaultRestSeconds, setLocalDefaultRestSeconds] = useState<number | null>(defaultRestSeconds)
  const [localRestSecondsSuccess, setLocalRestSecondsSuccess] = useState<number | null>(restSecondsSuccess)
  const [localRestSecondsFailure, setLocalRestSecondsFailure] = useState<number | null>(restSecondsFailure)

  // Save state
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Limitations focus state
  const [limitationsFocused, setLimitationsFocused] = useState(false)

  // Re-sync local state if store updates externally (e.g., session restore)
  const localAdaptiveEnabled = localRestSecondsSuccess !== null

  function handleToggleAdaptive(checked: boolean) {
    if (checked) {
      setLocalRestSecondsSuccess(localDefaultRestSeconds ?? 90)
      setLocalRestSecondsFailure((localDefaultRestSeconds ?? 90) * 2)
    } else {
      setLocalRestSecondsSuccess(null)
      setLocalRestSecondsFailure(null)
    }
  }

  const storeRef = useRef({
    experienceLevel, goals, equipment, daysPerWeek, limitations, locale,
    sex, age, heightCm, weightKg, defaultRestSeconds, restSecondsSuccess, restSecondsFailure,
  })
  useEffect(() => {
    const prev = storeRef.current
    if (
      prev.experienceLevel !== experienceLevel ||
      JSON.stringify(prev.goals) !== JSON.stringify(goals) ||
      JSON.stringify(prev.equipment) !== JSON.stringify(equipment) ||
      prev.daysPerWeek !== daysPerWeek ||
      JSON.stringify(prev.limitations) !== JSON.stringify(limitations) ||
      prev.locale !== locale ||
      prev.sex !== sex ||
      prev.age !== age ||
      prev.heightCm !== heightCm ||
      prev.weightKg !== weightKg ||
      prev.defaultRestSeconds !== defaultRestSeconds ||
      prev.restSecondsSuccess !== restSecondsSuccess ||
      prev.restSecondsFailure !== restSecondsFailure
    ) {
      setLocalExperience(experienceLevel)
      setLocalGoals(goals)
      setLocalEquipment(equipment)
      setLocalDaysPerWeek(daysPerWeek)
      setLocalLimitations(formatLimitations(limitations))
      setLocalLocale(locale)
      setLocalSex(sex)
      setLocalAge(age)
      setLocalHeightCm(heightCm)
      setLocalWeightKg(weightKg)
      setLocalDefaultRestSeconds(defaultRestSeconds)
      setLocalRestSecondsSuccess(restSecondsSuccess)
      setLocalRestSecondsFailure(restSecondsFailure)
      storeRef.current = {
        experienceLevel, goals, equipment, daysPerWeek, limitations, locale,
        sex, age, heightCm, weightKg, defaultRestSeconds, restSecondsSuccess, restSecondsFailure,
      }
    }
  }, [experienceLevel, goals, equipment, daysPerWeek, limitations, locale, sex, age, heightCm, weightKg, defaultRestSeconds, restSecondsSuccess, restSecondsFailure])

  // Revert language on unmount if unsaved
  useEffect(() => {
    return () => {
      const storeLocale = useUserStore.getState().locale
      if (i18n.language !== storeLocale) {
        i18n.changeLanguage(storeLocale)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fallback: fetch profile if store is empty (e.g. syncUserProfile race condition)
  useEffect(() => {
    if (displayName) return

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return

      try {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (data) {
          const row = data as UserRow
          setUser({
            id: row.id,
            displayName: row.display_name,
            experienceLevel: row.experience_level as ExperienceLevel | null,
            goals: (row.goals as Goal[]) ?? [],
            equipment: row.equipment ?? [],
            locale: (row.locale as 'en' | 'fr') ?? 'en',
            isOnboarded: row.is_onboarded ?? false,
            limitations: row.limitations ?? [],
            daysPerWeek: row.schedule?.days_per_week ?? null,
            sex: (row.sex as Sex | null) ?? null,
            age: row.age ?? null,
            heightCm: row.height_cm ?? null,
            weightKg: row.weight_kg ?? null,
            defaultRestSeconds: row.default_rest_seconds ?? null,
            restSecondsSuccess: row.rest_seconds_success ?? null,
            restSecondsFailure: row.rest_seconds_failure ?? null,
          })
        }
      } catch {
        // Silently fail — profile will show fallback text
      }
    })
  }, [displayName, setUser])

  // Clear success timer on unmount
  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current)
    }
  }, [])

  // Compute isDirty
  const parsedLimitations = parseLimitations(localLimitations)

  const isDirty =
    localExperience !== experienceLevel ||
    JSON.stringify([...localGoals].sort()) !== JSON.stringify([...goals].sort()) ||
    JSON.stringify([...localEquipment].sort()) !== JSON.stringify([...equipment].sort()) ||
    localDaysPerWeek !== daysPerWeek ||
    JSON.stringify(parsedLimitations) !== JSON.stringify(limitations) ||
    localLocale !== locale ||
    localSex !== sex ||
    localAge !== age ||
    localHeightCm !== heightCm ||
    localWeightKg !== weightKg ||
    localDefaultRestSeconds !== defaultRestSeconds ||
    localRestSecondsSuccess !== restSecondsSuccess ||
    localRestSecondsFailure !== restSecondsFailure

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    const parsed = parseLimitations(localLimitations)

    // Build payload of only changed fields
    const payload: Record<string, unknown> = {}
    if (localExperience !== experienceLevel) payload.experience_level = localExperience
    if (JSON.stringify([...localGoals].sort()) !== JSON.stringify([...goals].sort())) {
      payload.goals = localGoals
    }
    if (JSON.stringify([...localEquipment].sort()) !== JSON.stringify([...equipment].sort())) {
      payload.equipment = localEquipment
    }
    if (localDaysPerWeek !== daysPerWeek) {
      payload.schedule = { days_per_week: localDaysPerWeek }
    }
    if (JSON.stringify(parsed) !== JSON.stringify(limitations)) {
      payload.limitations = parsed
    }
    if (localLocale !== locale) payload.locale = localLocale
    if (localSex !== sex) payload.sex = localSex
    if (localAge !== age) payload.age = localAge
    if (localHeightCm !== heightCm) payload.height_cm = localHeightCm
    if (localWeightKg !== weightKg) payload.weight_kg = localWeightKg
    if (localDefaultRestSeconds !== defaultRestSeconds) payload.default_rest_seconds = localDefaultRestSeconds
    if (localRestSecondsSuccess !== restSecondsSuccess) payload.rest_seconds_success = localRestSecondsSuccess
    if (localRestSecondsFailure !== restSecondsFailure) payload.rest_seconds_failure = localRestSecondsFailure

    try {
      await updateProfile.mutateAsync(payload as any)

      // Update store on success
      setUser({
        experienceLevel: localExperience,
        goals: localGoals,
        equipment: localEquipment,
        daysPerWeek: localDaysPerWeek,
        limitations: parsed,
        locale: localLocale as 'en' | 'fr',
        sex: localSex,
        age: localAge,
        heightCm: localHeightCm,
        weightKg: localWeightKg,
        defaultRestSeconds: localDefaultRestSeconds,
        restSecondsSuccess: localRestSecondsSuccess,
        restSecondsFailure: localRestSecondsFailure,
      })

      // Update ref so re-sync effect doesn't re-fire
      storeRef.current = {
        experienceLevel: localExperience,
        goals: localGoals,
        equipment: localEquipment,
        daysPerWeek: localDaysPerWeek,
        limitations: parsed,
        locale: localLocale,
        sex: localSex,
        age: localAge,
        heightCm: localHeightCm,
        weightKg: localWeightKg,
        defaultRestSeconds: localDefaultRestSeconds,
        restSecondsSuccess: localRestSecondsSuccess,
        restSecondsFailure: localRestSecondsFailure,
      }

      // Persist locale to AsyncStorage for fast cold-start
      if (localLocale !== locale) saveLocale(localLocale)

      // Show brief success confirmation before hiding save bar
      hapticNotification()
      setSaveSuccess(true)
      if (successTimerRef.current) clearTimeout(successTimerRef.current)
      successTimerRef.current = setTimeout(() => setSaveSuccess(false), 1800)

    } catch (err) {
      console.error('[Profile] Save failed:', err)
      setSaveError(t('profile.saveError'))
      // Revert language if it was changed
      if (localLocale !== locale) {
        i18n.changeLanguage(locale)
        setLocalLocale(locale)
      }
    } finally {
      setSaving(false)
    }
  }

  function handleLanguageSelect(value: string) {
    setLocalLocale(value as 'en' | 'fr')
    i18n.changeLanguage(value)
  }

  function toggleGoal(value: Goal) {
    setLocalGoals((prev) =>
      prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value]
    )
  }

  function toggleEquipmentItem(item: string) {
    setLocalEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    )
  }

  function handleSignOut() {
    Alert.alert(t('auth.signOut'), t('auth.signOutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.signOut'),
        style: 'destructive',
        onPress: async () => {
          setSignOutLoading(true)
          try {
            await signOut()
          } finally {
            setSignOutLoading(false)
          }
        },
      },
    ])
  }

  // Goal label map
  const goalLabels: Record<Goal, string> = {
    strength: t('profile.goals.strength'),
    hypertrophy: t('profile.goals.hypertrophy'),
    general_fitness: t('profile.goals.generalFitness'),
    body_recomp: t('profile.goals.bodyRecomp'),
    powerlifting: t('profile.goals.powerlifting'),
    weight_loss: t('profile.goals.weightLoss'),
    endurance: t('profile.goals.endurance'),
    athletic_performance: t('profile.goals.athleticPerformance'),
    calisthenics: t('profile.goals.calisthenics'),
    flexibility: t('profile.goals.flexibility'),
    cardio: t('profile.goals.cardio'),
  }

  // Options arrays
  const experienceOptions = [
    { value: 'beginner', label: t('profile.beginner') },
    { value: 'intermediate', label: t('profile.intermediate') },
    { value: 'advanced', label: t('profile.advanced') },
  ]
  const daysOptions = [1, 2, 3, 4, 5, 6, 7].map(n => ({ value: String(n), label: String(n) }))
  const languageOptions = [
    { value: 'en', label: t('profile.languageEn') },
    { value: 'fr', label: t('profile.languageFr') },
  ]
  const sexOptions = [
    { value: 'male', label: t('profile.male') },
    { value: 'female', label: t('profile.female') },
  ]

  // Save bar sits above the absolutely-positioned tab bar
  const saveBarBottomPad = TAB_BAR_CONTENT_HEIGHT + insets.bottom
  // ScrollView needs to scroll past both save bar and tab bar
  const scrollPadBottom = 68 + saveBarBottomPad + 16

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray1 }} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: scrollPadBottom }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Page title */}
          <YStack paddingHorizontal={16} paddingTop={16} paddingBottom={8}>
            <AppText fontSize={28} fontWeight="800" color={colors.gray12}>
              {t('tabs.profile')}
            </AppText>
          </YStack>

          <YStack paddingHorizontal={16} gap={24} paddingTop={16}>

            {/* ── 1. Display Name ── */}
            <AppCard>
              <AppText preset="caption" color={colors.gray7} marginBottom={4}>
                {t('profile.displayName')}
              </AppText>
              <AppText preset="exerciseName" color={colors.gray11}>
                {displayName ?? '—'}
              </AppText>
            </AppCard>

            {/* ── 2. Physical Profile ── */}
            <YStack gap={12}>
              <AppText preset="label" color={colors.gray8}>
                {t('profile.physicalProfile')}
              </AppText>
              <AppCard>
                <SexCard
                  label={t('profile.sex')}
                  value={localSex}
                  onSelect={(v) => setLocalSex(v as Sex)}
                  options={sexOptions}
                  accessibilityLabel={t('profile.sex')}
                />
                <Divider marginVertical={14} />
                <RulerPicker
                  embedded
                  label={t('profile.age')}
                  value={localAge}
                  onValueChange={setLocalAge}
                  min={14}
                  max={80}
                  step={1}
                  majorEvery={10}
                  midEvery={5}
                  unit={t('profile.rulerYears')}
                  accessibilityLabel={t('profile.age')}
                />
                <Divider marginVertical={14} />
                <RulerPicker
                  embedded
                  label={t('profile.heightCm')}
                  value={localHeightCm}
                  onValueChange={setLocalHeightCm}
                  min={120}
                  max={220}
                  step={1}
                  majorEvery={10}
                  midEvery={5}
                  unit="cm"
                  accessibilityLabel={t('profile.heightCm')}
                />
                <Divider marginVertical={14} />
                <RulerPicker
                  embedded
                  label={t('profile.weightKg')}
                  value={localWeightKg}
                  onValueChange={setLocalWeightKg}
                  min={30}
                  max={200}
                  step={0.5}
                  majorEvery={10}
                  midEvery={5}
                  unit="kg"
                  accessibilityLabel={t('profile.weightKg')}
                />
              </AppCard>
            </YStack>

            {/* ── 3. Training Preferences ── */}
            <YStack gap={16}>
              <AppText preset="label" color={colors.gray8}>
                {t('profile.trainingProfile')}
              </AppText>

              {/* Days per week */}
              <AppCard>
                <AppText preset="caption" color={colors.gray7} marginBottom={8}>
                  {t('profile.daysPerWeek')}
                </AppText>
                <PillSelector
                  options={daysOptions}
                  selected={localDaysPerWeek != null ? String(localDaysPerWeek) : null}
                  onSelect={(v) => setLocalDaysPerWeek(parseInt(v, 10))}
                  accessibilityLabel={t('profile.daysPerWeek')}
                />
              </AppCard>

              {/* Experience Level */}
              <AppCard>
                <AppText preset="caption" color={colors.gray7} marginBottom={8}>
                  {t('profile.experienceLevel')}
                </AppText>
                <PillSelector
                  options={experienceOptions}
                  selected={localExperience}
                  onSelect={(v) => setLocalExperience(v as ExperienceLevel)}
                  accessibilityLabel={t('profile.experienceLevel')}
                />
              </AppCard>

              {/* Rest Timer */}
              <AppCard>
                <AppText preset="caption" color={colors.gray7} marginBottom={8}>
                  {t('profile.restTimerSection')}
                </AppText>
                <XStack justifyContent="space-between" alignItems="center">
                  <AppText preset="caption" color={colors.gray7}>
                    {t('profile.defaultRestDuration')}
                  </AppText>
                  <XStack alignItems="center" gap={6}>
                    <TextInput
                      value={localDefaultRestSeconds != null ? String(localDefaultRestSeconds) : ''}
                      onChangeText={(text) => {
                        const n = parseInt(text, 10)
                        setLocalDefaultRestSeconds(Number.isNaN(n) ? null : Math.max(0, n))
                      }}
                      keyboardType="number-pad"
                      style={styles.restInput}
                      accessibilityLabel={t('profile.defaultRestDuration')}
                      maxLength={3}
                      placeholder="90"
                      placeholderTextColor={colors.gray5}
                    />
                    <AppText preset="caption" color={colors.gray7}>
                      {t('profile.restUnit')}
                    </AppText>
                  </XStack>
                </XStack>
                <Divider marginVertical={14} />
                <XStack justifyContent="space-between" alignItems="center" marginBottom={8}>
                  <AppText preset="caption" color={colors.gray7}>
                    {t('profile.adaptiveRest')}
                  </AppText>
                  <RNSwitch
                    value={localAdaptiveEnabled}
                    onValueChange={handleToggleAdaptive}
                    trackColor={{ false: colors.gray5, true: colors.accent }}
                    thumbColor="#FFFFFF"
                    style={{ transform: [{ scale: 0.8 }] }}
                  />
                </XStack>
                <AppText preset="chipLabel" color={colors.gray6} marginBottom={12}>
                  {t('profile.adaptiveRestDescription')}
                </AppText>
                {localAdaptiveEnabled && (
                  <>
                    <XStack justifyContent="space-between" alignItems="center">
                      <AppText preset="caption" color={colors.gray7}>
                        {t('profile.restAfterSuccess')}
                      </AppText>
                      <XStack alignItems="center" gap={6}>
                        <TextInput
                          value={localRestSecondsSuccess != null ? String(localRestSecondsSuccess) : ''}
                          onChangeText={(text) => {
                            const n = parseInt(text, 10)
                            setLocalRestSecondsSuccess(Number.isNaN(n) ? null : Math.max(0, n))
                          }}
                          keyboardType="number-pad"
                          style={styles.restInput}
                          accessibilityLabel={t('profile.restAfterSuccess')}
                          maxLength={3}
                          placeholder="90"
                          placeholderTextColor={colors.gray5}
                        />
                        <AppText preset="caption" color={colors.gray7}>
                          {t('profile.restUnit')}
                        </AppText>
                      </XStack>
                    </XStack>
                    <Divider marginVertical={14} />
                    <XStack justifyContent="space-between" alignItems="center">
                      <AppText preset="caption" color={colors.gray7}>
                        {t('profile.restAfterFailure')}
                      </AppText>
                      <XStack alignItems="center" gap={6}>
                        <TextInput
                          value={localRestSecondsFailure != null ? String(localRestSecondsFailure) : ''}
                          onChangeText={(text) => {
                            const n = parseInt(text, 10)
                            setLocalRestSecondsFailure(Number.isNaN(n) ? null : Math.max(0, n))
                          }}
                          keyboardType="number-pad"
                          style={styles.restInput}
                          accessibilityLabel={t('profile.restAfterFailure')}
                          maxLength={3}
                          placeholder="180"
                          placeholderTextColor={colors.gray5}
                        />
                        <AppText preset="caption" color={colors.gray7}>
                          {t('profile.restUnit')}
                        </AppText>
                      </XStack>
                    </XStack>
                  </>
                )}
              </AppCard>
            </YStack>

            {/* ── 4. Training Goals ── */}
            <AppCard>
              <AppText preset="caption" color={colors.gray7} marginBottom={4}>
                {t('profile.goals.label')}
              </AppText>
              {GOAL_CATEGORIES.map((category) => (
                <View key={category.key}>
                  <AppText
                    preset="chipLabel"
                    color={colors.gray8}
                    marginTop={12}
                    marginBottom={6}
                  >
                    {t(`profile.goals.category.${category.key}`)}
                  </AppText>
                  <View style={styles.grid}>
                    {category.goals.map((goalValue) => (
                      <View key={goalValue} style={styles.gridItem}>
                        <SelectionCard
                          compact
                          label={goalLabels[goalValue]}
                          selected={localGoals.includes(goalValue)}
                          onPress={() => toggleGoal(goalValue)}
                          accessibilityLabel={goalLabels[goalValue]}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </AppCard>

            {/* ── 5. Equipment ── */}
            <AppCard>
              <AppText preset="caption" color={colors.gray7} marginBottom={8}>
                {t('profile.equipmentLabel')}
              </AppText>
              <View style={styles.grid}>
                {EQUIPMENT.map((item) => (
                  <View key={item} style={styles.gridItem}>
                    <SelectionCard
                      compact
                      label={t(`exercises.equipment.${item}`)}
                      selected={localEquipment.includes(item)}
                      onPress={() => toggleEquipmentItem(item)}
                      accessibilityLabel={t(`exercises.equipment.${item}`)}
                    />
                  </View>
                ))}
              </View>
            </AppCard>

            {/* ── 6. Limitations / Injuries ── */}
            <AppCard>
              <AppText preset="caption" color={colors.gray7} marginBottom={8}>
                {t('profile.limitationsLabel')}
              </AppText>
              <View
                style={[
                  styles.limitationsContainer,
                  limitationsFocused && styles.limitationsContainerFocused,
                ]}
              >
                <TextInput
                  value={localLimitations}
                  onChangeText={setLocalLimitations}
                  onFocus={() => setLimitationsFocused(true)}
                  onBlur={() => setLimitationsFocused(false)}
                  placeholder={t('profile.limitationsPlaceholder')}
                  placeholderTextColor={colors.gray7}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={styles.limitationsInput}
                  accessibilityLabel={t('profile.limitationsLabel')}
                />
              </View>
              <AppText preset="caption" color={colors.gray7} marginTop={6}>
                {t('profile.limitationsHint')}
              </AppText>
            </AppCard>

            {/* ── 7. Secondary Settings ── */}
            <YStack gap={16}>
              <AppText preset="label" color={colors.gray8}>
                {t('profile.preferences')}
              </AppText>

              {/* Language */}
              <AppCard>
                <AppText preset="caption" color={colors.gray7} marginBottom={8}>
                  {t('profile.language')}
                </AppText>
                <PillSelector
                  options={languageOptions}
                  selected={i18n.language}
                  onSelect={handleLanguageSelect}
                  accessibilityLabel={t('profile.language')}
                />
              </AppCard>
            </YStack>

            {/* Sign Out */}
            <YStack alignItems="center" paddingTop={16}>
              <AppButton
                variant="destructive"
                onPress={handleSignOut}
                disabled={signOutLoading}
                loading={signOutLoading}
                accessibilityLabel={t('auth.signOut')}
              >
                {t('auth.signOut')}
              </AppButton>
            </YStack>
          </YStack>
        </ScrollView>

        {/* ── Floating save / success ── */}
        {(isDirty || saveError) && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(250)}
            style={[styles.floatingBar, { bottom: saveBarBottomPad + 4 }]}
          >
            {saveError && (
              <AppText preset="caption" color={semantic.regression} textAlign="center" marginBottom={8}>
                {saveError}
              </AppText>
            )}
            <AppButton
              variant="primary"
              fullWidth
              onPress={handleSave}
              loading={saving}
              disabled={saving}
              accessibilityLabel={t('common.save')}
            >
              {t('common.save')}
            </AppButton>
          </Animated.View>
        )}

        {saveSuccess && !isDirty && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(250)}
            style={[styles.floatingBar, { bottom: saveBarBottomPad + 4 }]}
          >
            <View style={styles.successPill}>
              <AppText fontSize={15} fontWeight="600" color={semantic.progress}>
                {t('profile.saved')}
              </AppText>
            </View>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    width: '48%',
  },
  limitationsContainer: {
    backgroundColor: colors.gray3,
    borderWidth: 1,
    borderColor: colors.gray5,
    borderRadius: radii.card,
    padding: 12,
    minHeight: 100,
  },
  limitationsContainerFocused: {
    borderColor: colors.accent,
  },
  limitationsInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: colors.gray11,
    minHeight: 76,
    textAlignVertical: 'top',
    padding: 0,
  },
  restInput: {
    backgroundColor: colors.gray3,
    borderWidth: 1,
    borderColor: colors.gray5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: colors.gray11,
    width: 64,
    textAlign: 'center',
  },
  floatingBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  successPill: {
    backgroundColor: '#0B2A1A',
    borderWidth: 1,
    borderColor: '#1A4D33',
    borderRadius: radii.button,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
})
