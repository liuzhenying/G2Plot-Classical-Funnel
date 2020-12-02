import {
  Coordinate,
} from '@antv/g2/lib/dependents';
import Element from '@antv/g2/lib/geometry/element';

export function parsePoints(coordinate: Coordinate, element: Element): {
  x: number;y: number
} [] {
  // @ts-ignore
  return element.getModel().points.map((point) => coordinate.convert(point))
}

export function conversionTagformatter(prev: number, next: number): string {
  if (typeof prev !== "number" || typeof next !== "number") {
    return '-';
  }

  if (prev === next) {
    return `转化率 ${(0).toFixed(0)}%`;
  }
  if (prev === 0) {
    return '∞';
  }
  if (next === 0) {
    return '-∞';
  }

  return `转化率 ${((100 * next) / prev).toFixed(0)}%`;
}


export function conversionTagInfoformatter(prev: object, next: object): string {
  return '备注信息';
}

export function transformLabel(labelOptions: any) {
  if (typeof labelOptions !== 'object') {
    return labelOptions;
  }
  const label = { ...labelOptions };
  if (label.formatter && !label.content) {
    label.content = label.formatter;
  }
  return label;
}