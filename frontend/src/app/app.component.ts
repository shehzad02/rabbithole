import { AfterViewInit, Component, OnInit } from '@angular/core';
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
export class AppComponent implements OnInit, AfterViewInit {
  metadata = new Map<string, Item>();
  adjGraph = new Map<string, string[]>();
  edgeGraph: any[] = [];

  filteredOptions: Item[] = [];
  suggestions: Item[] = [];
  source: any;
  sourceDist: any;
  destDist: any;

  isChecked: boolean = false;
  searchTime: number = 0;

  constructor(private httpClient: HttpClient) {}

  ngOnInit() {
    // puts the metadata.json into a map
    this.httpClient.get("assets/metadata.json").subscribe(data => {
      const result = Object.entries(data);
      result.forEach(meta => {
        this.metadata.set(meta[0], meta[1]);
      });
      this.loadChart();
    });

    // puts the graph.json into a map
    this.httpClient.get("assets/graph-adj.json").subscribe(adjList => {
      const result = Object.entries(adjList);
      result.forEach(list => {
        this.adjGraph.set(list[0], list[1]);
      });
    });

    this.httpClient.get("assets/graph-edgelist.json").subscribe(edgeList => {
      const result = Object.entries(edgeList);
      result.forEach(edge => {
        this.edgeGraph.push(edge[1]);
      });
    });
  }

  ngAfterViewInit(): void {
    
  }

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

  getOptionDisplay(option: Item) {
    return option.title;
  }

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

  src(event: any) {
    this.sourceDist = event.option.value;
  }

  dest(event: any) {
    this.destDist = event.option.value;
  }

  viewItem(item: Item) {
    this.source = item;
    if (this.isChecked) {
      this.BFSAdj(item);
    } else {
      this.BFSEdge(item);
    }
    this.loadChart();
  }

  filter(event: any) {
    let value: string = event.target.value;
    let count = 0;
    this.filteredOptions = [];
    let items = [...this.metadata.values()];
   
    for (let index = 0; index < items.length; index++) {
      if (items[index].title.toLowerCase().includes(value.toLowerCase())) {
        count++;
        this.filteredOptions.push(items[index]);
      }
      if (count === 10) {
        break;
      } 
    }
  }

  loadChart() {
    let chart = am4core.create('chartdiv',forceDirected.ForceDirectedTree);
    let series = chart.series.push(new forceDirected.ForceDirectedSeries);
    let data: any[] = [];
    this.suggestions.forEach(item => {
      data.push({
        "name": item.title,
        "id": item.id,
        "value": 10,
        "linkWith": item.recommendations_from_here
      });
    });

    if (this.source) {
      data.push({
        "name": this.source.title,
        "id": this.source.id,
        "value": 20,
        "linkWith": this.source.recommendations_from_here
      })
    }

    series.data = data;

    series.dataFields.name = "name";
    series.dataFields.id = "id";
    series.dataFields.value = "value";
    series.dataFields.linkWith = "linkWith";

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
