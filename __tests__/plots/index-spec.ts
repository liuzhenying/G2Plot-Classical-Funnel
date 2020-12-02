import { P } from '@antv/g2plot';
import { adaptor, defaultOptions } from '../../src';
import { createDiv } from '../utils/dom';

const data = [
  { stage: '简历筛选', number: 253 },
  { stage: '初试人数', number: 151 },
  { stage: '复试人数', number: 113 },
  { stage: '录取人数', number: 87 },
  { stage: '入职人数', number: 59 },
];

describe('bar', () => {
  it('x*y', () => {
    const funnel = new P(createDiv(), {
      data,
      xField: 'stage',
      yField: 'number',
      label: {
        formatter: (data) => `${data.stage} ${data.number}`,
      },
      interactions: [{
        type: 'element-active'
      }, {
        type: 'active-region'
      }]
      // @ts-ignore
    }, adaptor, defaultOptions);
     
    funnel.render();


    funnel.chart.on('element:click', (evt) => {
      alert('element:click')
    });

    funnel.chart.on('annotation:click', (evt) => {
      alert('annotation:click')
    });

    const chart = funnel.chart;
   
    expect(chart.appendPadding).toEqual([0, 90, 0, 30]);

    const geometry = funnel.chart.geometries[0];

    // 数据量
    expect(geometry.elements.length).toBe(data.length);
    expect(geometry.type).toBe('interval');
    // @ts-ignore
    expect(geometry.adjustOption[0].type).toBe('symmetric');
    // @ts-ignore
    expect(geometry.labelOption.cfg.formatter(data[0])).toBe('简历筛选 253');
  });
});