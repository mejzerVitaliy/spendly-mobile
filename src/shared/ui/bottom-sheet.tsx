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
      enableOverDrag,
      backdropOpacity = 0.5,
      children,
      trigger,
    },
    ref,
  ) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => {
      if (!snapPointsProp || snapPointsProp.length === 0) return ['100%'];
      return snapPointsProp;
    }, [snapPointsProp]);
    const currentIndexRef = useRef<number>(-1);

    const openSheet = (index?: number) => {
      bottomSheetRef.current?.present();
      const targetIndex = typeof index === 'number' ? index : openIndex;
      requestAnimationFrame(() => {
        bottomSheetRef.current?.snapToIndex(targetIndex);
      });
    };

    const closeSheet = () => bottomSheetRef.current?.dismiss();
    const snapTo = (index: number) => bottomSheetRef.current?.snapToIndex(index);
    const toggleSheet = (preferredIndex?: number) => {
      if (currentIndexRef.current === -1) openSheet(preferredIndex);
      else closeSheet();
    };

    useImperativeHandle(ref, () => ({
      open: openSheet,
      close: closeSheet,
      snapTo,
      toggle: toggleSheet,
    }), [openSheet, toggleSheet]);

    useEffect(() => {
      if (open === undefined) return;
      if (open) {
        openSheet(openIndex);
      } else {
        closeSheet();
      }
    }, [open, openIndex, openSheet]);

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
        enableDynamicSizing={enableDynamicSizing}
        maxDynamicContentSize={maxDynamicContentSize}
        enableOverDrag={enableOverDrag}
        stackBehavior="push"
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        onChange={(i) => {
          currentIndexRef.current = i;
          onOpenChange?.(i !== -1);
        }}
      >
        <BottomSheetView style={styles.contentContainer}>
          {children}
        </BottomSheetView>
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
