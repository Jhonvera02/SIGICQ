/**
 * SIGICQ Charts Utility
 * Custom SVG chart generator.
 */

const Charts = {
    // Curated color palette matching CSS themes
    colors: [
        '#00b4d8', // Cyan
        '#10b981', // Emerald
        '#f59e0b', // Amber
        '#3b82f6', // Blue
        '#8b5cf6', // Violet
        '#ec4899', // Pink
        '#6366f1'  // Indigo
    ],

    /**
     * Draw Horizontal Bar Chart
     * @param {string} containerId - Target container ID
     * @param {Array<{label: string, value: number}>} data - Dataset
     */
    drawBarChart(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!data || data.length === 0) {
            container.innerHTML = '<p class="empty-state">Sin datos disponibles</p>';
            return;
        }

        const width = container.clientWidth || 400;
        const height = container.clientHeight || 240;
        const paddingLeft = 110;
        const paddingRight = 40;
        const paddingTop = 10;
        const paddingBottom = 30;

        const maxVal = Math.max(...data.map(d => d.value)) || 1;
        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;
        const barHeight = Math.min(25, chartHeight / data.length - 8);
        const barSpacing = chartHeight / data.length;

        let svgHtml = `<svg viewBox="0 0 ${width} ${height}" class="svg-chart">`;
        
        // Grid lines
        const ticks = 4;
        for (let i = 0; i <= ticks; i++) {
            const x = paddingLeft + (chartWidth * i) / ticks;
            const gridVal = Math.round((maxVal * i) / ticks);
            svgHtml += `
                <line x1="${x}" y1="${paddingTop}" x2="${x}" y2="${height - paddingBottom}" stroke="var(--border-color)" stroke-dasharray="3 3" />
                <text x="${x}" y="${height - 10}" text-anchor="middle" fill="var(--text-secondary)" font-size="10">${gridVal}</text>
            `;
        }

        // Draw Bars and Labels
        data.forEach((item, index) => {
            const y = paddingTop + index * barSpacing + (barSpacing - barHeight) / 2;
            const barWidth = (item.value / maxVal) * chartWidth;
            const color = this.colors[index % this.colors.length];

            svgHtml += `
                <!-- Category Label -->
                <text x="${paddingLeft - 10}" y="${y + barHeight / 2 + 4}" text-anchor="end" font-weight="500">${this.truncateText(item.label, 15)}</text>
                
                <!-- Bar Background -->
                <rect x="${paddingLeft}" y="${y}" width="${chartWidth}" height="${barHeight}" fill="rgba(255,255,255,0.02)" rx="3" />
                
                <!-- Bar Fill -->
                <rect class="chart-bar" x="${paddingLeft}" y="${y}" width="0" height="${barHeight}" fill="${color}" rx="3" data-val="${item.value}" data-label="${item.label}">
                    <animate attributeName="width" from="0" to="${barWidth}" dur="0.8s" fill="freeze" calcMode="spline" keySplines="0.4 0 0.2 1" keyTimes="0 1"/>
                </rect>

                <!-- Value Label -->
                <text x="${paddingLeft + barWidth + 8}" y="${y + barHeight / 2 + 4}" fill="var(--text-primary)" font-weight="600">${item.value}</text>
            `;
        });

        // Vertical Y Axis line
        svgHtml += `<line x1="${paddingLeft}" y1="${paddingTop}" x2="${paddingLeft}" y2="${height - paddingBottom}" stroke="var(--border-color)" stroke-width="1.5" />`;
        svgHtml += `</svg>`;

        container.innerHTML = svgHtml;
        this.setupTooltips(container);
    },

    /**
     * Draw Donut / Pie Chart
     * @param {string} containerId - Target container ID
     * @param {Array<{label: string, value: number}>} data - Dataset
     */
    drawDonutChart(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!data || data.length === 0) {
            container.innerHTML = '<p class="empty-state">Sin datos disponibles</p>';
            return;
        }

        const width = container.clientWidth || 300;
        const height = container.clientHeight || 240;
        const cx = width / 2 - 40; // Shift left to make room for legend
        const cy = height / 2;
        const r = Math.min(width, height) * 0.32;
        const strokeWidth = r * 0.45; // Width of donut ring

        const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;

        let svgHtml = `<svg viewBox="0 0 ${width} ${height}" class="svg-chart">`;
        let startAngle = -90; // Start at 12 o'clock

        // Segments
        data.forEach((item, index) => {
            const percentage = item.value / total;
            const angleSpan = percentage * 360;
            const endAngle = startAngle + angleSpan;

            const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180);
            const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180);
            const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180);
            const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180);

            const largeArcFlag = angleSpan > 180 ? 1 : 0;
            const color = this.colors[index % this.colors.length];

            // SVG Path for an arc
            svgHtml += `
                <path class="chart-bar" d="M ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}" 
                      fill="none" stroke="${color}" stroke-width="${strokeWidth}" 
                      data-val="${item.value} (${Math.round(percentage * 100)}%)" data-label="${item.label}">
                </path>
            `;
            startAngle = endAngle;
        });

        // Center cutout cover to make it a neat hollow donut
        svgHtml += `<circle cx="${cx}" cy="${cy}" r="${r - strokeWidth / 2 - 2}" fill="var(--bg-secondary)" />`;
        
        // Inside label (Total count)
        svgHtml += `
            <text x="${cx}" y="${cy - 2}" text-anchor="middle" fill="var(--text-secondary)" font-size="10" font-weight="600" text-transform="uppercase">Total</text>
            <text x="${cx}" y="${cy + 12}" text-anchor="middle" fill="var(--text-primary)" font-size="16" font-weight="700">${total}</text>
        `;

        // Legend (Right Side)
        const legendX = cx + r + 45;
        const legendYStart = cy - (data.length * 18) / 2 + 6;
        data.forEach((item, index) => {
            const color = this.colors[index % this.colors.length];
            const y = legendYStart + index * 18;
            svgHtml += `
                <rect x="${legendX}" y="${y - 8}" width="10" height="10" fill="${color}" rx="2" />
                <text x="${legendX + 16}" y="${y}" text-anchor="start" font-size="11" fill="var(--text-primary)" font-weight="500">
                    ${this.truncateText(item.label, 12)} (${item.value})
                </text>
            `;
        });

        svgHtml += `</svg>`;
        container.innerHTML = svgHtml;
        this.setupTooltips(container);
    },

    /**
     * Draw Line Chart
     * @param {string} containerId - Target container ID
     * @param {Array<{label: string, value: number}>} data - Dataset
     */
    drawLineChart(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!data || data.length === 0) {
            container.innerHTML = '<p class="empty-state">Sin datos disponibles</p>';
            return;
        }

        const width = container.clientWidth || 400;
        const height = container.clientHeight || 240;
        const paddingLeft = 50;
        const paddingRight = 20;
        const paddingTop = 20;
        const paddingBottom = 30;

        const maxVal = Math.max(...data.map(d => d.value)) * 1.1 || 100; // 10% buffer
        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;

        let svgHtml = `<svg viewBox="0 0 ${width} ${height}" class="svg-chart">`;

        // Y Grid & Axes
        const ticksY = 4;
        for (let i = 0; i <= ticksY; i++) {
            const y = height - paddingBottom - (chartHeight * i) / ticksY;
            const gridVal = Math.round((maxVal * i) / ticksY);
            svgHtml += `
                <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" stroke="var(--border-color)" stroke-dasharray="3 3" />
                <text x="${paddingLeft - 10}" y="${y + 4}" text-anchor="end">${this.formatCurrency(gridVal)}</text>
            `;
        }

        // X Axis labels & points calculation
        const stepX = chartWidth / (data.length - 1 || 1);
        const points = data.map((item, index) => {
            const x = paddingLeft + index * stepX;
            const y = height - paddingBottom - (item.value / maxVal) * chartHeight;
            return { x, y, label: item.label, value: item.value };
        });

        // Generate line path
        let pathD = `M ${points[0].x} ${points[0].y}`;
        let areaD = `M ${points[0].x} ${height - paddingBottom} L ${points[0].x} ${points[0].y}`;
        
        for (let i = 1; i < points.length; i++) {
            pathD += ` L ${points[i].x} ${points[i].y}`;
            areaD += ` L ${points[i].x} ${points[i].y}`;
        }
        
        areaD += ` L ${points[points.length - 1].x} ${height - paddingBottom} Z`;

        // Draw Area Fill (Semi-transparent)
        svgHtml += `
            <path d="${areaD}" fill="url(#line-grad)" opacity="0.15" />
            <defs>
                <linearGradient id="line-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="var(--accent-color)" />
                    <stop offset="100%" stop-color="var(--accent-color)" stop-opacity="0" />
                </linearGradient>
            </defs>
        `;

        // Draw Line Path
        svgHtml += `
            <path class="chart-line" d="${pathD}" fill="none" stroke="var(--accent-color)" stroke-width="3" stroke-linecap="round" />
        `;

        // Draw Points and X-Axis labels
        points.forEach((pt) => {
            svgHtml += `
                <text x="${pt.x}" y="${height - 10}" text-anchor="middle">${pt.label}</text>
                <circle class="chart-point" cx="${pt.x}" cy="${pt.y}" r="5" fill="var(--bg-secondary)" stroke="var(--accent-color)" stroke-width="2.5" data-val="${this.formatCurrency(pt.value)}" data-label="${pt.label}" />
            `;
        });

        svgHtml += `</svg>`;
        container.innerHTML = svgHtml;
        this.setupTooltips(container);
    },

    /**
     * Draw Gauge (Semi-donut) Chart
     * @param {string} containerId - Target container ID
     * @param {number} percentage - Percentage (0 - 100)
     */
    drawGaugeChart(containerId, percentage) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const width = container.clientWidth || 240;
        const height = container.clientHeight || 200;
        const cx = width / 2;
        const cy = height * 0.7;
        const r = Math.min(width, height) * 0.55;
        const strokeWidth = 20;

        // Angles
        const startAngle = -180;
        const endAngle = 0;
        const totalSpan = 180;
        const fillSpan = (percentage / 100) * totalSpan;
        const activeEndAngle = startAngle + fillSpan;

        // Path coordinates for backdrop
        const x1_bg = cx + r * Math.cos((startAngle * Math.PI) / 180);
        const y1_bg = cy + r * Math.sin((startAngle * Math.PI) / 180);
        const x2_bg = cx + r * Math.cos((endAngle * Math.PI) / 180);
        const y2_bg = cy + r * Math.sin((endAngle * Math.PI) / 180);

        // Coordinates for filled area
        const x1_fill = cx + r * Math.cos((startAngle * Math.PI) / 180);
        const y1_fill = cy + r * Math.sin((startAngle * Math.PI) / 180);
        const x2_fill = cx + r * Math.cos((activeEndAngle * Math.PI) / 180);
        const y2_fill = cy + r * Math.sin((activeEndAngle * Math.PI) / 180);

        // Gauge Color based on value
        let color = 'var(--danger)';
        if (percentage >= 80) color = 'var(--success)';
        else if (percentage >= 50) color = 'var(--warning)';

        const svgHtml = `
            <svg viewBox="0 0 ${width} ${height}" class="svg-chart">
                <!-- Track Background -->
                <path d="M ${x1_bg} ${y1_bg} A ${r} ${r} 0 0 1 ${x2_bg} ${y2_bg}" fill="none" stroke="var(--border-color)" stroke-width="${strokeWidth}" stroke-linecap="round" />
                
                <!-- Track Fill -->
                <path d="M ${x1_fill} ${y1_fill} A ${r} ${r} 0 0 1 ${x2_fill} ${y2_fill}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" style="transition: stroke 0.3s;">
                    <animate attributeName="stroke-dasharray" from="0 1000" to="1000 1000" dur="0.8s" fill="freeze" />
                </path>

                <!-- Value Label in Center -->
                <text x="${cx}" y="${cy - 10}" text-anchor="middle" fill="var(--text-primary)" font-size="32" font-weight="700">${percentage}%</text>
                <text x="${cx}" y="${cy + 15}" text-anchor="middle" fill="var(--text-secondary)" font-size="11" font-weight="600" text-transform="uppercase">Nivel de Abastecimiento</text>
            </svg>
        `;

        container.innerHTML = svgHtml;
    },

    /**
     * Set up Tooltips logic for charts elements
     * @param {HTMLElement} parent - Parent element
     */
    setupTooltips(parent) {
        let tooltip = document.getElementById('chart-global-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'chart-global-tooltip';
            tooltip.className = 'chart-tooltip';
            document.body.appendChild(tooltip);
        }

        const hoverables = parent.querySelectorAll('.chart-bar, .chart-point');
        hoverables.forEach(el => {
            el.addEventListener('mouseover', (e) => {
                const label = e.target.getAttribute('data-label');
                const val = e.target.getAttribute('data-val');
                if (label && val) {
                    tooltip.innerHTML = `<strong>${label}</strong>: ${val}`;
                    tooltip.style.opacity = '1';
                }
            });

            el.addEventListener('mousemove', (e) => {
                tooltip.style.left = (e.pageX + 10) + 'px';
                tooltip.style.top = (e.pageY - 15) + 'px';
            });

            el.addEventListener('mouseout', () => {
                tooltip.style.opacity = '0';
            });
        });
    },

    /** Helper: Truncate Text */
    truncateText(str, n) {
        return (str.length > n) ? str.substr(0, n - 1) + '…' : str;
    },

    /** Helper: Currency formatter */
    formatCurrency(val) {
        return '$' + val.toLocaleString('es-CO');
    }
};

// Expose to global scope
window.Charts = Charts;
