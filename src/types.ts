import { Options } from '@antv/g2plot';
import { ShapeAttrs } from '@antv/g2/lib/dependents';

export interface FunnelOptions extends Options {
  /** x 轴字段 */
  readonly xField?: string;
  /** y 轴字段 */
  readonly yField?: string;
  // 漏斗颜色
  color?: string[],
  // 联通区域颜色
  connectColor?: string[],
  // 漏斗高度
  columnWidthRatio?: number;
  // labelStyle
  conversionTag?: {
    line?: {
      color?: string;
    },
    text?: {
      style?: ShapeAttrs;
      formatter? : (prev: number, next: number) => string;
    },
    info?: false | {
      style?: ShapeAttrs;
      formatter? : (prev: object, next: object) => string;
    }
  }

}