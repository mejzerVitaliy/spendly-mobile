import { useCallback, useMemo, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import GorhomBottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';

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
  backdropOpacity?: number;
  children: ReactNode;
  trigger?: (controls: {
    open: (index?: number) => void;
    close: () => void;
    toggle: (preferredIndex?: number) => void;
    snapTo: (index: number) => void;
  }) => ReactNode;
}

const BottomSheet = forwardRef<BottomSheetRef, React.PropsWithChildren<BottomSheetProps>>(
  ({ open, onOpenChange, snapPoints: snapPointsProp, openIndex = 0, enablePanDownToClose = true, backdropOpacity = 0.5, children, trigger }, ref) => {
    const bottomSheetRef = useRef<GorhomBottomSheet>(null);
    const snapPoints = useMemo(() => snapPointsProp ?? [], [snapPointsProp]);
    const currentIndexRef = useRef<number>(-1);

    const openSheet = (index?: number) => {
      if (typeof index === 'number') bottomSheetRef.current?.snapToIndex(index);
      else if (openIndex != null) bottomSheetRef.current?.snapToIndex(openIndex);
      else bottomSheetRef.current?.expand();
    };

    const closeSheet = () => bottomSheetRef.current?.close();
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
    }), [openIndex, openSheet, toggleSheet]);

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
      <GorhomBottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose={enablePanDownToClose}
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
      </GorhomBottomSheet>
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