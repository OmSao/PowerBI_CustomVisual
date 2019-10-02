
import DataViewObjects = powerbi.extensibility.utils.dataview.DataViewObjects;

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

       private viewModel: ViewModel;

       /*private settings = {
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
       }*/

       private settings = {
        axis: {
            x: {
                padding: {
                    default: 50,
                    value: 50
                },
                show: {
                    default: true,
                    value: true
                },
                color: {
                    default: "#777777",
                    value: "#777777"
                }
            },
            y: {
                padding: {
                    default: 50,
                    value: 50
                },
                show: {
                    default: true,
                    value: true
                },
                color: {
                    default: "#777777",
                    value: "#777777"
                }
            }
        },
        border: {
            top: {
                default: 10,
                value: 10
            },
            bottom: {
                default: 10,
                value: 10
            }
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
           this.updateSettings(options);
           this.viewModel = this.getViewModel(options);

           let width = options.viewport.width;
           let height = options.viewport.height;

           let xAxisPadding = this.settings.axis.x.show.value ? this.settings.axis.x.padding.value : 0;
           let yAxisPadding = this.settings.axis.y.show.value ? this.settings.axis.y.padding.value : 0;
           console.log("height, width:==>", height, width);

           this.svg.attr(
               {
                   width: width,
                   height: height 
                   //fill: "blue"
               }
           );

           d3.select("svg");//.attr("style", "background-color: #FFC300");
           
           //let yScale = d3.scale.linear().domain([0, viewModel.maxValue]).range([height - this.settings.axis.x.padding.value, 0 + this.settings.border.top.value]);
           let yScale = d3.scale.linear().domain([0, this.viewModel.maxValue]).range([height - xAxisPadding, 0 + this.settings.border.top.value]);
           //let xScale = d3.scale.ordinal().domain(viewModel.dataPoints.map(d => d.category)).rangeRoundBands([0, width], this.xPadding);
           //let xScale = d3.scale.ordinal().domain(viewModel.dataPoints.map(d => d.category)).rangeRoundBands([this.settings.axis.y.padding.value, width], this.xPadding);
           let xScale = d3.scale.ordinal().domain(this.viewModel.dataPoints.map(d => d.category)).rangeRoundBands([yAxisPadding, width], this.xPadding);

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
                   //transform: "translate(" + this.settings.axis.y.padding + ", 0)"
                   transform: "translate(" + yAxisPadding + ", 0)"
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
                   //transform: "translate(0, "+(height - this.settings.axis.x.padding.value)+")"
                   transform: "translate(0, "+(height - xAxisPadding)+")"
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

           let bars = this.barGroup.selectAll(".bar").data(this.viewModel.dataPoints);  //bars is an array
           bars.enter().append("rect").classed("bar", true).attr("fill", "#FF5733");

           bars.attr({
                width: xScale.rangeBand(),
                //height: d => height - yScale(d.value) - this.settings.axis.x.padding.value,
                height: d => height - yScale(d.value) - xAxisPadding,
                y: d => yScale(d.value),
                x: d => xScale(d.category)
            })
            .style({
                fill: d => d.colour,
                "fill-opacity": d => this.viewModel.highlights ? d.highlighted ? 1.0 : 0.5 : 1.0
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

        private updateSettings(options: VisualUpdateOptions) {
            this.settings.axis.x.show.value = DataViewObjects.getValue(options.dataViews[0].metadata.objects, { objectName: "xAxis", propertyName: "show" }, this.settings.axis.x.show.default);
            this.settings.axis.x.padding.value = DataViewObjects.getValue(options.dataViews[0].metadata.objects, { objectName: "xAxis", propertyName: "padding" }, this.settings.axis.x.padding.default);
            this.settings.axis.x.color.value = DataViewObjects.getFillColor(options.dataViews[0].metadata.objects, { objectName: "xAxis", propertyName: "color" }, this.settings.axis.x.color.default);
            this.settings.axis.y.show.value = DataViewObjects.getValue(options.dataViews[0].metadata.objects, { objectName: "yAxis", propertyName: "show" }, this.settings.axis.y.show.default);
            this.settings.axis.y.padding.value = DataViewObjects.getValue(options.dataViews[0].metadata.objects, { objectName: "yAxis", propertyName: "padding" }, this.settings.axis.y.padding.default);
            this.settings.axis.y.color.value = DataViewObjects.getFillColor(options.dataViews[0].metadata.objects, { objectName: "yAxis", propertyName: "color" }, this.settings.axis.y.color.default);
            this.settings.border.top.value = DataViewObjects.getValue(options.dataViews[0].metadata.objects, { objectName: "borders", propertyName: "top" }, this.settings.border.top.default);
            this.settings.border.bottom.value = DataViewObjects.getValue(options.dataViews[0].metadata.objects, { objectName: "borders", propertyName: "bottom" }, this.settings.border.bottom.default);
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

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions):
            VisualObjectInstanceEnumeration{
            let propertyGroupName = options.objectName;
            let properties: VisualObjectInstance[] = [];

            switch (propertyGroupName) {

                case "xAxis":
                    properties.push({
                        objectName: propertyGroupName,
                        properties: {
                            show: this.settings.axis.x.show.value, 
                            padding: this.settings.axis.x.padding.value,
                            color: this.settings.axis.x.color.value
                        },
                        selector: null
                    });
                    break;

                case "yAxis":
                    properties.push({
                        objectName: propertyGroupName,
                        properties: {
                            show: this.settings.axis.y.show.value,
                            padding: this.settings.axis.y.padding.value,
                            color: this.settings.axis.y.color.value
                        },
                        selector: null
                    });
                    break;

                case "borders":
                    properties.push({
                        objectName: propertyGroupName,
                        properties: {
                            top: this.settings.border.top.value,
                            bottom: this.settings.border.bottom.value
                        },
                        selector: null
                    });
                    break;

                case "dataColors":
                    if (this.viewModel) {
                        for (let dp of this.viewModel.dataPoints) {
                            properties.push({
                                objectName: propertyGroupName,
                                displayName: dp.category,
                                properties: {
                                    fill: dp.colour
                                },
                                selector: dp.identity.getSelector()
                            })
                        }
                    }
                    break;
            };

            return properties;
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