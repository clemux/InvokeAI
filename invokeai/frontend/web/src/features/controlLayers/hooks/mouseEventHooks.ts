import { $ctrl, $meta } from '@invoke-ai/ui-library';
import { useStore } from '@nanostores/react';
import { useAppDispatch, useAppSelector } from 'app/store/storeHooks';
import { calculateNewBrushSize } from 'features/canvas/hooks/useCanvasZoom';
import {
  $cursorPosition,
  $isDrawing,
  $lastMouseDownPos,
  $tool,
  brushSizeChanged,
  rgLayerLineAdded,
  rgLayerPointsAdded,
  rgLayerRectAdded,
} from 'features/controlLayers/store/controlLayersSlice';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { Vector2d } from 'konva/lib/types';
import { useCallback, useRef } from 'react';

const getIsFocused = (stage: Konva.Stage) => {
  return stage.container().contains(document.activeElement);
};
const getIsMouseDown = (e: KonvaEventObject<MouseEvent>) => e.evt.buttons === 1;

export const getScaledFlooredCursorPosition = (stage: Konva.Stage) => {
  const pointerPosition = stage.getPointerPosition();
  const stageTransform = stage.getAbsoluteTransform().copy();
  if (!pointerPosition || !stageTransform) {
    return;
  }
  const scaledCursorPosition = stageTransform.invert().point(pointerPosition);
  return {
    x: Math.floor(scaledCursorPosition.x),
    y: Math.floor(scaledCursorPosition.y),
  };
};

const syncCursorPos = (stage: Konva.Stage): Vector2d | null => {
  const pos = getScaledFlooredCursorPosition(stage);
  if (!pos) {
    return null;
  }
  $cursorPosition.set(pos);
  return pos;
};

const BRUSH_SPACING = 20;

export const useMouseEvents = () => {
  const dispatch = useAppDispatch();
  const selectedLayerId = useAppSelector((s) => s.controlLayers.present.selectedLayerId);
  const selectedLayerType = useAppSelector((s) => {
    const selectedLayer = s.controlLayers.present.layers.find((l) => l.id === s.controlLayers.present.selectedLayerId);
    if (!selectedLayer) {
      return null;
    }
    return selectedLayer.type;
  });
  const tool = useStore($tool);
  const lastCursorPosRef = useRef<[number, number] | null>(null);
  const shouldInvertBrushSizeScrollDirection = useAppSelector((s) => s.canvas.shouldInvertBrushSizeScrollDirection);
  const brushSize = useAppSelector((s) => s.controlLayers.present.brushSize);

  const onMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) {
        return;
      }
      const pos = syncCursorPos(stage);
      if (!pos || !selectedLayerId || selectedLayerType !== 'regional_guidance_layer') {
        return;
      }
      $lastMouseDownPos.set(pos);
      if (tool === 'brush' || tool === 'eraser') {
        dispatch(
          rgLayerLineAdded({
            layerId: selectedLayerId,
            points: [pos.x, pos.y, pos.x, pos.y],
            tool,
          })
        );
        $isDrawing.set(true);
      }
    },
    [dispatch, selectedLayerId, selectedLayerType, tool]
  );

  const onMouseUp = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) {
        return;
      }
      const pos = $cursorPosition.get();
      if (!pos || !selectedLayerId || selectedLayerType !== 'regional_guidance_layer') {
        return;
      }
      const lastPos = $lastMouseDownPos.get();
      const tool = $tool.get();
      if (lastPos && selectedLayerId && tool === 'rect') {
        dispatch(
          rgLayerRectAdded({
            layerId: selectedLayerId,
            rect: {
              x: Math.min(pos.x, lastPos.x),
              y: Math.min(pos.y, lastPos.y),
              width: Math.abs(pos.x - lastPos.x),
              height: Math.abs(pos.y - lastPos.y),
            },
          })
        );
      }
      $isDrawing.set(false);
      $lastMouseDownPos.set(null);
    },
    [dispatch, selectedLayerId, selectedLayerType]
  );

  const onMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) {
        return;
      }
      const pos = syncCursorPos(stage);
      if (!pos || !selectedLayerId || selectedLayerType !== 'regional_guidance_layer') {
        return;
      }
      if (getIsFocused(stage) && getIsMouseDown(e) && (tool === 'brush' || tool === 'eraser')) {
        if ($isDrawing.get()) {
          // Continue the last line
          if (lastCursorPosRef.current) {
            // Dispatching redux events impacts perf substantially - using brush spacing keeps dispatches to a reasonable number
            if (Math.hypot(lastCursorPosRef.current[0] - pos.x, lastCursorPosRef.current[1] - pos.y) < BRUSH_SPACING) {
              return;
            }
          }
          lastCursorPosRef.current = [pos.x, pos.y];
          dispatch(rgLayerPointsAdded({ layerId: selectedLayerId, point: lastCursorPosRef.current }));
        } else {
          // Start a new line
          dispatch(rgLayerLineAdded({ layerId: selectedLayerId, points: [pos.x, pos.y, pos.x, pos.y], tool }));
        }
        $isDrawing.set(true);
      }
    },
    [dispatch, selectedLayerId, selectedLayerType, tool]
  );

  const onMouseLeave = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) {
        return;
      }
      const pos = syncCursorPos(stage);
      if (!pos || !selectedLayerId || selectedLayerType !== 'regional_guidance_layer') {
        return;
      }
      if (getIsFocused(stage) && getIsMouseDown(e) && (tool === 'brush' || tool === 'eraser')) {
        dispatch(rgLayerPointsAdded({ layerId: selectedLayerId, point: [pos.x, pos.y] }));
      }
      $isDrawing.set(false);
      $cursorPosition.set(null);
    },
    [selectedLayerId, selectedLayerType, tool, dispatch]
  );

  const onMouseWheel = useCallback(
    (e: KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();

      if (selectedLayerType !== 'regional_guidance_layer' || (tool !== 'brush' && tool !== 'eraser')) {
        return;
      }
      // checking for ctrl key is pressed or not,
      // so that brush size can be controlled using ctrl + scroll up/down

      // Invert the delta if the property is set to true
      let delta = e.evt.deltaY;
      if (shouldInvertBrushSizeScrollDirection) {
        delta = -delta;
      }

      if ($ctrl.get() || $meta.get()) {
        dispatch(brushSizeChanged(calculateNewBrushSize(brushSize, delta)));
      }
    },
    [selectedLayerType, tool, shouldInvertBrushSizeScrollDirection, dispatch, brushSize]
  );

  return { onMouseDown, onMouseUp, onMouseMove, onMouseLeave, onMouseWheel };
};
