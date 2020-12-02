import { Params, Options } from '@antv/g2plot';
import Element from '@antv/g2/lib/geometry/element';
import { interaction } from '@antv/g2plot/esm/adaptor/common';
import { FunnelOptions } from './types';
import { parsePoints, conversionTagformatter, conversionTagInfoformatter, transformLabel } from './utils';



/**
 * 默认配置
 * @param options
 */
export const defaultOptions = {
  appendPadding: [0, 90, 0, 30],
  columnWidthRatio: 0.5,
  color: ['#5B8FF9'],
  connectColor: ['rgba(0, 0, 0, 0.05)'],
  label: {
    position: 'middle',
  },
  conversionTag: {
    line: {
      color: 'rgba(0, 0, 0, 0.15)',
    },
    text: {
      style: {
        fontSize: 12,
        fill: '#5B8FF9',
        textAlign: 'left',
        textBaseline: 'middle',
      },
      formatter: conversionTagformatter,
    },
    info: {
      style: {
        fontSize: 12,
        fill: 'rgba(0, 0, 0, 0.15)',
        textAlign: 'left',
        textBaseline: 'middle',
      },
      formatter: conversionTagInfoformatter,
    }
  },
  interactions: [{
    type: 'element-active',
  }],
  tooltip: {
    formatter: (name, value) => ({
      name,
      value,
    })
  },
};

/**
 * 适配器
 * @param params
 */
export function adaptor(params: Params<FunnelOptions>): Params<FunnelOptions> {
  const { chart, options } = params;
  const { data, legend, xField, yField, color, label, columnWidthRatio, interactions, tooltip } = options;

  chart.data(data);

  // 处理主题
  chart.theme({
    columnWidthRatio
  })

  // 处理坐标轴
  chart.coordinate({
    type: 'rect',
    actions: [['transpose'], ['scale', 1, -1]],
  });

  // 绘图
  const geo = chart
    .interval()
    .position(`${xField}*${yField}`)
    .adjust('symmetric')
    .color(color[0]);

  if (label === false) {
    geo.label(false);
  } else if (label) {
    const { callback, fields, ...cfg } = label;
    geo.label({
      fields: fields || [yField],
      callback,
      cfg: transformLabel(cfg),
    });
  }

    

  // 处理图例
  if (legend === false) {
    chart.legend(false);
  } else {
    chart.legend(legend);
  }


  if (tooltip !== false) {
    if(tooltip.formatter) {
      geo.tooltip(`${xField}*${yField}`, tooltip.formatter);
    }
    chart.tooltip(tooltip);
  }

  // 关闭组件
  chart.axis(false);

  // 交互
  interactions.forEach((i) => {
    if (i.enable === false) {
      chart.removeInteraction(i.type);
    } else {
      chart.interaction(i.type, i.cfg || {});
    }
  })

  renderConnect(params);

  return params;
}


function renderConnect(params: Params<FunnelOptions>): Params<FunnelOptions> {
  const { chart, options } = params;

  const { connectColor, conversionTag, yField } = options

  chart.annotation().shape({
    render: (container, view) => {
      const group = container.addGroup({
        id: `${chart.id}-connect-group`,
        name: 'connect-group',
      });

      const interval = chart.geometries[0];
      const elements = chart.geometries[0].elements;
      elements.forEach((elem: Element, idx) => {
        if (idx <= 0) return;
       
        const elemPrev = elements[idx - 1];
        const elemNext = elem;
        const coordinate = view.getCoordinate();
        const elemPrevPoint = parsePoints(coordinate, elemPrev);
        const elemNextPoint = parsePoints(coordinate, elemNext);

          // 当柱间距足够时，画完整图形并留出间隔。
          const points = [
            [elemPrevPoint[3].x, elemPrevPoint[3].y],
            [elemPrevPoint[2].x, elemPrevPoint[2].y],
            [elemNextPoint[1].x, elemNextPoint[1].y],
            [elemNextPoint[0].x, elemNextPoint[0].y],
          ];

          group.addShape('polygon', {
            id: `${view.id}-conversion-tag-arrow-${interval.getElementId(elemPrev.getModel().mappingData)}`,
            name: 'conversion-tag-arrow',
            attrs: {
              points,
              fill: connectColor[0],
            },
          });

          // 绘制点
          const upperY = (elemPrevPoint[1].y + elemPrevPoint[2].y) / 2 + (idx > 1 ? 5 : 0);
          const lowerY = (elemNextPoint[1].y + elemNextPoint[2].y) / 2 - (idx >= elements.length - 1 ? 0 : 5);

          group.addShape('line', {
            name: 'line',
            attrs: {
              x1: elemPrevPoint[1].x,
              x2: elemPrevPoint[1].x + 20,
              y1: upperY,
              y2: upperY,
              stroke: conversionTag.line.color,
            },
          });

          group.addShape('line', {
            name: 'line',
            attrs: {
              x1: elemPrevPoint[1].x + 20,
              x2: elemPrevPoint[1].x + 20,
              y1: upperY,
              y2: lowerY,
              stroke: conversionTag.line.color,
            },
          });

          group.addShape('line', {
            name: 'line',
            attrs: {
              x1: elemPrevPoint[1].x + 20,
              x2: elemNextPoint[1].x + 6,
              y1: lowerY,
              y2: lowerY,
              stroke: conversionTag.line.color,
            },
          });

          // 添加箭头
          group.addShape('polygon', {
            name: 'arrow',
            attrs: {
              points: [
                [elemNextPoint[1].x + 6, lowerY + 3],
                [elemNextPoint[1].x + 6, lowerY - 3],
                [elemNextPoint[1].x, lowerY],
              ],
              fill: conversionTag.line.color,
            },
          });

          const text = conversionTag.text?.formatter && conversionTag.text?.formatter(elemPrev.getData()[yField], elemNext.getData()[yField]);
          const infoSpace = conversionTag.info !== false ? 9 : 0;

          // 添加文字
          group.addShape('text', {
            attrs: {
              x: elemPrevPoint[1].x + 25,
              y: (elemPrevPoint[2].y + elemNextPoint[0].y) / 2 - infoSpace,
              text,
              ...conversionTag.text.style,
            },
          });


          if (conversionTag.info !== false) {
            const info = conversionTag.info?.formatter && conversionTag.info?.formatter(elemPrev.getData(), elemNext.getData());
            group.addShape('text', {
              attrs: {
                x: elemPrevPoint[1].x + 25,
                y: (elemPrevPoint[2].y + elemNextPoint[0].y) / 2 + infoSpace,
                text: info,
                ...conversionTag.info.style,
              },
            });
          }
        });
    }
  });
  return params;
}
