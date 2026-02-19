import { useState } from 'react'
import { Input, YStack, XStack, styled } from 'tamagui'
import type { GetProps } from 'tamagui'
import { colors, radii } from '@/lib/theme'
import { AppText } from './AppText'

const StyledInput = styled(Input, {
  fontFamily: '$body',
  fontSize: 16,
  color: colors.gray11,
  backgroundColor: colors.gray3,
  borderWidth: 1,
  borderColor: colors.gray5,
  borderRadius: radii.button,
  height: 44,
  paddingHorizontal: 12,
  placeholderTextColor: colors.gray7 as any,
})

type StyledInputProps = GetProps<typeof StyledInput>

interface AppInputProps extends StyledInputProps {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function AppInput({
  label,
  error,
  leftIcon,
  rightIcon,
  ...props
}: AppInputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <YStack gap={4}>
      {label && (
        <AppText preset="label" color={colors.gray7}>
          {label}
        </AppText>
      )}
      <XStack alignItems="center">
        {leftIcon && (
          <YStack position="absolute" left={12} zIndex={1}>
            {leftIcon}
          </YStack>
        )}
        <StyledInput
          flex={1}
          borderColor={error ? colors.regression : focused ? colors.accent : colors.gray5}
          paddingLeft={leftIcon ? 40 : 12}
          paddingRight={rightIcon ? 40 : 12}
          onFocus={(e) => {
            setFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
        />
        {rightIcon && (
          <YStack position="absolute" right={12} zIndex={1}>
            {rightIcon}
          </YStack>
        )}
      </XStack>
      {error && (
        <AppText preset="caption" color={colors.regression}>
          {error}
        </AppText>
      )}
    </YStack>
  )
}
