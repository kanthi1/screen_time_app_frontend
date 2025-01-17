import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const PieChart = ({ data }) => {
  const chartContainer = useRef(null);
  const chartRef = useRef(null);

  const totalTimeCalc = (data) => {
    const totalTimeInSeconds = data.reduce((total, item) => {
      const timeParts = item.time.split(':');
      return (
        total +
        parseInt(timeParts[0]) * 3600 +
        parseInt(timeParts[1]) * 60 +
        parseFloat(timeParts[2])
      );
    }, 0);

    const totalHours = Math.floor(totalTimeInSeconds / 3600);
    const totalMinutes = Math.floor((totalTimeInSeconds % 3600) / 60);
    const totalFormatted = `Total Time: ${totalHours}H ${totalMinutes}M`;
    return totalFormatted;
  };

  const getTimeFormatted = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(parseFloat);
    const timeFormatted = `${hours}H ${minutes}M`;
    return timeFormatted;
  };

  const cleanupChart = () => {
    if (chartRef.current) {
      chartRef.current.selectAll('*').remove();
    }
  };

  useEffect(() => {
    if (!data || !chartContainer.current) return;

    cleanupChart(); // Clean up before rendering the new chart

    const totalFormatted = totalTimeCalc(data);

    const width = 500; 
    const height = 400; 
    const radius = Math.min(width, height) / 2;
    const innerRadius = 150;
    const padding = 40;

    const svg = d3
      .select(chartContainer.current)
      .selectAll('svg')
      .data([data])
      .join('svg')
      .attr('width', width + padding * 2)
      .attr('height', height + padding * 2)
      .append('g')
      .attr('transform', `translate(${width / 2 + padding},${height / 2 + padding})`);

    const pie = d3.pie().value((d) => parseFloat(d.time.split(':')[1])).sort(null);

    pie.padAngle(0.052);

    const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius);

    const color = d3.scaleOrdinal().domain(data.map((d) => d.app)).range(d3.schemeCategory10);

    const arcs = pie(data);

    svg
      .selectAll('path')
      .data(arcs)
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d) => color(d.data.app))
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', d3.arc().innerRadius(innerRadius).outerRadius(radius + 15));
        
        svg.selectAll('.total-time-text').text(`${d.data.app.split('.')[2]} ${getTimeFormatted(d.data.time)}`);
      })
      .on('mouseout', function () {
        d3.select(this).transition().duration(200).attr('d', arc);
        svg.selectAll('.total-time-text').text(totalFormatted);
      });

    svg
      .append('text')
      .attr('class', 'total-time-text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .text(totalFormatted);

    chartRef.current = svg;

    return cleanupChart;
  }, [data]);

  useEffect(() => {
    return () => {
      cleanupChart();
    };
  }, []);

  return (
    <div ref={chartContainer} className="pie-chart-container">
      <style>{`
        .pie-chart-container {
          position: relative;
          width: 100%;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        svg {
          width: 600px; // Adjusted SVG width
          height: 400px; // Adjusted SVG height
        }
      `}</style>
    </div>
  );
};

export default PieChart;
