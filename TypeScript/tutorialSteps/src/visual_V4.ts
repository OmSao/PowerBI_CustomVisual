

module powerbi.extensibility.visual {
    "use strict";
    interface DataPoint {
        category: string;
        value: number;
        colour: string;
    };
    interface ViewModel {
        dataPoints: DataPoint[];
        maxValue: number;  
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

           d3.select("svg").attr("style", "background-color: #FFC300");
           
           let yScale = d3.scale.linear().domain([0, viewModel.maxValue]).range([height, 0]);
           let xScale = d3.scale.ordinal().domain(viewModel.dataPoints.map(d => d.category)).rangeRoundBands([0, width], this.xPadding);

           let bars = this.barGroup.selectAll(".bar").data(viewModel.dataPoints);  //bars is an array
           bars.enter().append("rect").classed("bar", true).attr("fill", "#FF5733");

           bars.attr({
                width: xScale.rangeBand(),
                height: d => height - yScale(d.value),
                y: d => yScale(d.value),
                x: d => xScale(d.category)
            })
            .style({
                fill: d => d.colour
            });

            bars.exit().remove();



        }

        private getViewModel(options: VisualUpdateOptions): ViewModel{
            let dv = options.dataViews; //options is of type VisualUpdateOptions which holds information about viewport height/width/dataViews
            let viewModel: ViewModel = {
                dataPoints: [],
                maxValue: 0
            };

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
            
            for (let i = 0, len = Math.max(categories.values.length, values.values.length); i < len; i++) {
                viewModel.dataPoints.push({
                    category: <string>categories.values[i],
                    value: <number>values.values[i],
                    colour: this.host.colorPalette.getColor(<string>categories.values[i]).value
                });
            }

            viewModel.maxValue = d3.max(viewModel.dataPoints, d => d.value);



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