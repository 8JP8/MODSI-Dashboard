export default {
    FormatGraphData(rawData, groupBy, graphType, fusionChartTypeParam = "mscolumn3d") {
        // Ensure fusionChartType is a valid string, default if empty/null
        const fusionChartType = fusionChartTypeParam && String(fusionChartTypeParam).trim() !== "" ? String(fusionChartTypeParam).trim() : "mscolumn3d";

        // Helper: validate and format date keys according to groupBy
        function formatDateKey(dateStr) {
            if (!dateStr) return null;
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) {
                // console.warn(`FormatGraphData: Invalid date for formatDateKey: ${dateStr}`);
                return null;
            }
            if (groupBy === "day") return d.toISOString().slice(0, 10); // yyyy-mm-dd
            if (groupBy === "month") return d.toISOString().slice(0, 7); // yyyy-mm
            if (groupBy === "year") return d.getFullYear().toString(); // yyyy
            return d.toISOString().slice(0, 10); // default to day format
        }

        const grouped = {};
        rawData.forEach(item => {
            if (!item.ChangedAt) {
                // console.warn("FormatGraphData: Skipping item with missing ChangedAt:", item);
                return;
            }
            const key = formatDateKey(item.ChangedAt);
            if (!key) {
                // console.warn("FormatGraphData: Skipping item with invalid date after formatDateKey:", item.ChangedAt);
                return;
            }
            if (!grouped[key]) {
                grouped[key] = { time: key, NewValue_1: 0, NewValue_2: 0, ChangedAt: null }; // Initialize with 0
            }
            const currentDate = new Date(item.ChangedAt);
            const storedDate = grouped[key].ChangedAt ? new Date(grouped[key].ChangedAt) : null;

            if (!storedDate || currentDate >= storedDate) { // Use >= to ensure latest update if timestamps are identical
                // Ensure NewValue_1 and NewValue_2 become numbers, defaulting to 0 if parsing fails or NaN
                let val1 = parseFloat(item.NewValue_1);
                let val2 = parseFloat(item.NewValue_2);
                grouped[key].NewValue_1 = isNaN(val1) ? 0 : val1;
                grouped[key].NewValue_2 = isNaN(val2) ? 0 : val2;
                grouped[key].ChangedAt = item.ChangedAt;
            }
        });

        if (Object.keys(grouped).length === 0) {
            // console.warn("FormatGraphData: No valid data after filtering.");
            if (graphType === "fusion") {
                return {
                    type: fusionChartType,
                    width: "100%",
                    height: "700",
                    dataFormat: "json",
                    dataSource: {
                        chart: {
                            caption: "No Data Available",
                            subCaption: `Grouped by ${groupBy}`,
                            xAxisName: groupBy.charAt(0).toUpperCase() + groupBy.slice(1),
                            yAxisName: "Value",
                            theme: "fusion",
                            showvalues: "0"
                        },
                        categories: [{ category: [] }],
                        dataset: []
                    }
                };
            }
            return [];
        }

        const sortedKeys = Object.keys(grouped).sort();
        // product1Data and product2Data will contain numbers (or 0 from the grouping logic)
        const product1Data = sortedKeys.map(key => grouped[key].NewValue_1);
        const product2Data = sortedKeys.map(key => grouped[key].NewValue_2);


        // Format x axis labels nicely for FusionCharts or ECharts
        function formatLabel(key) {
            if (groupBy === "day") return key; // yyyy-mm-dd
            if (groupBy === "month") {
                const [year, month] = key.split("-");
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                return monthNames[parseInt(month) - 1] + " " + year;
            }
            if (groupBy === "year") return key;
            return key;
        }

        const xLabels = sortedKeys.map(formatLabel);

        if (graphType === "appsmith") {
            const formattedData = [];
            xLabels.forEach((label, index) => {
                formattedData.push({ x: label, y: product1Data[index], series: "Product 1" });
            });
            xLabels.forEach((label, index) => {
                formattedData.push({ x: label, y: product2Data[index], series: "Product 2" });
            });
            return formattedData;
        }
        
        if (graphType === "echart") {
            return {
                xAxis: { type: "category", data: xLabels },
                series: [
                    { name: "Product 1", type: "line", data: product1Data },
                    { name: "Product 2", type: "line", data: product2Data },
                ],
                legend: { data: ["Product 1", "Product 2"] },
                tooltip: { trigger: "axis" },
            };
        }
        
        if (graphType === "fusion") {
            return {
                type: fusionChartType,
                width: "100%",
                height: "360",
                dataFormat: "json",
                dataSource: {
                    chart: {
                        caption: "Product Comparison",
                        subCaption: `Data grouped by ${groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}`,
                        xAxisName: groupBy.charAt(0).toUpperCase() + groupBy.slice(1),
                        yAxisName: "Value",
                        theme: "fusion",
                        chartBottomMargin: "40",
                        labelDisplay: "auto",
                        slantLabels: "0",
                        legendPosition: "bottom",
                        legendAlignment: "left",
                        legendBorderAlpha: "0",
                        legendShadow: "0",
                        legendAllowDrag: "0"
                    },
                    categories: [
                        {
                            category: xLabels.map(label => ({ label: String(label) })),
                        }
                    ],
                    dataset: [
                        {
                            seriesname: "Product 1",
                            data: product1Data.map(val => ({ value: Number(val) })), // Number(val) should be clean
                        },
                        {
                            seriesname: "Product 2",
                            data: product2Data.map(val => ({ value: Number(val) })), // Number(val) should be clean
                        }
                    ]
                }
            };
        }
        
        // Default fallback
        return sortedKeys.map(key => grouped[key]); 
    },

    FormatKPIHistory(
        currentKPIs, 
        historyData, 
        selectedKPIName, 
        groupBy, 
        productId = 1, // 1 for Product 1, 2 for Product 2, 0 for Both
        graphType = "appsmith", 
        fusionChartTypeParam = "column2d",
        chartTitle = null, // New parameter for dynamic title
        chartSubTitle = null // New parameter for dynamic subtitle (e.g., " (Por {{SortTypeSelector.selectedOptionLabel}})")
    ) {
        // Determine default chart type based on whether we are showing single or multiple products for Fusion
        const defaultFusionType = productId === 0 ? "mscolumn2d" : "column2d";
        const fusionChartType = fusionChartTypeParam && String(fusionChartTypeParam).trim() !== "" ? String(fusionChartTypeParam).trim() : defaultFusionType;

        const selectedKPI = currentKPIs.find(kpi => kpi.Name === selectedKPIName);

        // --- Common Chart Configuration Details ---
        const kpiUnit = selectedKPI ? selectedKPI.Unit || "" : "";
        let yAxisName = selectedKPIName || "Value";
        if (selectedKPI && kpiUnit) yAxisName = `${selectedKPIName} (${kpiUnit})`;
        
        let xAxisName = "Período"; // Period
        if (groupBy === "change") xAxisName = "Sequência de Alterações"; // Change Sequence
        else if (groupBy === "day") xAxisName = "Dia"; // Day
        else if (groupBy === "month") xAxisName = "Mês"; // Month
        else if (groupBy === "year") xAxisName = "Ano"; // Year
        
        // Construct dynamic caption and subcaption
        const dynamicCaption = chartTitle || (selectedKPI ? `${selectedKPIName} History` : "KPI History");
        let defaultSubCaption = `Grouped by ${groupBy === "change" ? "Change Event" : groupBy}`;
        if (productId === 0) {
            defaultSubCaption = `Products 1 & 2 - ${defaultSubCaption}`;
        } else if (productId === 1 || productId === 2) {
            defaultSubCaption = `Product ${productId} - ${defaultSubCaption}`;
        }
        const dynamicSubCaption = chartSubTitle || defaultSubCaption;


        if (!selectedKPI) {
            // console.warn("FormatKPIHistory: Selected KPI not found:", selectedKPIName);
            if (graphType === "fusionKPI") {
                const isMultiSeries = productId === 0;
                return {
                    type: fusionChartType, width: "100%", height: "360", dataFormat: "json",
                    dataSource: { 
                        chart: { 
                            caption: dynamicCaption, // Use dynamic caption even for "not found"
                            subCaption: `KPI ${selectedKPIName || ''} not found`, 
                            theme: "fusion", 
                            showvalues: "0" 
                        }, 
                        data: isMultiSeries ? undefined : [], // For multi-series, 'data' shouldn't exist
                        categories: isMultiSeries ? [{category:[]}] : undefined,
                        dataset: isMultiSeries ? [] : undefined
                    }
                };
            }
            return [];
        }

        const kpiHistory = historyData.filter(item => item.KPIId === selectedKPI.Id);

        // Helper to get {x, y} data for a single product
        function getProductChartData(pIdSuffix) { // pIdSuffix is "1" or "2"
            let productChartData = [];
            const currentValField = `Value_${pIdSuffix}`;
            const historyValField = `NewValue_${pIdSuffix}`;

            if (groupBy === "change") {
                const sortedHistory = kpiHistory.sort((a, b) => new Date(a.ChangedAt) - new Date(b.ChangedAt));
                let currentVal = Number(selectedKPI[currentValField]);
                productChartData.push({ x: "Atual", y: isNaN(currentVal) ? 0 : currentVal });
                
                sortedHistory.forEach((item, index) => {
                    if (item[historyValField] !== null && item[historyValField] !== undefined) {
                        let histVal = Number(item[historyValField]);
                        productChartData.push({ x: `Alteração ${index + 1}`, y: isNaN(histVal) ? 0 : histVal });
                    }
                });
            } else { // Time-based grouping
                function formatDateKey(dateStr) { 
                    if (!dateStr) return null;
                    const d = new Date(dateStr);
                    if (isNaN(d.getTime())) return null;
                    if (groupBy === "day") return d.toISOString().slice(0, 10);
                    if (groupBy === "month") return d.toISOString().slice(0, 7);
                    if (groupBy === "year") return d.getFullYear().toString();
                    return d.toISOString().slice(0, 10);
                }
                const grouped = {}; // Stores { key: { parsedValue: number, originalChangedAt: string } }
                kpiHistory.forEach(item => {
                    if (!item.ChangedAt || (item[historyValField] === null || item[historyValField] === undefined)) return;
                    
                    const key = formatDateKey(item.ChangedAt);
                    if (!key) return;
                    
                    const itemChangedAtDate = new Date(item.ChangedAt); // For comparison
                    const currentHistVal = Number(item[historyValField]);

                    if (!grouped[key] || itemChangedAtDate >= new Date(grouped[key].originalChangedAt)) {
                        grouped[key] = { 
                            parsedValue: isNaN(currentHistVal) ? 0 : currentHistVal, 
                            originalChangedAt: item.ChangedAt 
                        };
                    }
                });

                const now = new Date(); 
                const currentYear = now.getFullYear().toString(); 
                const currentMonth = now.toISOString().slice(0, 7); 
                const currentDay = now.toISOString().slice(0, 10);
                const sortedKeys = Object.keys(grouped).sort(); // Sorts string keys alphabetically/chronologically for yyyy-mm-dd or yyyy-mm

                function formatXLabel(key) { 
                    if (groupBy === "day") { if (key === currentDay) return "Hoje"; return key; }
                    if (groupBy === "month") { const [year, month] = key.split("-"); const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]; const monthName = monthNames[parseInt(month) - 1]; if (key === currentMonth) return `Este mês (${monthName})`; return monthName + " " + year; }
                    if (groupBy === "year") { if (key === currentYear) return `Este ano (${key})`; return key; }
                    return key;
                }
                
                const shouldAddCurrent = !(groupBy === "year" && sortedKeys.includes(currentYear));
                if (shouldAddCurrent) {
                    let currentLabel = "Atual"; 
                    if (groupBy === "day") currentLabel = "Hoje"; 
                    else if (groupBy === "month") { const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]; currentLabel = `Este mês (${monthNames[now.getMonth()]})`; } 
                    else if (groupBy === "year") currentLabel = `Este ano (${currentYear})`;
                    
                    let currentVal = Number(selectedKPI[currentValField]);
                    if (selectedKPI[currentValField] !== null) { // Add if original was not null
                        productChartData.push({ x: currentLabel, y: isNaN(currentVal) ? 0 : currentVal });
                    }
                }
                sortedKeys.forEach(key => {
                    productChartData.push({ x: formatXLabel(key), y: grouped[key].parsedValue });
                });
            }
            return productChartData;
        }

        let finalChartDataForAppsmith; // For single product {x,y} or for appsmith
        let xLabelsForMultiFusion = []; // For multi-product fusion
        let product1FusionDataset = []; // For multi-product fusion
        let product2FusionDataset = []; // For multi-product fusion

        if (productId === 0 && graphType === "fusionKPI") { // Both products for Fusion
            const dataP1 = getProductChartData("1");
            const dataP2 = getProductChartData("2");

            const allXValues = new Set();
            dataP1.forEach(d => allXValues.add(d.x));
            dataP2.forEach(d => allXValues.add(d.x));
            
            // Create a sortable representation of labels
            const sortableLabels = Array.from(allXValues).map(label => {
                let order = 3; // Default for time-based labels
                let dateVal = null;
                if (label === "Atual") order = 0;
                else if (label.startsWith("Alteração ")) order = 1;
                else if (label === "Hoje") { order = 2; dateVal = new Date(); dateVal.setHours(0,0,0,0); } // Today
                else if (label.startsWith("Este mês")) { order = 2; dateVal = new Date(new Date().setDate(1));dateVal.setHours(0,0,0,0); } // This Month
                else if (label.startsWith("Este ano")) { order = 2; dateVal = new Date(new Date().getFullYear(), 0, 1); dateVal.setHours(0,0,0,0);} // This Year
                else { // Attempt to parse as date
                    try {
                        // Basic parsing, improve if more formats needed
                        const parts = label.split(" "); // "Jan 2023" or "yyyy-mm-dd" or "yyyy-mm"
                        if (parts.length === 2 && monthNames.includes(parts[0])) { // "Jan 2023" format
                             dateVal = new Date(Date.parse(parts[0] + " 1, " + parts[1]));
                        } else if (label.includes('-')) { // "yyyy-mm-dd" or "yyyy-mm"
                            dateVal = new Date(label.includes('-') && label.length > 7 ? label : label + "-01"); // Add day if only yyyy-mm
                        }
                        if (dateVal && isNaN(dateVal.getTime())) dateVal = null;
                    } catch(e) { dateVal = null; }
                }
                return { label, order, dateVal };
            });

            const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

            sortableLabels.sort((a, b) => {
                if (a.order !== b.order) return a.order - b.order;
                if (a.order === 1) { // "Alteração N"
                    return parseInt(a.label.split(" ")[1]) - parseInt(b.label.split(" ")[1]);
                }
                if (a.dateVal && b.dateVal) return a.dateVal - b.dateVal;
                return String(a.label).localeCompare(String(b.label)); // Fallback string sort
            });

            xLabelsForMultiFusion = sortableLabels.map(item => item.label);

            product1FusionDataset = xLabelsForMultiFusion.map(label => {
                const p1Point = dataP1.find(d => d.x === label);
                return { value: p1Point ? Number(p1Point.y) : 0 }; // Ensure value is number
            });
            product2FusionDataset = xLabelsForMultiFusion.map(label => {
                const p2Point = dataP2.find(d => d.x === label);
                return { value: p2Point ? Number(p2Point.y) : 0 }; // Ensure value is number
            });

            if (xLabelsForMultiFusion.length === 0) { 
                // console.warn("FormatKPIHistory (productId 0): No data for either product.");
            }

        } else if (productId === 1 || productId === 2) { // Single product (for Appsmith or Fusion)
            finalChartDataForAppsmith = getProductChartData(String(productId));
        } else { 
            // console.error("FormatKPIHistory: Invalid productId " + productId + " when not expecting multi-series for Fusion.");
            return graphType === "fusionKPI" ? { type: "column2d", dataSource: { chart:{caption:"Error"}, data:[] } } : [];
        }

        // --- Output Formatting ---
        if (graphType === "appsmith") {
            // For Appsmith, productId 0 isn't directly handled to return two series in one Appsmith chart.
            // It would typically require two separate chart widgets or a custom chart that can take multiple series.
            // This path returns data for the specified single product (or product 1 if productId was 0 and not fusionKPI).
            return finalChartDataForAppsmith || [];
        }

        if (graphType === "fusionKPI") {
            let dataSourceConfig = {};
            if (productId === 0) { // Multi-series structure for Fusion
                dataSourceConfig = {
                    chart: {
                        caption: dynamicCaption, subCaption: dynamicSubCaption, xAxisName: xAxisName, yAxisName: yAxisName,
                        numberPrefix: (kpiUnit === "$" || kpiUnit === "R$") ? kpiUnit : (selectedKPI.Prefix || ""),
                        numberSuffix: selectedKPI.Suffix || "",
                        theme: "fusion", chartBottomMargin: "40", labelDisplay: "auto", slantLabels: "0",
                        legendPosition: "bottom", legendAlignment: "left" // Common for multi-series
                    },
                    categories: [{ category: xLabelsForMultiFusion.map(label => ({ label: String(label) })) }],
                    dataset: [
                        { seriesname: `Produto 1`, data: product1FusionDataset }, // Ensure "data" values are numeric
                        { seriesname: `Produto 2`, data: product2FusionDataset }  // Ensure "data" values are numeric
                    ]
                };
                 if (xLabelsForMultiFusion.length === 0) { // No data for multi-series
                     dataSourceConfig.chart.caption = dynamicCaption; // Keep main title
                     dataSourceConfig.chart.subCaption = `No History Data for ${selectedKPIName}`;
                     dataSourceConfig.chart.showvalues = "0";
                 }

            } else { // Single-series structure for Fusion (productId 1 or 2)
                if (!finalChartDataForAppsmith || finalChartDataForAppsmith.length === 0) {
                    return { type: fusionChartType, width: "100%", height: "360", dataFormat: "json", dataSource: { chart: { caption: dynamicCaption, subCaption: `No History Data for ${selectedKPIName} (Product ${productId})`, theme: "fusion", showvalues: "0" }, data: [] }};
                }
                const fusionDataSingle = finalChartDataForAppsmith.map(item => ({
                    label: String(item.x),
                    value: Number(item.y) // item.y should be clean number
                }));
                dataSourceConfig = {
                    chart: {
                        caption: dynamicCaption, subCaption: dynamicSubCaption, xAxisName: xAxisName, yAxisName: yAxisName,
                        numberPrefix: (kpiUnit === "$" || kpiUnit === "R$") ? kpiUnit : (selectedKPI.Prefix || ""),
                        numberSuffix: selectedKPI.Suffix || "",
                        theme: "fusion", chartBottomMargin: "40", labelDisplay: "auto", slantLabels: "0",
                    },
                    data: fusionDataSingle
                };
            }

            return {
                type: fusionChartType,
                width: "100%", height: "360", dataFormat: "json",
                dataSource: dataSourceConfig
            };
        }
        
        // Fallback for non-fusionKPI, single product (should be covered by appsmith case)
        return finalChartDataForAppsmith || [];
    },

    debugData(rawData) {
        if (!Array.isArray(rawData)) {
            // console.warn("debugData: rawData is not an array:", rawData);
            return "rawData is not an array.";
        }
        // console.log("Raw data sample (first 3):", rawData.slice(0, 3));
        const invalidDates = rawData.filter(item => !item || !item.ChangedAt || isNaN(new Date(item.ChangedAt).getTime()));
        // console.log("Invalid dates found in rawData:", invalidDates.length);
        if (invalidDates.length > 0) {
            // console.log("Sample invalid dates from rawData (first 5):", invalidDates.slice(0, 5));
        }
        return `Total items: ${rawData.length}, Invalid dates: ${invalidDates.length}`;
    },
	
	getAxisLabel(axis, apiQueryData, selectedKPIName) {
		if (axis === "x") {
				return "Linha de Produtos"; // Product Line
		}

		if (axis === "y") {
				const kpiData = apiQueryData?.data || apiQueryData;

				if (!kpiData || !Array.isArray(kpiData)) {
						// console.warn("getAxisLabel: Invalid API data provided");
						return selectedKPIName || "Valor"; // Value
				}
				const selectedKPI = kpiData.find(kpi => kpi && kpi.Name === selectedKPIName);

				if (!selectedKPI) {
						// console.warn("getAxisLabel: Selected KPI not found in API data:", selectedKPIName);
						return selectedKPIName || "Valor"; // Value
				}
				const unit = selectedKPI.Unit || '';
				return `${selectedKPI.Name} (${unit})`;
		}
		return "";
	}
}