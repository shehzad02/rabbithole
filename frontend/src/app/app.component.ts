import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import * as _ from "underscore";
import * as internal from 'stream';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import * as forceDirected from "@amcharts/amcharts4/plugins/forceDirected";


export interface Item {
  id: string;
  asin: string;
  title: string;
  group: string;
  salesrank: number;
  num_ratings: number;
  avg_rating: number;
  similar_items: string[];
  recommendations_from_here: string[];
}

export interface Node {
  name: string;
  id: string;
  linkWith: string[];
  value: number;
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  metadata = new Map<string, Item>();
  adjGraph = new Map<string, string[]>();
  edgeGraph: any[] = [];

  suggestions: Item[] = [];
  source: any;
  sourceDist: any;
  destDist: any;
  
  filteredOptions: Item[] = [];
  filteredSrc: Item[] = [];
  filteredDest: Item[] = [];

  isChecked: boolean = false;
  searchTime: number = -1;
  levels: number = -1;

  constructor(private httpClient: HttpClient) {}

  // gets called by angular to initialize all of the json data from
  // the python parser
  ngOnInit() {
    // puts the metadata.json into a map
    this.httpClient.get("assets/metadata.json").subscribe(data => {
      const result = Object.entries(data);
      result.forEach(meta => {
        this.metadata.set(meta[0], meta[1]);
      });
      this.loadChart();
    });

    // puts the graph-adj.json into a map
    this.httpClient.get("assets/graph-adj.json").subscribe(adjList => {
      const result = Object.entries(adjList);
      result.forEach(list => {
        this.adjGraph.set(list[0], list[1]);
      });
    });

    // puts the graph-edgelist into a map
    this.httpClient.get("assets/graph-edgelist.json").subscribe(edgeList => {
      const result = Object.entries(edgeList);
      result.forEach(edge => {
        this.edgeGraph.push(edge[1]);
      });
    });
  }

  // BFS for the edge list. Adds first 20 items to suggested
  BFSEdge(source: Item): void {
    // metadata = new Map<string, Item>()
    // key = vertex ID (string), value = Item object
    // edgeGraph: any[] = [];

    // search through all edges find source (from) node
    // find to node that has not been visited
    let startTime = new Date().getTime();
    this.suggestions = [];

    let count = 0;
    let q : string[] = [];
    const visited = new Set();

    visited.add(source.id);
    q.push(source.id);

    while (q.length > 0) {
      let from = q[0];
      this.suggestions.push(this.metadata.get(q[0])!);
      count++;
      if (count == 20) {
        break;
      }
      q.shift();
      let neighbors : string[] = [];

      // iterate through edgeList to find 'to' vertices from 'from' vertex
      for (let i = 0; i < this.edgeGraph.length; i++) {
        if (this.edgeGraph[i][0] == from) {
          neighbors.push(this.edgeGraph[i][1]);
        }
      }

      try {
        neighbors.length;
      } catch (error) {
        continue;
      }

      for (let v = 0; v < neighbors.length; v++) {
        if (!visited.has(neighbors[v])) {
          visited.add(neighbors[v]);
          q.push(neighbors[v]);
        }
      }
    }
    let endTime = new Date().getTime();
    this.searchTime = endTime - startTime;
  }

  // BFS for the adjacency list. Adds first 20 items to suggested
  BFSAdj(source: Item): void {
    // metadata = new Map<string, Item>()
    // key = vertex ID (string), value = Item object

    // adjGraph = new Map<string, string[]>()
    // key = vertex ID (string), value = adjacent nodes

    // q array is the queue: use push to enqueue, shift to dequeue
    // this.suggestions array is used for identifying vertices
    let startTime = new Date().getTime();
    this.suggestions = [];

    let count = 0;
    let q : string[] = [];
    const visited = new Set();

    visited.add(source.id);
    q.push(source.id);

    while (q.length > 0) {
      let u = q[0];
      this.suggestions.push(this.metadata.get(q[0])!);
      count++;
      if (count == 20) {
        break;
      }
      q.shift();
      let neighbors : string[] = this.adjGraph.get(u)!;
      try {
        neighbors.length;
      } catch (error) {
        continue;
      }
      for (let v = 0; v < neighbors.length; v++) {
        if (!visited.has(neighbors[v])) {
          visited.add(neighbors[v]);
          q.push(neighbors[v]);
        }
      }
    }
    let endTime = new Date().getTime();
    this.searchTime = endTime - startTime;
  }

  // These 3 functions are used by the mat-autocomplete html elements
  // to display a json object properly
  getOptionDisplay(option: Item) {
    return option.title;
  }

  getSrcDisplay(option: Item) {
    return option.title;
  }

  getDestDisplay(option: Item) {
    return option.title;
  }

  // these 3 function are called when one of the autocomplete dropdown options are selected
  // for the corresponding search bars. it updates the source/sourceDist/destDist
  // item and calls the relevent search 
  selection(event: any) {
    let item: Item = event.option.value;
    this.source = item;
    if (this.isChecked) {
      this.BFSAdj(item);
    } else {
      this.BFSEdge(item);
    }
    this.loadChart();
  }

  // these two functions only require setting the corresponding item variables based on the selection made
  src(event: any) {
    this.sourceDist = event.option.value;
    this.levels = -1;
  }

  dest(event: any) {
    this.destDist = event.option.value;
    this.levels = -1;
  }

  // this method calculates the number of suggestions between two items selected
  // it is just a BFS using the adjacency list with an inner while loop to calculate level
  // this function is called when the button for finding distance is pressed
  calcDist() {
    if (!this.sourceDist || !this.destDist) {
      return;
    }

    let levels = 1;
    let q : string[] = [];
    const visited = new Set();

    visited.add(this.sourceDist.id);
    q.push(this.sourceDist.id);

    while (q.length > 0) {
      let levelSize = q.length;
      while (levelSize-- > 0) {
        let u = q[0];
        q.shift();
        let neighbors : string[] = this.adjGraph.get(u)!;

        try {
          neighbors.length;
        } catch (error) {
          continue;
        }

        for (let v = 0; v < neighbors.length; v++) {
          if (!visited.has(neighbors[v])) {
            if (neighbors[v] == this.destDist.id) {
              this.levels = levels;
              return;
            }
            visited.add(neighbors[v]);
            q.push(neighbors[v]);
          }
        }
      }
      levels++;
    }
    this.levels = levels;
  }

  // this performs the same function as selection but is called by pressing the item card button
  // and takes in a different kind input
  viewItem(item: Item) {
    this.source = item;
    if (this.isChecked) {
      this.BFSAdj(item);
    } else {
      this.BFSEdge(item);
    }
    this.loadChart();
  }

  // these 3 functions update and filter their relevent array of items based on what the user typed
  filter(event: any) {
    let count = 0;

    // store the search bar input
    let value: string = event.target.value;

    // clear the filtered options and turn the item map into an array
    this.filteredOptions = [];
    let items = [...this.metadata.values()];
   
    // loop through the item array and push to filteredOptions if item title has a match to the search term
    for (let index = 0; index < items.length; index++) {
      if (items[index].title.toLowerCase().includes(value.toLowerCase())) {
        count++;
        this.filteredOptions.push(items[index]);
      }
      // once there are 10, stop
      if (count === 10) {
        break;
      } 
    }
  }

  filterSrc(event: any) {
    let value: string = event.target.value;
    let count = 0;
    this.filteredSrc = [];
    let items = [...this.metadata.values()];
   
    for (let index = 0; index < items.length; index++) {
      if (items[index].title.toLowerCase().includes(value.toLowerCase())) {
        count++;
        this.filteredSrc.push(items[index]);
      }
      if (count === 10) {
        break;
      } 
    }
  }

  filterDest(event: any) {
    let value: string = event.target.value;
    let count = 0;
    this.filteredDest = [];
    let items = [...this.metadata.values()];
   
    for (let index = 0; index < items.length; index++) {
      if (items[index].title.toLowerCase().includes(value.toLowerCase())) {
        count++;
        this.filteredDest.push(items[index]);
      }
      if (count === 10) {
        break;
      } 
    }
  }

  // this method is used to create the graph chart powered by amcharts4
  // it is called after a selection is made and a BFS is performed
  loadChart() {
    // link the chart to the html div with the chartdiv id and add defaults
    let chart = am4core.create('chartdiv',forceDirected.ForceDirectedTree);
    let series = chart.series.push(new forceDirected.ForceDirectedSeries);

    // parse the data from the suggested items list into a format that amcharts understands
    let data: any[] = [];
    this.suggestions.forEach(item => {
      data.push({
        "name": item.title,
        "id": item.id,
        "value": 10,
        "linkWith": item.recommendations_from_here
      });
    });

    // make the source bubble bigger
    data[0].value = 20;

    // assign the data
    series.data = data;

    // define the field names to correspond with data creation above
    series.dataFields.name = "name";
    series.dataFields.id = "id";
    series.dataFields.value = "value";
    series.dataFields.linkWith = "linkWith";

    // adjustments to the look and feel of the chart
    series.centerStrength = 0.5;

    series.links.template.distance = 3;
    series.links.template.strength = .5;
    series.links.template.strokeWidth = 5;
    series.nodes.template.label.text = "{name}";
    series.nodes.template.label.wrap = true;
    series.fontSize = 15;
    series.minRadius = 30;
  }

}
