import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { PropsWithChildren, ReactNode } from 'react';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '@/shared/theme';

export interface BottomSheetRef {
  open: (index?: number) => void;
  close: () => void;
  snapTo: (index: number) => void;
  toggle: (preferredIndex?: number) => void;
}

interface BottomSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  snapPoints?: string[] | number[];
  openIndex?: number;
  enablePanDownToClose?: boolean;
  enableContentPanningGesture?: boolean;
  enableHandlePanningGesture?: boolean;
  enableDynamicSizing?: boolean;
  maxDynamicContentSize?: number;
  enableOverDrag?: boolean;
  backdropOpacity?: number;
  keyboardBehavior?: 'extend' | 'fillParent' | 'interactive';
  keyboardBlurBehavior?: 'none' | 'restore';
  android_keyboardInputMode?: 'adjustPan' | 'adjustResize';
  noWrapper?: boolean;
  children: ReactNode;
  trigger?: (controls: {
    open: (index?: number) => void;
    close: () => void;
    toggle: (preferredIndex?: number) => void;
    snapTo: (index: number) => void;
  }) => ReactNode;
}

const GlassBackground = () => {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={55}
        tint="systemUltraThinMaterialDark"
        style={[StyleSheet.absoluteFillObject, styles.backgroundBase]}
      />
    );
  }
  return (
    <View style={[StyleSheet.absoluteFillObject, styles.backgroundBase, { backgroundColor: colors.card }]} />
  );
};

const BottomSheet = forwardRef<BottomSheetRef, PropsWithChildren<BottomSheetProps>>(
  (
    {
      open,
      onOpenChange,
      snapPoints: snapPointsProp,
      openIndex = 0,
      enablePanDownToClose = true,
      enableContentPanningGesture,
      enableHandlePanningGesture,
      enableDynamicSizing,
      maxDynamicContentSize,
      enableOverDrag = false,
      backdropOpacity = 0.6,
      keyboardBehavior,
      keyboardBlurBehavior,
      android_keyboardInputMode,
      noWrapper = false,
      children,
      trigger,
    },
    ref,
  ) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const resolvedEnableDynamicSizing = enableDynamicSizing ?? (!snapPointsProp || snapPointsProp.length === 0);

    const snapPoints = useMemo(() => {
      if (resolvedEnableDynamicSizing) return undefined;
      if (!snapPointsProp || snapPointsProp.length === 0) return ['100%'];
      return snapPointsProp;
    }, [snapPointsProp, resolvedEnableDynamicSizing]);

    const currentIndexRef = useRef<number>(-1);

    const openSheet = useCallback(
      (index?: number) => {
        const targetIndex = typeof index === 'number' ? index : openIndex;
        bottomSheetRef.current?.present({ index: targetIndex });
      },
      [openIndex],
    );

    const closeSheet = useCallback(() => bottomSheetRef.current?.dismiss(), []);
    const snapTo = useCallback((index: number) => bottomSheetRef.current?.snapToIndex(index), []);
    const toggleSheet = useCallback(
      (preferredIndex?: number) => {
        if (currentIndexRef.current === -1) openSheet(preferredIndex);
        else closeSheet();
      },
      [closeSheet, openSheet],
    );

    useImperativeHandle(ref, () => ({
      open: openSheet,
      close: closeSheet,
      snapTo,
      toggle: toggleSheet,
    }), [closeSheet, openSheet, snapTo, toggleSheet]);

    useEffect(() => {
      if (open === undefined) return;
      if (open) openSheet(openIndex);
      else closeSheet();
    }, [open, openIndex, openSheet, closeSheet]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={backdropOpacity}
        />
      ),
      [backdropOpacity],
    );

    return (
      <>
        {trigger?.({ open: openSheet, close: closeSheet, toggle: toggleSheet, snapTo })}
        <BottomSheetModal
          ref={bottomSheetRef}
          index={openIndex}
          snapPoints={snapPoints}
          enablePanDownToClose={enablePanDownToClose}
          enableContentPanningGesture={enableContentPanningGesture}
          enableHandlePanningGesture={enableHandlePanningGesture}
          enableDynamicSizing={resolvedEnableDynamicSizing}
          maxDynamicContentSize={maxDynamicContentSize}
          enableOverDrag={enableOverDrag}
          keyboardBehavior={keyboardBehavior}
          keyboardBlurBehavior={keyboardBlurBehavior}
          android_keyboardInputMode={android_keyboardInputMode}
          stackBehavior="push"
          backdropComponent={renderBackdrop}
          backgroundComponent={GlassBackground}
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={styles.handleIndicator}
          onChange={(i) => {
            currentIndexRef.current = i;
            onOpenChange?.(i !== -1);
          }}
        >
          {noWrapper ? children : (
            <BottomSheetView style={styles.contentContainer}>
              {children}
            </BottomSheetView>
          )}
        </BottomSheetModal>
      </>
    );
  },
);

BottomSheet.displayName = 'BottomSheet';

const styles = StyleSheet.create({
  contentContainer: {},
  backgroundBase: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  bottomSheetBackground: {
    backgroundColor: Platform.OS === 'ios' ? 'rgba(10,10,10,0.6)' : colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderBottomWidth: 0,
  },
  handleIndicator: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 36,
    height: 4,
    borderRadius: 2,
  },
});

export { BottomSheet };
