

module powerbi.extensibility.visual {
    "use strict";
    interface DataPoint {
        category: string;
        value: number;
        colour: string;
        identity: powerbi.visuals.ISelectionId;
        highlighted: boolean;
    };
    interface ViewModel {
        dataPoints: DataPoint[];
        maxValue: number;  
        highlights: boolean;
    };
    export class Visual implements IVisual {
        /*private target: HTMLElement;
        private updateCount: number;
        private settings: VisualSettings;
        private textNode: Text;
        */
       private host: IVisualHost;
       private svg: d3.Selection<SVGElement>;
       private barGroup: d3.Selection<SVGElement>;
       private xPadding: number = 0.1;
       private selectionManager: ISelectionManager;
       private xAxisGroup: d3.Selection<SVGElement>;
       private yAxisGroup: d3.Selection<SVGElement>;

       private settings = {
           axis: {
               x: {
                   padding: 50
               },
               y: {
                   padding: 50
               }
           },
           border: {
               top: 10
           }
       }

        constructor(options: VisualConstructorOptions) {
            /*console.log('Visual constructor', options);
            this.target = options.element;
            this.updateCount = 0;
            if (typeof document !== "undefined") {
                const new_p: HTMLElement = document.createElement("p");
                new_p.appendChild(document.createTextNode("Update count:"));
                const new_em: HTMLElement = document.createElement("em");
                this.textNode = document.createTextNode(this.updateCount.toString());
                new_em.appendChild(this.textNode);
                new_p.appendChild(new_em);
                this.target.appendChild(new_p);
            }*/
            this.host = options.host;
            this.svg = d3.select(options.element)
                .append("svg")
                .classed("my-little-bar-chart", true);
            this.barGroup = this.svg.append("g")
                .classed("bar-group", true);
            this.xAxisGroup = this.svg.append("g")
                .classed("x-axis", true);
            this.yAxisGroup = this.svg.append("g")
                .classed("y-axis", true);

            this.selectionManager = this.host.createSelectionManager();
        }

        public update(options: VisualUpdateOptions) {  //function in PowerBI is called whenever there is something to update, it's in this function where we will draw the chart as many times as we need. 
            /*this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
            console.log('Visual update', options);
            if (typeof this.textNode !== "undefined") {
                this.textNode.textContent = (this.updateCount++).toString();
            }*/
            /*let sample: DataPoint[] = [
                {
                    category: "Apples",
                    value: 20,
                    colour: "blue"
                },
                {
                    category: "Bananas",
                    value: 20,
                    colour: "grey"
                },
                {
                    category: "Cherries",
                    value: 30,
                    colour: "yellow"
                },
                {
                    category: "Dates",
                    value: 40,
                    colour: "blue"
                },
                {
                    category: "Elderberries",
                    value: 50,
                    colour: "red"
                }

           ];

        let viewModel: ViewModel = {
            dataPoints: sample,
            maxValue: d3.max(sample, x => x.value)
        };*/

        let viewModel = this.getViewModel(options);

           let width = options.viewport.width;
           let height = options.viewport.height;
           console.log("height, width:==>", height, width);

           this.svg.attr(
               {
                   width: width,
                   height: height 
                   //fill: "blue"
               }
           );

           d3.select("svg");//.attr("style", "background-color: #FFC300");
           
           let yScale = d3.scale.linear().domain([0, viewModel.maxValue]).range([height - this.settings.axis.x.padding, 0 + this.settings.border.top]);
           //let xScale = d3.scale.ordinal().domain(viewModel.dataPoints.map(d => d.category)).rangeRoundBands([0, width], this.xPadding);
           let xScale = d3.scale.ordinal().domain(viewModel.dataPoints.map(d => d.category)).rangeRoundBands([this.settings.axis.y.padding, width], this.xPadding);

           let yAxis = d3.svg.axis()
               .scale(yScale)
               .orient("left")
               .tickSize(1);

           let xAxis = d3.svg.axis()
               .scale(xScale)
               .orient("bottom")
               .tickSize(1);

            this.yAxisGroup
               .call(yAxis)
               .attr({
                   transform: "translate(" + this.settings.axis.y.padding + ", 0)"
               })
               .style({
                   fill: "#777777"
               })
               .selectAll("text")
               .style({
                "text-anchor": "end",
                "font-size": "x-small"
            });
            //xAxis(this.xAxisGroup);
            this.xAxisGroup
               .call(xAxis)
               .attr({
                   transform: "translate(0, "+(height - this.settings.axis.x.padding)+")"
               })
               .style({
                   fill: "#777777"
               })
               .selectAll("text")
               .attr({
                   transform: "rotate(-35)"
               })
               .style({
                   "text-anchor": "end",
                   "font-size": "x-small"
               });

           let bars = this.barGroup.selectAll(".bar").data(viewModel.dataPoints);  //bars is an array
           bars.enter().append("rect").classed("bar", true).attr("fill", "#FF5733");

           bars.attr({
                width: xScale.rangeBand(),
                height: d => height - yScale(d.value) - this.settings.axis.x.padding,
                y: d => yScale(d.value),
                x: d => xScale(d.category)
            })
            .style({
                fill: d => d.colour,
                "fill-opacity": d => viewModel.highlights ? d.highlighted ? 1.0 : 0.5 : 1.0
            })
            .on("click", (d) => {
                this.selectionManager.select(d.identity, true).
                then(ids =>{
                    bars.style({
                        //"fill-opacity": ids.length > 0 ? 0.5 : 1.0
                        "fill-opacity": ids.length > 0 ?
                        d => ids.indexOf(d.identity) >= 0 ? 1.0 : 0.5
                        : 1.0
                    });
                });

            });

            bars.exit().remove();



        }

        private getViewModel(options: VisualUpdateOptions): ViewModel{
            let dv = options.dataViews; //options is of type VisualUpdateOptions which holds information about viewport height/width/dataViews
            let viewModel: ViewModel = {
                dataPoints: [],
                maxValue: 0,
                highlights: false
            }; //declared as holding no values

            if (!dv
                || !dv[0]
                || !dv[0].categorical
                || !dv[0].categorical.categories
                || !dv[0].categorical.categories[0].source
                || !dv[0].categorical.values
                || !dv[0].metadata)
                return viewModel;

            let view = dv[0].categorical; //view contains the fetched data from the PBI's UI data options
            let categories = view.categories[0];
            let values = view.values[0];
            let highlights = values.highlights;

            console.log("categories:==>", categories);
            console.log("values:==>", values);
            
            for (let i = 0, len = Math.max(categories.values.length, values.values.length); i < len; i++) {
                viewModel.dataPoints.push({
                    category: <string>categories.values[i],
                    value: <number>values.values[i],
                    colour: this.host.colorPalette.getColor(<string>categories.values[i]).value,
                    identity: this.host.createSelectionIdBuilder()
                        .withCategory(categories, i)
                        .createSelectionId(),
                    highlighted: highlights ? highlights[i] ? true : false : false
                });
            }

            viewModel.maxValue = d3.max(viewModel.dataPoints, d => d.value);
            viewModel.highlights = viewModel.dataPoints.filter(d => d.highlighted).length > 0;



            return viewModel;
            //return null;
        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        /** 
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the 
         * objects and properties you want to expose to the users in the property pane.
         * 
         */
        /*public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
        }*/
    }
}