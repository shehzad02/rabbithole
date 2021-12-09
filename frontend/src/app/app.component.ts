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

  isChecked: boolean = false;

  constructor(private httpClient: HttpClient) {}

  ngOnInit() {
    // puts the metadata.json into a map
    this.httpClient.get("assets/metadata.json").subscribe(data => {
      const result = Object.entries(data);
      result.forEach(meta => {
        this.metadata.set(meta[0], meta[1]);
      });
      let it = [...this.metadata.values()];
      for (let index = 0; index < 5; index++) {
        this.filteredOptions.push(it[index]);
      }
      // temporary
      this.suggestions = this.filteredOptions;
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

  DFS(source: Item): void {
    
  }

  BFS(source: Item): void {
    
  }

  getOptionDisplay(option: Item) {
    return option.title;
  }

  selection(event: any) {
    let item: Item = event.option.value;
    this.source = item;
    if (this.isChecked) {
      this.BFS(item);
    } else {
      this.DFS(item);
    }
    this.loadChart();
  }

  viewItem(item: Item) {
    this.source = item;
    if (this.isChecked) {
      this.BFS(item);
    } else {
      this.DFS(item);
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

    series.links.template.distance = 2;
    series.nodes.template.label.text = "{name}";
    series.nodes.template.label.wrap = true;
    // series.nodes.template.tooltipText = "[bold]{value}[/]";
    series.fontSize = 15;
    series.minRadius = 30;
    // series.maxRadius = 40;
  }

}
