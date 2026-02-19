import { useCallback, useRef } from 'react'
import GorhomBottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet'
import { YStack } from 'tamagui'
import { colors, radii } from '@/lib/theme'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  snapPoints?: (string | number)[]
  children: React.ReactNode
}

export function BottomSheet({
  open,
  onClose,
  snapPoints = ['40%'],
  children,
}: BottomSheetProps) {
  const ref = useRef<GorhomBottomSheet>(null)

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
      />
    ),
    [],
  )

  if (!open) return null

  return (
    <GorhomBottomSheet
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: colors.gray6, width: 36 }}
      backgroundStyle={{
        backgroundColor: colors.gray2,
        borderRadius: radii.lg,
      }}
    >
      <BottomSheetView>
        <YStack padding={16}>{children}</YStack>
      </BottomSheetView>
    </GorhomBottomSheet>
  )
}
