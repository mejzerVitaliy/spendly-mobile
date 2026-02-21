import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { PropsWithChildren, ReactNode } from 'react';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';

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
      backdropOpacity = 0.5,
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
    const resolvedEnableDynamicSizing = enableDynamicSizing ?? (!snapPointsProp || snapPointsProp.length === 0 ? true : false);

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

    useImperativeHandle(
      ref,
      () => ({
        open: openSheet,
        close: closeSheet,
        snapTo,
        toggle: toggleSheet,
      }),
      [closeSheet, openSheet, snapTo, toggleSheet],
    );

    useEffect(() => {
      if (open === undefined) return;
      if (open) {
        openSheet(openIndex);
      } else {
        closeSheet();
      }
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
      [backdropOpacity]
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
  }
);

BottomSheet.displayName = 'BottomSheet';

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  bottomSheetBackground: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: '#D1D5DB',
    width: 40,
  },
});

export { BottomSheet };
